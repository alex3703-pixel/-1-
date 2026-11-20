const { Redis } = require("@upstash/redis");

const json = (res, status, body) => res.status(status).json(body);

async function enforceLimits(req) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("RATE_LIMIT_NOT_CONFIGURED");

  const redis = new Redis({ url, token });
  const today = new Date().toISOString().slice(0, 10);
  const forwarded = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || "unknown";
  const crypto = require("crypto");
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24);

  const ipKey = `jasoseo:ip:${today}:${ipHash}`;
  const globalKey = `jasoseo:global:${today}`;
  const [ipCount, globalCount] = await Promise.all([
    redis.incr(ipKey),
    redis.incr(globalKey)
  ]);
  if (ipCount === 1) await redis.expire(ipKey, 86400 * 2);
  if (globalCount === 1) await redis.expire(globalKey, 86400 * 2);

  const perIpLimit = Number(process.env.DAILY_LIMIT_PER_IP || 5);
  const globalLimit = Number(process.env.DAILY_GLOBAL_LIMIT || 100);
  if (ipCount > perIpLimit) return { ok: false, reason: "오늘 사용할 수 있는 생성 횟수를 초과했습니다. 내일 다시 이용해 주세요." };
  if (globalCount > globalLimit) return { ok: false, reason: "오늘 서비스 전체 생성 한도에 도달했습니다. 내일 다시 이용해 주세요." };
  return { ok: true };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "POST 요청만 허용됩니다." });
  const { provider, prompt } = req.body || {};
  if (!["anthropic", "openai"].includes(provider)) return json(res, 400, { error: "지원하지 않는 AI 제공사입니다." });
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 16000) return json(res, 400, { error: "요청 내용은 1~16,000자 사이여야 합니다." });

  const apiKey = provider === "anthropic" ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
  if (!apiKey) return json(res, 503, { error: "선택한 AI 서비스가 아직 설정되지 않았습니다. 운영자에게 문의해 주세요." });

  try {
    const limit = await enforceLimits(req);
    if (!limit.ok) return json(res, 429, { error: limit.reason });
  } catch (e) {
    return json(res, 503, { error: "서비스 보호 설정이 완료되지 않았습니다. 잠시 후 다시 이용해 주세요." });
  }

  try {
    let text = "";
    if (provider === "anthropic") {
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
          max_tokens: 2500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return json(res, 502, { error: data?.error?.message || "Claude 요청에 실패했습니다." });
      text = (data.content || []).filter(x => x.type === "text").map(x => x.text).join("\n");
    } else {
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5-mini",
          input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
          max_output_tokens: 2500
        })
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return json(res, 502, { error: data?.error?.message || "OpenAI 요청에 실패했습니다." });
      text = data.output_text || (data.output || []).flatMap(item => item.content || []).filter(x => x.type === "output_text").map(x => x.text).join("\n");
    }
    if (!text) return json(res, 502, { error: "AI 응답에서 텍스트를 찾지 못했습니다." });
    return json(res, 200, { text });
  } catch (e) {
    return json(res, 502, { error: "AI 제공사에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." });
  }
};

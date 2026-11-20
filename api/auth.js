const crypto = require("crypto");

function safeEqual(a, b) {
  const ah = crypto.createHash("sha256").update(String(a)).digest();
  const bh = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ah, bh);
}
function sign(exp, secret) {
  return crypto.createHmac("sha256", secret).update(String(exp)).digest("base64url");
}
function getCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return "";
}
function validSession(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const token = getCookie(req, "jasoseo_session");
  const [expText, signature] = token.split(".");
  const exp = Number(expText);
  if (!expText || !signature || !Number.isFinite(exp) || exp < Date.now()) return false;
  return safeEqual(signature, sign(expText, secret));
}
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Cookie");
  if (req.method === "GET") {
    return res.status(200).json({ authenticated: validSession(req) });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "GET 또는 POST 요청만 허용됩니다." });
  const expected = process.env.SITE_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret) return res.status(503).json({ error: "운영자 비밀번호 설정이 아직 완료되지 않았습니다." });
  const supplied = typeof req.body?.password === "string" ? req.body.password : "";
  if (!supplied || !safeEqual(supplied, expected)) {
    return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
  }
  const exp = String(Date.now() + 12 * 60 * 60 * 1000);
  const token = `${exp}.${sign(exp, secret)}`;
  res.setHeader("Set-Cookie", `jasoseo_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
  return res.status(200).json({ authenticated: true });
};

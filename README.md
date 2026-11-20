# 자소서 자동완성 — 운영자 API 키 방식

방문자는 API 키를 입력하지 않습니다. 운영자가 Vercel 환경변수에 등록한 Claude/OpenAI API 키를 사용하고, AI 사용료는 운영자 계정에 청구됩니다.

## 포함 기능
- 문항 입력 / 인생사로 쓰기
- Claude 또는 OpenAI 선택
- 서버에서 API 키 보관 (브라우저에 키 노출하지 않음)
- IP별 일일 5회, 전체 일일 100회 제한 (기본값)
- Upstash Redis 기반 제한 카운터
- 모바일 반응형, 글자 수 표시, 복사 기능

## 배포 준비
1. GitHub 저장소를 만들고 이 프로젝트 파일을 업로드합니다.
2. Vercel에서 저장소를 Import해 배포합니다.
3. Upstash에서 Redis 데이터베이스를 만들고 REST URL 및 REST Token을 발급합니다.
4. Vercel 프로젝트 Settings → Environment Variables에 아래 값을 등록합니다.

필수 환경변수:
- `ANTHROPIC_API_KEY` : Anthropic API 키
- `OPENAI_API_KEY` : OpenAI API 키
- `UPSTASH_REDIS_REST_URL` : Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` : Upstash Redis REST Token

선택 환경변수:
- `DAILY_LIMIT_PER_IP` : IP당 일일 생성 제한 (기본 5)
- `DAILY_GLOBAL_LIMIT` : 전체 일일 생성 제한 (기본 100)
- `ANTHROPIC_MODEL` : 기본 `claude-sonnet-4-5`
- `OPENAI_MODEL` : 기본 `gpt-5-mini`

환경변수를 등록하거나 수정한 뒤에는 Redeploy 해야 반영됩니다.

## 비용과 제한
- Vercel/Upstash 무료 플랜은 각 서비스의 무료 한도 내에서만 0원입니다. 요금과 한도는 바뀔 수 있습니다.
- Claude/OpenAI API는 별도 과금될 수 있습니다. 구독형 Claude/ChatGPT 요금제와 API 결제는 별개입니다.
- 기본 제한은 IP당 하루 5회, 전체 하루 100회입니다. 전체 한도는 UTC 날짜 기준으로 초기화됩니다.
- 이 제한은 초기 악용 방지 장치이며 완벽한 봇 방지 수단은 아닙니다. 공개 전에 API 공급자 대시보드에서 월 예산/사용량 알림 또는 지출 한도를 설정하세요.
- 운영자가 AI 사용료를 부담하는 공개 서비스이므로, 예산 초과 방지를 위해 한도를 낮게 시작하는 것이 좋습니다.

## 실행
Vercel에서 GitHub 저장소를 Import해 배포하는 것을 권장합니다. 로컬 테스트는:

```bash
npm install
npm install -g vercel
vercel dev
```

## 보안
- API 키는 서버 환경변수에만 둡니다. HTML/브라우저 코드/GitHub에 절대 입력하지 마세요.
- 사용자 IP는 Redis 제한 키를 만들 때 SHA-256 해시로 변환합니다.
- 이 버전은 사용자의 입력 내용이나 생성 결과를 DB에 저장하지 않습니다.
- 이용자에게 민감정보를 입력하지 말라고 안내하세요.
- 개인정보 처리방침, 이용약관, AI 제공사 약관을 검토한 뒤 공개하세요.

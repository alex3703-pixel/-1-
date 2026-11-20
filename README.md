# 자소서 자동완성 — 비밀번호 초대형 공개 서비스

방문자는 운영자가 알려준 공통 비밀번호로 입장합니다. 로그인 계정이나 개별 회원가입은 없습니다.

## 기능
- 공통 비밀번호 인증 화면
- 인증 성공 시 12시간 유효한 HttpOnly/Secure/SameSite 쿠키 발급
- AI 생성 API에서도 서버가 쿠키 서명을 재검증 (화면만 숨기는 방식이 아님)
- Claude / OpenAI 선택
- 운영자 API 키는 Vercel 환경변수에 보관
- IP별 하루 5회, 전체 하루 100회 생성 제한 (기본값)
- Upstash Redis 사용량 관리
- 사용자의 자기소개서 내용을 DB에 저장하지 않음

## 배포 전 주의
- 공통 비밀번호를 아는 사람은 누구나 입장할 수 있습니다. 비밀번호를 전달한 사람이 다른 사람에게 공유할 수 있으므로 완전한 개인별 통제는 아닙니다.
- 비밀번호를 바꾸면 기존 쿠키는 SESSION_SECRET을 바꾸고 재배포하여 만료시키는 것이 좋습니다.
- 이 기본 비밀번호 방식은 소규모 초대 사용자용입니다. 민감한 문서나 고위험 정보 보호 용도로 사용하지 마세요.
- GitHub에 비밀번호, API 키, SESSION_SECRET을 절대 올리지 마세요.

## Vercel 환경변수
필수:
- `SITE_PASSWORD`: 공유할 접속 비밀번호
- `SESSION_SECRET`: 최소 32바이트의 무작위 비밀 문자열
- `ANTHROPIC_API_KEY`: Anthropic API 키
- `OPENAI_API_KEY`: OpenAI API 키
- `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST Token

선택:
- `DAILY_LIMIT_PER_IP`: 기본 5
- `DAILY_GLOBAL_LIMIT`: 기본 100
- `ANTHROPIC_MODEL`: 기본 `claude-sonnet-4-5`
- `OPENAI_MODEL`: 기본 `gpt-5-mini`

SESSION_SECRET 생성 예시 (PowerShell):
```powershell
-join ((1..64 | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) }))
```
더 강한 무작위 문자열은 로컬 Node.js에서 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 실행으로 생성하세요.

## 배포
1. GitHub 저장소 루트에 이 프로젝트 파일을 업로드합니다.
2. Vercel에서 저장소를 Import합니다.
3. Upstash Redis를 만들고 REST URL/Token을 복사합니다.
4. Vercel Project → Settings → Environment Variables에 위 필수 변수를 등록합니다.
5. Redeploy 합니다.

환경변수 변경은 새 배포에만 반영됩니다.

## 제한 및 비용
- Vercel/Upstash 무료 플랜의 한도 안에서만 무료입니다.
- Claude/OpenAI API는 사용량에 따라 운영자에게 과금됩니다.
- 기본 사용 제한은 IP당 하루 5회, 전체 하루 100회이며 UTC 날짜 기준입니다. 운영 전 더 낮게 설정할 수 있습니다.
- IP 제한은 간단한 비용 보호 장치이지 완벽한 봇 차단은 아닙니다. AI 제공사 대시보드에서도 예산 알림/사용 한도를 설정하세요.

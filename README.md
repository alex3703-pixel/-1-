# 자소서 자동완성 — 무료 우선 ChatGPT 연동 방식

이 버전은 운영자 API 키를 사용하지 않습니다. 방문자가 웹사이트에서 입력한 내용을 바탕으로 ChatGPT에 붙여넣을 프롬프트를 생성합니다.

## 이용 흐름
1. 초대받은 사용자가 공통 비밀번호 입력
2. 지원 회사, 직무, 자기소개서 문항, 실제 경험 입력
3. 웹사이트가 ChatGPT용 프롬프트 생성
4. 프롬프트 복사 후 ChatGPT 열기
5. 사용자가 ChatGPT에 붙여넣고 답변 생성

## 비용
- 이 웹사이트는 OpenAI API 또는 Anthropic API를 호출하지 않습니다.
- 운영자의 AI API 사용료는 0원입니다.
- 방문자는 자신의 ChatGPT 계정/요금제의 사용 가능 범위 내에서 ChatGPT를 이용합니다. 각 이용자의 계정 한도에 따라 사용량 제한이 있을 수 있습니다.
- Vercel 호스팅도 무료 플랜의 조건과 한도 안에서만 무료입니다.

## Vercel 환경변수
필수:
- `SITE_PASSWORD`: 친구들에게 공유할 공통 접속 비밀번호
- `SESSION_SECRET`: 세션 쿠키 서명용 무작위 비밀 문자열 (최소 32바이트 권장)

더 이상 필요하지 않은 환경변수:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

기존 Vercel 프로젝트에 위 불필요한 변수가 등록되어 있다면 삭제해도 됩니다. `SITE_PASSWORD`, `SESSION_SECRET`은 반드시 등록해야 합니다.

## 배포
1. GitHub 저장소 루트의 파일을 이 버전으로 교체합니다.
2. `api/auth.js`와 `index.html`이 포함되어 있는지 확인합니다.
3. Vercel에서 GitHub 연동 배포를 진행합니다.
4. Project Settings → Environment Variables에서 `SITE_PASSWORD`, `SESSION_SECRET`을 설정합니다.
5. Redeploy 합니다.

## 보안 및 한계
- 비밀번호는 Vercel 서버 환경변수에만 보관하고 GitHub에 올리지 않습니다.
- 인증은 서버가 서명한 HttpOnly 쿠키로 처리합니다.
- 이 버전은 사용자 입력이나 생성된 프롬프트를 서버 데이터베이스에 저장하지 않습니다.
- 공통 비밀번호를 아는 사람은 다른 사람에게도 전달할 수 있습니다.
- 프롬프트 생성은 이 웹사이트 안에서 AI 결과를 생성하는 것이 아닙니다. ChatGPT에서 사용자가 직접 실행합니다.

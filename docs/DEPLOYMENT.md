# DeepDev 배포 가이드

## 환경 분리

| 환경 | 용도 |
|------|------|
| **dev** | 로컬 개발 (`.env`) |
| **staging** | 배포 전 검증 (선택) |
| **production** | 실제 서비스 |

## 프로덕션 체크리스트

### 1. 환경 변수 (필수)

- `JWT_SECRET`: 32자 이상 강력한 랜덤 문자열
- `DATABASE_URL`: 프로덕션 DB 연결 문자열
- `CORS_ORIGIN`: 웹 도메인 (쉼표로 복수 허용)
- `NEXT_PUBLIC_SITE_URL`: 실제 사이트 URL
- `NEXT_PUBLIC_API_URL`: API 서버 URL
- Lemon Squeezy: 프로덕션 스토어 키

### 2. 헬스체크

- `GET /api/health` — DB 연결 상태 확인
- 모니터링/업타임 체크에 활용

### 3. 보안

- `.env` 파일은 절대 git에 커밋하지 않기
- Vercel/Railway 등 플랫폼의 Secrets 사용

### 4. OG 이미지 (SNS 공유)

- `public/og-image.png` (1200×630) 사용

### 5. 모니터링 (Sentry)

- **API**: `SENTRY_DSN` — 5xx 에러 자동 수집
- **Web**: `NEXT_PUBLIC_SENTRY_DSN` — 브라우저 에러, React 렌더 오류 수집  
  - DSN 미설정 시 비활성화
- **Source maps** (선택): CI에 `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` 설정 시 소스맵 업로드

### 6. 가용성 모니터링 (Uptime)

- UptimeRobot, Pingdom 등에서 `GET /api/health` 주기 호출 (예: 5분)
- Web: `https://your-web.vercel.app` / API: `https://your-api.../api/health` 모니터 등록
- 다운 시 이메일/Slack 알림

### 7. Rate Limiting

- `THROTTLE_TTL`, `THROTTLE_LIMIT` — 기본 분당 100회
- Lemon Squeezy webhook은 제한 제외

### 8. 보안 헤더 (Helmet)

- XSS, clickjacking 등 기본 보안 헤더 자동 적용

### 9. DB 백업

- **Railway**: DB 서비스 → Backups 탭에서 자동 백업 설정
- **Neon**: 대시보드 Backups 메뉴 확인
- **기타**: pg_dump + 스토리지 업로드 스크립트 (GitHub Actions 등)

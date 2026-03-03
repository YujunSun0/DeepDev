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

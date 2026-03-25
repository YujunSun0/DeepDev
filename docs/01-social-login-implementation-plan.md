# 1. 소셜 로그인 구현 계획

> 실 사용자 피드백 반영 - DeepDev 고도화 1단계

---

## 1. 개요

### 1.1 목표
- Google, GitHub OAuth를 통한 소셜 로그인 지원
- 기존 이메일/비밀번호 로그인과 병행 운영
- 동일 이메일 계정 연동(Account Linking) 지원

### 1.2 현재 인증 구조
- **API**: NestJS + Passport(JWT) + bcrypt
- **Web**: Next.js, localStorage 기반 토큰 저장
- **User 모델**: `passwordHash` 필수, 이메일 인증 필수

---

## 2. DB 스키마 변경

### 2.1 User 모델 수정 (`prisma/schema.prisma`)

```prisma
model User {
  id                 String   @id @default(uuid())
  email              String   @unique
  passwordHash       String?  @map("password_hash")   // Optional: OAuth 사용자는 null
  name               String?
  avatarUrl          String?  @map("avatar_url")      // NEW: 프로필 이미지
  authProvider       String?  @map("auth_provider")   // NEW: "email" | "google" | "github"
  authProviderId     String?  @map("auth_provider_id") // NEW: OAuth provider의 고유 ID
  emailVerified      Boolean  @default(false) @map("email_verified")
  // ... 기존 필드 유지

  @@index([authProvider, authProviderId])  // OAuth 조회용 복합 인덱스
}
```

### 2.2 마이그레이션 전략
- `passwordHash` → `String?` 변경 시 기존 사용자 데이터 유지
- `authProvider` 기본값: 기존 사용자는 `"email"`로 마이그레이션 스크립트 적용
- 신규 OAuth 사용자: `emailVerified: true` (OAuth 제공자가 이미 검증함)

---

## 3. API 구현

### 3.1 패키지 설치

```bash
cd apps/api
npm install @nestjs/passport passport-google-oauth20 passport-github2
npm install -D @types/passport-google-oauth20 @types/passport-github2
```

### 3.2 환경 변수 (`.env`)

```env
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://api.deepdev.info/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://api.deepdev.info/api/auth/github/callback

# 프론트엔드 리다이렉트 (콜백 후 이동할 URL)
FRONTEND_URL=https://deepdev.info
```

### 3.3 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/auth/google` | Google 로그인 페이지로 리다이렉트 |
| GET | `/auth/google/callback` | Google 콜백, JWT 발급 후 프론트 리다이렉트 |
| GET | `/auth/github` | GitHub 로그인 페이지로 리다이렉트 |
| GET | `/auth/github/callback` | GitHub 콜백, JWT 발급 후 프론트 리다이렉트 |

### 3.4 파일 구조

```
apps/api/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── jwt.strategy.ts
├── google.strategy.ts      # NEW
├── github.strategy.ts      # NEW
├── guards/
│   └── google-auth.guard.ts   # NEW (선택)
└── dto/
    └── index.ts
```

### 3.5 구현 흐름

```
[클라이언트] → GET /auth/google
     ↓
[API] Passport Google Strategy → Google 로그인 페이지
     ↓
[사용자] Google 로그인 완료
     ↓
[Google] → GET /auth/google/callback?code=xxx
     ↓
[API] GoogleStrategy.validate() → 프로필 조회
     ↓
[AuthService] findOrCreateOAuthUser(provider, profile)
     - providerId로 기존 사용자 조회
     - 없으면 email로 조회 → 있으면 provider 정보 업데이트 (Account Linking)
     - 없으면 신규 생성 (emailVerified: true)
     ↓
[API] JWT 발급 → redirect: FRONTEND_URL/login?token=xxx
```

### 3.6 Account Linking 정책
- **같은 이메일 + 다른 provider**: 기존 계정에 `authProvider`, `authProviderId` 추가
- **이메일 미제공 provider** (일부 GitHub 설정): 별도 처리 또는 이메일 요청 플로우

---

## 4. Web(프론트엔드) 구현

### 4.1 로그인 페이지 수정 (`apps/web/src/app/login/page.tsx`)

- 이메일/비밀번호 폼 **위** 또는 **아래**에 소셜 로그인 버튼 배치
- 구분선: "또는" (OR divider)

```tsx
{/* 소셜 로그인 */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-200" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="bg-white px-2 text-gray-500">또는</span>
  </div>
</div>
<div className="space-y-3">
  <a
    href={`${API_URL}/auth/google`}
    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 ..."
  >
    <GoogleIcon /> Google로 계속하기
  </a>
  <a
    href={`${API_URL}/auth/github`}
    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 ..."
  >
    <GitHubIcon /> GitHub로 계속하기
  </a>
</div>
```

### 4.2 OAuth 콜백 처리

- **방법 A**: `/login?token=xxx` 쿼리로 리다이렉트 → `login/page.tsx`에서 `token` 존재 시 `saveAuth()` 후 `/dashboard` 이동
- **방법 B**: 전용 `/auth/callback` 페이지 생성 → `token` 검증 후 저장 및 리다이렉트

### 4.3 auth.ts 확장

```ts
// OAuth 콜백에서 토큰으로 로그인 처리
export function loginWithToken(accessToken: string, user: AuthUser): void {
  saveAuth({ accessToken, user });
}
```

---

## 5. CORS 및 보안

### 5.1 CORS
- OAuth는 **브라우저 리다이렉트**이므로 API 도메인으로 직접 이동
- 콜백 후 `FRONTEND_URL`로 리다이렉트 시 **같은 사이트**이므로 CORS 이슈 없음

### 5.2 state 파라미터
- CSRF 방지를 위해 Passport OAuth 전략에서 `state` 사용 (기본 지원)
- `passport-google-oauth20`, `passport-github2`는 state 옵션 지원

### 5.3 세션 vs JWT
- 현재 JWT 방식 유지: 콜백 시 JWT를 쿼리로 전달
- **보안**: `?token=xxx`는 브라우저 히스토리/Referer에 노출될 수 있음
  - **권장**: 콜백 페이지를 API에서 서빙하고, `HttpOnly` 쿠키로 토큰 설정 후 `Location` 리다이렉트
  - 또는: 짧은 유효기간의 `code`를 쿼리로 전달 → 프론트에서 `POST /auth/exchange`로 JWT 교환 (더 안전)

---

## 6. 구현 순서 (체크리스트)

### Phase 1: DB & 인프라 ✅
- [x] User 스키마 수정 (passwordHash optional, authProvider, authProviderId, avatarUrl)
- [x] 마이그레이션 생성 (`prisma/migrations/20260323091003_add_oauth_fields/`)
- [x] 기존 사용자 `authProvider: 'email'` 데이터 마이그레이션 (migration.sql에 포함)

### Phase 2: API ✅
- [ ] Google OAuth 앱 생성 (Google Cloud Console) - 수동 설정 필요
- [ ] GitHub OAuth 앱 생성 (GitHub Settings → Developer settings) - 수동 설정 필요
- [x] `GoogleStrategy`, `GithubStrategy` 구현
- [x] `AuthService.findOrCreateOAuthUser()` 구현
- [x] `AuthController`에 `/auth/google`, `/auth/google/callback`, `/auth/github`, `/auth/github/callback` 추가
- [x] UsersService에 `findByProvider`, `updateProviderInfo` 추가

### Phase 3: Web ✅
- [x] 로그인 페이지에 Google, GitHub 버튼 추가
- [x] OAuth 콜백 처리 (`?token=xxx&oauth=1` → 저장 후 /dashboard)
- [x] `loginWithOAuthToken`, `getOAuthAuthUrl` 활용

### Phase 4: 테스트 & 정리
- [ ] Google 로그인 E2E 테스트
- [ ] GitHub 로그인 E2E 테스트
- [ ] 동일 이메일 Account Linking 테스트
- [ ] 환경 변수 문서화 (README 또는 .env.example)

---

## 7. 참고 자료

- [NestJS Passport](https://docs.nestjs.com/security/authentication)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

---

## 8. 예상 소요 시간

| Phase | 예상 시간 |
|-------|----------|
| Phase 1 (DB) | 0.5일 |
| Phase 2 (API) | 1~1.5일 |
| Phase 3 (Web) | 0.5일 |
| Phase 4 (테스트) | 0.5일 |
| **합계** | **2.5~3일** |

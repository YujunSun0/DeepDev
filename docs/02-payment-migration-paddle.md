# 2. 결제 플랫폼 전환: Lemon Squeezy → Paddle

> 상용화 준비 - 결제 심사 거절 대응 및 Paddle 연동 (2026-11-13)

이 문서는 **무엇을 바꿨는지**와 함께 **왜 그렇게 판단했는지**를 기록합니다.
나중에 라이브 전환, 다른 결제사 검토, 버그 조사를 할 때 판단 근거로 쓰기 위한 문서입니다.

---

## 1. 배경: 왜 옮겨야 했나

### 1.1 상황
- Lemon Squeezy(LS) 스토어 심사가 **구체적인 사유 없이 거절**됨
  - 거절 메일: "여러 데이터를 종합적으로 판단했고, Stripe·PayPal·카드사 규정을 따른다"는 정형 문구뿐
  - LS는 이런 거절 이후 이의 제기에 답이 없다는 사례가 많아 재심사 가능성이 낮다고 판단

### 1.2 거절 원인 추정
메일에 사유가 없어서 코드와 메일 흔적으로 추정했습니다. 핵심은 **이 원인들 대부분이 결제사를 바꿔도 똑같이 걸린다**는 점이었습니다.

| 의심 원인 | 근거 | 다른 결제사에도 해당? |
|---|---|---|
| 이용약관·개인정보처리방침·환불정책 없음 | `apps/web/src`에 관련 페이지 0개 | ✅ 모든 결제사가 요구 |
| 판매자 정보·연락처 없음 | 푸터에 저작권 문구만 있었음 | ✅ |
| 심사 중 결제 버튼이 "준비 중" | 커밋 `8eefefa 결제 심사 중이므로 비활성화` | ✅ 심사자가 구매 흐름을 못 봄 |
| 신청서 이름 칸 오기입 | 접수 메일 인사말이 "Hi 안녕하세요" | ✅ 신분증 실명과 불일치 |
| 데모 영상 요청 미회신 | 접수 메일이 데모·URL 회신을 요청 | ✅ |

→ **결론: 결제사를 바꾸기 전에 심사 준비물부터 갖춘다.**

---

## 2. 결제사 선택

### 2.1 결정을 가른 조건
1. **사업자등록 없이 개인으로 판매** (사용자 결정)
2. 사용자는 대부분 **한국인**, 가격은 **원화**(월 29,000원)
3. 1인 개발이라 **정기결제·세금 처리를 직접 만들 여력이 적음**

### 2.2 비교

| 선택지 | 판단 |
|---|---|
| 토스페이먼츠 빌링 / PortOne | 한국 사용자 경험은 최고지만 **사업자등록·통신판매업 신고가 필수** → 조건 1에서 탈락. 정기결제 스케줄러·재시도·부가세 신고도 직접 해야 함 |
| **Paddle** | 개인 판매자 허용(사업자 인증 단계 생략), **KRW 가격 + 국내 카드 22종·카카오페이·네이버페이 지원**, MoR이라 세금 처리 대행, 구독 관리 기능 제공 |
| Creem / Dodo / Polar | 수수료는 더 낮지만 신생 업체라 장기 안정성이 불확실 |
| LS 재신청 | 사유 없는 거절이라 가능성 낮음 |

**Paddle을 선택한 이유**: 조건 1~3을 모두 만족하는 거의 유일한 선택지였고, 한국 결제수단 지원 덕분에 LS(해외 카드 결제)보다 오히려 사용자 경험이 좋아짐.

**감수한 비용**: 수수료 5% + 50¢ (29,000원 결제 시 약 7.5%), 정산은 USD 등 외화. 심사가 LS보다 까다롭다는 평이 있어 준비물을 더 꼼꼼히 갖춤.

### 2.3 남은 리스크 (사용자 확인 필요)
- 판매 세금은 Paddle이 처리하지만 **정산받는 소득은 본인 소득세 신고 대상**. 수익이 계속 생기면 Paddle을 거쳐도 사업자등록이 필요할 수 있음 → 세무사 확인 권장.

---

## 3. 심사 준비 (커밋 `e89014f`)

결제 연동보다 **먼저** 했습니다. 심사는 실제 사이트를 보기 때문입니다.

| 항목 | 위치 | 참고한 기준 |
|---|---|---|
| 이용약관 | `/terms` | 공정위 콘텐츠이용 표준약관 구성 + Paddle MoR 고지 문구(공식 권장 문안) + AI 생성 콘텐츠 면책 |
| 개인정보처리방침 | `/privacy` | 개인정보보호위원회 작성지침(2026.4 개정, 생성형 AI 부록) |
| 환불정책 | `/refund` | 전자상거래법 제17조(7일 청약철회)·제18조(3영업일 내 환급), 디지털콘텐츠 철회 제한 사전 고지 |
| 판매자 정보 | 푸터, `apps/web/src/lib/legal.ts` | Paddle: 이름·이메일·전화 표시 요구 |
| 가입 동의 | 회원가입 체크박스, 소셜 로그인 안내문 | |

**판단 포인트**
- 모든 문서를 **한국어/영문 전환**으로 만듦 → Paddle 심사자가 읽을 수 있어야 함
- 개인정보처리방침의 위탁·국외 이전 목록은 **추측이 아니라 실제 코드 기준**으로 작성 (OpenAI, Railway, Vercel, Resend, Sentry, Paddle). OpenAI로 이름·이메일을 보내지 않는다는 점도 코드에서 확인 후 기재
- 판매자 이름은 한 파일(`legal.ts`)에서만 관리 → **Paddle 계정 이름과 철자까지 일치**시키기 쉽게 (LS 때 이름 칸 실수 재발 방지)
- 환불 기준(첫 결제 7일 내 전액, 갱신은 7일 내 + 미사용 시, 일할 환불 없음)은 사용자 확인을 받아 확정

---

## 4. 연동 설계 (커밋 `43ab3bf`)

### 4.1 전체 흐름

```
[요금제 페이지]                 [API 서버]                       [Paddle]
  Pro 업그레이드 클릭
        │  POST /billing/checkout
        ├──────────────────────────▶ 거래 생성 (custom_data.user_id 고정)
        │                                 │ POST /transactions ─────────▶
        │  { transactionId }  ◀───────────┤
        │
  Paddle.js 오버레이 결제창 ───────────────────────────────────────────▶ 결제
        │
  successUrl → /billing?checkout=success
        │  (PRO 반영될 때까지 최대 16초 재확인)
                                    webhook ◀──────────────────────── subscription.created
                                    서명 검증 → 중복 확인 → 사용자 PRO 전환
```

### 4.2 주요 결정과 이유

#### ① 결제 거래는 서버에서 만든다
- 대안: 프론트에서 `Paddle.Checkout.open({ items, customData: { user_id } })`
- 문제: `user_id`를 **브라우저가 정함** → 조작 가능
- 선택: 서버가 `custom_data.user_id`를 넣은 거래를 만들고 프론트는 `transactionId`만 받아 결제창을 엶
- 덤: 이미 유료 플랜인 사용자의 중복 구매를 서버에서 차단 (`createCheckout`)

#### ② client-side token은 API가 내려준다
- Paddle.js 초기화에는 client-side token이 필요한데, Next.js에서 브라우저로 넘기려면 `NEXT_PUBLIC_` 변수가 필요
- 선택: 사용자가 이미 만든 `PADDLE_CLIENT_SIDE_TOKEN`을 API의 `GET /billing/status`가 내려줌 → **env 이름을 바꾸거나 웹·API 양쪽에 중복 설정할 필요 없음**
- 이 토큰은 Paddle이 **공개용으로 설계한 값**이라 노출돼도 괜찮음 (API 키는 서버에만 있음)
- `/pricing`은 Paddle의 **기본 결제 링크**라서 페이지 진입 시 Paddle.js를 미리 초기화 → Paddle 메일의 `?_ptxn=` 링크로 들어오면 결제창이 자동으로 열림

#### ③ webhook 서명 검증
- 형식: `Paddle-Signature: ts=<초>;h1=<hex>` / 서명 대상 `${ts}:${rawBody}`의 HMAC-SHA256
- **timestamp 5분 허용** → 가로챈 요청을 나중에 재전송하는 공격 방지
- **h1이 여러 개일 수 있음** (secret 교체 기간) → 하나라도 맞으면 통과
- 길이 비교 후 `timingSafeEqual` → 잘못된 서명이 500이 아니라 400이 되도록 (LS 코드에 있던 버그를 고친 경험 반영)

#### ④ 중복 처리 방지: `event_id`
- Paddle은 응답이 늦거나 실패하면 같은 이벤트를 **재전송**함
- LS 때는 payload 해시로 판별했지만, Paddle은 재전송 시 **같은 `event_id`**를 보내므로 더 정확한 키로 교체
- `webhook_events.event_id` UNIQUE → 먼저 기록하고 처리. **처리 실패 시 기록을 지워** 재전송 때 다시 처리되게 함 (기록만 남고 처리 안 된 상태 방지)

#### ⑤ 순서가 뒤바뀐 이벤트 대비 (가장 신경 쓴 부분)
Paddle은 **이벤트 전달 순서를 보장하지 않습니다.** 그래서 "마지막에 도착한 이벤트로 덮어쓰기"를 하면 다음 사고가 납니다.

| 시나리오 | 순진한 구현의 결과 | 대응 |
|---|---|---|
| `canceled`(10:00) 다음에 늦게 온 `active`(09:00) | 해지된 사용자가 PRO로 부활 | `users.paddle_event_at`에 마지막 반영 시각 저장, **더 오래된 이벤트 무시** |
| 재구독(새 구독 B) 후 이전 구독 A의 `canceled` 도착 | 결제 중인 사용자가 FREE로 강등 | 현재 구독이 아닌 구독의 이벤트는 **유효 상태(active 등)일 때만** 현재 구독으로 교체, 해지 이벤트는 무시 |
| 환불 처리 중 늦게 온 `active` | 환불받은 사용자가 PRO 유지 | `subscription_status = 'refunded'`면 같은 구독의 이벤트로 PRO 복구 안 함 |

#### ⑥ 상태 → 플랜 매핑

| Paddle 상태 | 플랜 | 이유 |
|---|---|---|
| `active`, `trialing` | PRO | |
| `past_due` | **PRO 유지** | Paddle이 결제를 재시도하는 기간. 카드 한도 초과 같은 일시적 실패로 바로 끊으면 사용자 경험이 나쁨. 재시도가 끝내 실패하면 `canceled`가 옴 |
| `paused`, `canceled` | FREE | |
| 해지 예약 (`scheduled_change.action = cancel`) | PRO 유지 | Paddle은 기간 끝까지 `active`로 둠. 화면에서만 "해지 예정"으로 표시 |

#### ⑦ 환불·차지백
- Paddle은 환불을 `adjustment` 엔티티로 표현. `pending_approval` → `approved`로 바뀜
  - **승인 전에는 아무것도 안 함** (거절될 수 있으므로)
- 전액 환불 승인 또는 차지백 → **즉시 FREE + 구독 즉시 해지**(`effective_from: immediately`)
  - 환불정책 문서("전액 환불 시 즉시 Free 전환")와 코드 동작을 일치시킴
  - 차지백은 부분이어도 강등 (분쟁 중인 결제로 서비스를 계속 제공하지 않음)
- 부분 환불은 플랜 유지
- 이전 구독 결제의 환불은 현재 구독에 영향 없음

#### ⑧ 구독 관리 화면
- 해지 예약·재개는 우리 화면에서 API로 처리 (Paddle 포털로 보내지 않음 → 이탈 감소)
  - 재개 = `scheduled_change: null`로 해지 예약 제거
- 결제 수단 변경은 구독 응답의 `management_urls` 사용 → 화면을 열 때마다 포털 세션을 만들 필요 없음
- 영수증·결제 내역은 클릭 시점에 포털 세션 발급 (세션 URL은 일시적이라 캐시하면 안 됨). 팝업 차단을 피하려고 클릭 즉시 창을 먼저 연 뒤 URL을 채움
- 결제 직후 webhook이 늦게 올 수 있어 `/billing?checkout=success`에서 PRO 반영을 최대 16초 재확인

### 4.3 왜 Paddle SDK 대신 `fetch`를 썼나
- 기존 LS 코드가 `fetch` 기반이라 구조를 유지할 수 있었음
- 호출하는 API가 6개뿐이라 SDK의 이점이 작음
- 테스트에서 `fetch`만 가짜로 바꾸면 돼서 단위 테스트가 단순해짐
- 대신 Paddle API 형식은 **Paddle MCP의 API 레퍼런스로 하나씩 확인**하고 작성

---

## 5. DB 변경 (`prisma/migrations/20261113000000_paddle_billing`)

```prisma
model User {
  paddleCustomerId     String?   // ctm_...
  paddleSubscriptionId String?   // sub_... (현재 구독)
  paddleEventAt        DateTime? // 마지막 반영한 구독 이벤트 시각 (순서 역전 대비)
  subscriptionStatus   String?   // Paddle 상태값 또는 'refunded'
  @@index([paddleCustomerId])
  @@index([paddleSubscriptionId])
}

model WebhookEvent {
  eventId   String @unique // evt_...
  eventType String
}
```

**판단 포인트**
- `ls_*` 컬럼은 이름만 바꾸지 않고 **삭제 후 새로 추가**: LS ID(숫자)가 Paddle 컬럼에 남으면 Paddle API를 엉뚱한 ID로 호출하게 됨
- LS 테스트 결제로 PRO가 된 계정만 FREE로 되돌림. 처음엔 "PRO 전부 FREE"로 썼다가, **수동으로 PRO를 준 계정까지 바뀌는 문제**를 발견해 `ls_*` 기록이 있는 계정으로 범위를 좁힘
- 순서: `UPDATE`(ls 컬럼 참조) → `ALTER`(ls 컬럼 삭제)

---

## 6. 검증

| 단계 | 방법 | 결과 |
|---|---|---|
| 단위 테스트 | `apps/api/src/modules/billing/billing.service.spec.ts` (`npm test`) | 21개 통과 — 서명(정상·오류·만료·secret 교체), 중복, 실패 후 재처리, 상태 매핑, 순서 역전, 이전 구독, 환불·차지백, 결제창 |
| 운영 서버 서명 | Paddle webhook 시뮬레이션 → 운영 API | `201 {"received":true}` (secret 불일치면 400) + `webhook_events` 사용 = 마이그레이션 적용 확인 |
| E2E | Sandbox 테스트 카드로 결제 → 해지 → 재개 → 환불 | 사용자 확인: 모두 정상 |

---

## 7. 운영 체크리스트

### Paddle 승인 전
- [ ] Railway `BILLING_CHECKOUT_ENABLED=false` — Sandbox 상태에서는 누구나 테스트 카드로 PRO를 받을 수 있음

### 라이브 전환 (승인 후)
- [ ] 실계정(vendors.paddle.com)에서 새로 생성: 상품(`saas`) → 가격(KRW 29,000, 세금 포함, 월간) → webhook(이벤트: `subscription.*`, `adjustment.created`, `adjustment.updated`) → API 키·client-side token
- [ ] 기본 결제 링크 `https://deepdev.info/pricing`, 결제 도메인 `deepdev.info` 승인
- [ ] Railway 변수 4개 교체: `PADDLE_API_KEY`, `PADDLE_CLIENT_SIDE_TOKEN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` (Sandbox ID는 실계정에 없음)
- [ ] `BILLING_CHECKOUT_ENABLED=true`
- [ ] 실카드 소액 결제 → 즉시 전액 환불로 한 번 검증

### Sandbox 참고 값
| 항목 | ID |
|---|---|
| 상품 | `pro_01m79bc7e8vynynhqt0b3hwfbd` |
| 가격 | `pri_01m79br2h705vw3p098wvqvnzg` |
| webhook | `ntfset_01m79c9392f68mqhnwkcbgyjs4` |

---

## 8. 알려진 한계와 후속 작업
- **탈퇴 시 구독 자동 해지 없음** — 약관에 "탈퇴 전 해지" 안내만 있음 → 후속 작업 예정
- **가입 동의 시각을 DB에 기록하지 않음** — 분쟁 대비 증빙용으로 추가 예정
- 결제 화면의 카드 정보는 최근 완료 거래에서 가져옴 → 결제 수단을 바꾼 직후에는 이전 카드가 보일 수 있음
- Master 플랜은 아직 상품이 없음 (요금제 페이지 "준비 중")

# DeepDev Technical Stack & Implementation Plan (Solo Founder Edition v1.0)

------------------------------------------------------------------------

# 1. Technical Stack Decision (Final)

## 1.1 Architecture Principle

-   Solo 개발 기준
-   3개월 내 MVP 출시 목표
-   JavaScript 단일 도메인 정체성 유지
-   LLM 비용 통제 필수
-   복잡도 최소화 + 확장 가능성 확보

------------------------------------------------------------------------

# 2. Final Tech Stack

## 2.1 Frontend

-   Next.js (App Router)
-   TypeScript
-   TailwindCSS
-   React Query
-   Recharts (성장 그래프)

선택 이유:

-   생산성 높음
-   배포 간편 (Vercel)
-   대시보드 중심 UI에 적합
-   Type-safe 환경 유지

------------------------------------------------------------------------

## 2.2 Backend (확정)

-   NestJS
-   TypeScript
-   Prisma ORM
-   PostgreSQL
-   Redis (Upstash)
-   JWT Authentication

선택 이유:

-   구조화된 아키텍처 (대규모 확장 대비)
-   DI 기반 테스트 용이
-   TypeScript 일관성 유지
-   추후 B2B API 확장 가능

------------------------------------------------------------------------

## 2.3 LLM Integration

-   OpenAI API
-   JSON Structured Output 강제
-   Prompt Template 중앙 관리
-   Token Usage Logging Middleware

------------------------------------------------------------------------

## 2.4 Infrastructure

Frontend: - Vercel

Backend: - Railway

Database: - PostgreSQL (Railway Managed)

Cache: - Upstash Redis

------------------------------------------------------------------------

# 3. System Architecture (Solo Optimized)

Client (Next.js) ↓ NestJS API ↓ Session Orchestrator ↓ LLM Service ↓
PostgreSQL ↓ Redis (Cache + Token Counter)

Graph DB는 v1에서 사용하지 않음. Concept Tree는 JSON 구조로 DB 저장.

------------------------------------------------------------------------

# 4. Database Schema (v1)

## User

-   id
-   email
-   password_hash
-   plan_type (FREE \| PRO \| MASTER)
-   created_at

## Concept

-   id
-   name
-   level
-   description
-   prerequisite_ids (JSONB)

## Session

-   id
-   user_id
-   concept_id
-   level
-   token_used
-   score
-   created_at

## User_Mastery

-   id
-   user_id
-   concept_id
-   mastery_score
-   attempt_count
-   last_updated

------------------------------------------------------------------------

# 5. Implementation Roadmap (12 Weeks)

------------------------------------------------------------------------

## Phase 1 (Week 1\~4) --- Core MVP

목표: Level 1\~2 학습 가능

구현 항목:

-   NestJS 프로젝트 세팅
-   Auth (JWT)
-   Concept Tree JSON 설계
-   Session 생성 API
-   LLM 연결
-   단순 점수 계산
-   기본 대시보드

Deliverable: 혼자 실제 사용 가능한 버전

------------------------------------------------------------------------

## Phase 2 (Week 5\~8) --- Monetizable Version

목표: 유료 전환 가능한 상태

구현 항목:

-   Weak Concept 자동 추천
-   Token 사용량 추적
-   세션 강제 종료 로직
-   Plan 제한 로직
-   결제 연동 (Stripe)

Deliverable: 유료 구독 가능 버전

------------------------------------------------------------------------

## Phase 3 (Week 9\~12) --- v1 Complete

목표: Level 3 포함 + 안정화

구현 항목:

-   Exploration Mode
-   관리자 Concept 승인 기능
-   난이도 가중치 반영
-   Mastery 수학 모델 적용
-   Redis 캐싱 적용
-   로깅 및 모니터링 추가

Deliverable: 출시 가능한 v1

------------------------------------------------------------------------

# 6. Token Cost Control Strategy

-   세션 Hard Cap 적용
-   불필요한 대화 제거
-   JSON 응답 강제
-   Prompt 최소화
-   답변 길이 제한

Backend Middleware:

-   request 시작 시 토큰 초기화
-   LLM 응답 시 누적 계산
-   초과 시 자동 종료

------------------------------------------------------------------------

# 7. Deployment Strategy

CI/CD:

-   GitHub → Vercel 자동 배포
-   Backend는 GitHub → Railway 자동 배포

환경 분리:

-   dev
-   staging
-   production

------------------------------------------------------------------------

# 8. Solo Risk Mitigation

리스크 1: LLM 비용 폭증 → 세션 제한 + 토큰 캡

리스크 2: 과한 설계 → Graph DB는 v2로 미룸

리스크 3: 기능 과다 → JS Level 1\~3까지만

------------------------------------------------------------------------

# 9. v2 Upgrade Path

-   Graph DB 도입
-   Multi-LLM Routing
-   Adaptive Difficulty Engine
-   코드 실행 샌드박스
-   기업용 Admin Analytics

------------------------------------------------------------------------

# 10. Final Build Philosophy

v1 목표:

"완벽한 플랫폼"이 아니라 "측정 가능한 JS 숙련도 시스템"

3개월 내 출시 → 사용자 피드백 → 점진적 확장.

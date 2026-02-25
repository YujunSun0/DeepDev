# DeepDev Folder Structure Documentation (v1.0)

------------------------------------------------------------------------

# 1. Repository Structure Overview

DeepDev는 Solo 개발 기준으로 Monorepo 구조를 사용한다.

목표:

-   Frontend / Backend 타입 공유
-   프롬프트 중앙 관리
-   확장 가능한 구조 유지
-   복잡도 최소화

------------------------------------------------------------------------

# 2. Root Structure

deepdev/ │ ├── apps/ │ ├── web/ \# Next.js (Frontend) │ └── api/ \#
NestJS (Backend) │ ├── packages/ │ ├── shared-types/ \# 공통 타입 (DTO,
Enums) │ └── prompt-templates/ \# LLM 프롬프트 관리 │ ├── prisma/ \# DB
schema │ ├── .env ├── package.json └── docker-compose.yml

------------------------------------------------------------------------

# 3. Backend Structure (NestJS)

apps/api/src/

├── main.ts ├── app.module.ts │ ├── config/ │ ├── env.config.ts │ └──
token.config.ts │ ├── modules/ │ ├── auth/ │ ├── users/ │ ├── concepts/
│ ├── sessions/ │ ├── mastery/ │ └── exploration/ │ ├── llm/ │ ├──
llm.module.ts │ ├── llm.service.ts │ ├── prompt.builder.ts │ └──
evaluation.engine.ts │ ├── common/ │ ├── guards/ │ ├── interceptors/ │
├── filters/ │ └── decorators/ │ └── utils/ ├── token-counter.ts └──
score-calculator.ts

------------------------------------------------------------------------

# 4. Backend Module Responsibilities

## sessions/

-   세션 생성
-   상태 머신 관리
-   LLM 호출 orchestration
-   세션 종료 처리

## llm/

-   OpenAI API 호출
-   JSON 응답 강제
-   토큰 계산
-   프롬프트 빌드

## mastery/

-   숙련도 계산 로직
-   Dependency 반영
-   Time Decay 적용

## exploration/

-   자유 질문 처리
-   Concept 매핑 시도
-   Exploration 세션 생성

------------------------------------------------------------------------

# 5. Prisma Directory

prisma/

-   schema.prisma
-   migration/
-   seed.ts

역할:

-   DB 스키마 정의
-   마이그레이션 관리
-   초기 Concept 데이터 삽입

------------------------------------------------------------------------

# 6. Frontend Structure (Next.js)

apps/web/

├── app/ │ ├── dashboard/ │ ├── session/ │ ├── login/ │ └── pricing/ │
├── components/ │ ├── session/ │ ├── charts/ │ └── layout/ │ ├── lib/ │
├── api.ts │ └── auth.ts │ └── hooks/

------------------------------------------------------------------------

# 7. Shared Packages

packages/

## shared-types/

-   DTO 정의
-   Enum 공유
-   SessionState 타입
-   PlanType 타입

## prompt-templates/

-   System Prompt 템플릿
-   Level별 문제 생성 템플릿
-   평가 템플릿

------------------------------------------------------------------------

# 8. Architectural Principles

1.  세션은 상태 머신 기반으로 동작
2.  LLM은 생성 엔진이며 평가 로직은 서버가 소유
3.  숙련도는 세션 종료 시점에만 반영
4.  JSON Structured Output을 강제
5.  Graph DB는 v2에서 도입

------------------------------------------------------------------------

# 9. Scaling Considerations

v1에서는:

-   Graph DB 미사용
-   단일 서버 구조
-   JSON 기반 Concept Tree 사용

v2 이후:

-   Graph DB 도입
-   Multi-LLM Routing
-   코드 실행 샌드박스 통합

------------------------------------------------------------------------

# 10. Development Philosophy

이 구조는:

-   3개월 내 출시 가능
-   Solo 개발자가 유지 가능
-   추후 확장 가능

목표는 "완벽한 구조"가 아니라 "지속 가능한 구조"다.

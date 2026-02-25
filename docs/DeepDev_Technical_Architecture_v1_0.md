# DeepDev Technical Architecture Design (v1.0)

------------------------------------------------------------------------

# 1. System Overview

DeepDev는 LLM 기반 학습 엔진 위에 개념 그래프 + 숙련도 평가 시스템을
결합한 구조다.

전체 시스템은 다음 5개 레이어로 구성된다:

1.  Client Layer
2.  API Layer
3.  Learning Engine Layer
4.  Knowledge Graph Layer
5.  Data & Analytics Layer

------------------------------------------------------------------------

# 2. High-Level Architecture

Client (Web / Mobile) ↓ API Gateway ↓ Application Server ↓
--------------------------------- \| Learning Engine \| \| - Session
Orchestrator \| \| - Prompt Builder \| \| - Evaluation Engine \|
--------------------------------- ↓ --------------------------------- \|
Knowledge Graph Service \| --------------------------------- ↓
--------------------------------- \| Database + Analytics \|
---------------------------------

------------------------------------------------------------------------

# 3. Client Layer

-   React 기반 Web App
-   향후 React Native 확장
-   실시간 세션 UI
-   성장 대시보드
-   약점 시각화 차트

기능: - 세션 시작 / 종료 - Exploration 입력 - 답안 제출 - Mastery
Progress 확인

------------------------------------------------------------------------

# 4. API Layer

## 4.1 API Gateway

-   인증 (JWT)
-   Rate Limit
-   플랜 권한 제어 (Free / Pro / Master)

## 4.2 Application Server

역할:

-   세션 생성
-   개념 로드
-   프롬프트 구성
-   LLM 호출
-   평가 결과 저장

------------------------------------------------------------------------

# 5. Learning Engine (핵심)

## 5.1 Session Orchestrator

상태 머신 기반 설계:

States: - INIT - CONCEPT_EXPLAINED - BASIC_QUESTION -
ADVANCED_QUESTION - SELF_EXPLANATION - EVALUATION - SUMMARY - CLOSED

각 단계는 토큰 사용량 추적.

------------------------------------------------------------------------

## 5.2 Prompt Builder

입력 요소:

-   Concept Node 정보
-   난이도(Level)
-   사용자 약점 데이터
-   이전 오답 기록

출력:

-   구조화된 Prompt Template

Prompt 구성:

System: - "You are a strict JavaScript evaluator."

User Context: - Concept 설명 - 난이도 레벨 - 문제 타입

------------------------------------------------------------------------

## 5.3 Evaluation Engine

LLM 출력 기반 점수 계산.

평가 항목:

1.  정확성
2.  논리 일관성
3.  개념 연결 능력
4.  응용력

Scoring Model (예시):

Final Score = (객관식 0.4) + (서술 논리 0.3) + (응용 문제 0.3)

Threshold:

-   80 이상 → Mastered
-   50\~79 → Intermediate
-   50 미만 → Weak

------------------------------------------------------------------------

# 6. Knowledge Graph Architecture

## 6.1 구조

Graph DB 권장 (예: Neo4j)

Node Type:

-   Concept
-   Subconcept
-   Dependency
-   Difficulty Level

Edge Type:

-   REQUIRES
-   RELATED_TO
-   EXTENDS

------------------------------------------------------------------------

## 6.2 Concept Node Schema

Concept: - id - name - description - level_range (1\~5) -
prerequisite_ids - mastery_weight

------------------------------------------------------------------------

# 7. Exploration Mode Flow

1.  사용자 자유 질문 입력
2.  Embedding 생성
3.  Concept Graph와 유사도 비교
4.  유사도 threshold 이상 → Core 매핑
5.  미만 → Exploration Session 생성

Exploration은 숙련도 DB에 반영하지 않음.

------------------------------------------------------------------------

# 8. Mastery Tracking System

DB 구조:

User_Mastery - user_id - concept_id - score - last_updated -
attempt_count

Weak Concept 자동 재추천 로직:

IF score \< 50 AND attempt_count \>= 2: priority_queue에 추가

------------------------------------------------------------------------

# 9. Token Cost Control

세션당 토큰 제한:

-   Free: 3,000 tokens
-   Pro: 8,000 tokens
-   Master: 15,000 tokens

실시간 토큰 계산 → 초과 시 세션 자동 종료.

------------------------------------------------------------------------

# 10. Scalability Design

-   Stateless App Server
-   Horizontal Scaling 가능
-   LLM 호출 비동기 처리
-   캐싱 (Redis):
    -   Concept 설명
    -   기본 문제 템플릿

------------------------------------------------------------------------

# 11. Security

-   JWT 인증
-   Role 기반 접근 제어
-   API Rate Limit
-   Prompt Injection 방어 필터

------------------------------------------------------------------------

# 12. Future Upgrade Plan

1.  Adaptive Difficulty Engine
2.  Multi-LLM Routing
3.  On-device 경량 평가 모델
4.  코드 실행 샌드박스 통합

------------------------------------------------------------------------

# 13. MVP Architecture Scope

MVP에서는:

-   Graph DB 대신 단순 JSON 기반 Concept Tree
-   점수 계산 단순 가중 평균
-   Redis 생략 가능
-   단일 서버 구조

목표: 3개월 내 JS Level 1\~3 완성.

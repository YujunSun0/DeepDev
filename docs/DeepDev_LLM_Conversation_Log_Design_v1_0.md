# DeepDev LLM 대화 로그 저장 설계 v1.0

> **목적**: 실제 사용자들의 질문·학습 패턴을 파악하고, 해당 데이터를 활용해 LLM 프롬프트를 점진적으로 개선

---

## 1. 현재 구조 요약

### LLM 호출 위치

| 소스 | 호출 유형 | 저장 위치 |
|------|----------|----------|
| **Session** | explanation, objective, subjective, application | `Session.context` (JSON) |
| **Session** | evaluate_subjective, evaluate_application | `Session.context` |
| **Session** | summary | `Session.context` |
| **Session** | re_evaluate | `Session.context` |
| **Session** | discuss (토론) | `Session.context.discussions` |
| **Exploration** | create, sendMessage | `Exploration.messages` (JSON) |

- 대화 내용은 이미 `Session.context`, `Exploration.messages`에 저장됨
- 분석·모니터링용으로는 별도 로그 테이블이 필요함

---

## 2. 설계 목표

1. **프롬프트 개선**: 어떤 입력/출력 패턴이 잘/못 되는지 분석
2. **품질 모니터링**: 파싱 실패, 이상 응답 감지
3. **비용·성능 추적**: 토큰 사용량, 지연 시간
4. **개인정보 최소화**: 분석에 필요한 최소 정보만 저장

---

## 3. 스키마 설계

### Option A: 단일 로그 테이블 (권장)

```prisma
model LlmCallLog {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now()) @map("created_at")

  // 소스 식별
  source      String   // "session" | "exploration"
  sourceId    String   @map("source_id")  // sessionId 또는 explorationId
  callType    String   @map("call_type")  // "explanation" | "objective" | "subjective" | ...

  // 컨텍스트 (분석용, 개인정보 최소화)
  conceptId   String?  @map("concept_id")
  conceptName String?  @map("concept_name")
  level       Int?
  stepType    String?  @map("step_type")  // discuss용: explanation|objective|subjective|application

  // 메타데이터
  model       String   @default("gpt-4o")
  tokensUsed Int      @map("tokens_used")
  latencyMs  Int?     @map("latency_ms")
  success    Boolean  @default(true)      // parse 성공 여부

  // 익명화된 입력/출력 (선택, 샘플링 시)
  promptHash  String?  @map("prompt_hash")  // 중복 제거용
  inputLength Int?    @map("input_length") // prompt 길이
  outputLength Int?   @map("output_length")
  // content 저장 여부는 정책에 따라 (기본: 미저장)

  // 사용자 연계 (선택, 익명화 가능)
  userIdHash  String?  @map("user_id_hash") // sha256(userId) 등

  @@index([source, callType])
  @@index([conceptId, callType])
  @@index([createdAt])
  @@index([success])
  @@map("llm_call_logs")
}
```

### Option B: 2단계 (메타 + 샘플)

- **LlmCallLog**: 위와 동일하되 `content` 없음
- **LlmCallSample**: 동의한 사용자/샘플만 `prompt`, `response` 저장

---

## 4. 저장 시점 및 데이터

### Session 호출

| callType | 저장 시점 | 추가 메타 |
|----------|----------|----------|
| explanation | startSession | conceptName, level |
| objective | getObjectiveQuestion | - |
| subjective | getSubjectiveQuestion | - |
| application | getApplicationQuestion | previousScores |
| evaluate_subjective | submitSubjectiveAnswer | score, conceptName |
| evaluate_application | submitApplicationAnswer | score |
| summary | getSessionSummary | totalScore |
| re_evaluate | reEvaluate | stepType, score |
| discuss | discuss | stepType, turnIndex |

### Exploration 호출

| callType | 저장 시점 |
|----------|----------|
| exploration_create | create (chatWithHistory + title) |
| exploration_message | sendMessage |

---

## 5. 구현 방식

### 5-1. LlmService 래핑 (중앙 로깅)

```typescript
// llm.service.ts 또는 별도 LlmLoggingService
async chat(...): Promise<{ content, tokensUsed }> {
  const start = Date.now();
  try {
    const result = await this.openai.chat.completions.create(...);
    await this.logCall({
      callType, source, sourceId, conceptId, conceptName, level,
      tokensUsed: result.usage?.total_tokens,
      latencyMs: Date.now() - start,
      success: true,
    });
    return result;
  } catch (e) {
    await this.logCall({ ..., success: false });
    throw e;
  }
}
```

- 모든 LLM 호출이 한 곳을 거치도록 하고, 여기서 로그만 기록
- `sessions.service`, `explorations.service`는 기존대로 두고, `LlmService`만 수정

### 5-2. 비동기 로깅 (성능)

```typescript
// Fire-and-forget, DB 부담 최소화
this.logCall(payload).catch(err => this.logger.warn('Log failed', err));
```

- 로깅 실패가 메인 플로우에 영향을 주지 않도록 처리

### 5-3. 샘플링 (비용·용량)

```typescript
// 예: 100% 메타데이터, 10% content
const shouldStoreContent = Math.random() < 0.1;
```

- 메타데이터는 전부 저장
- `content`는 샘플만 저장하거나, 아예 저장하지 않는 정책 선택

---

## 6. 마이그레이션 단계

### Phase 1 (최소)

- `LlmCallLog` 테이블 생성
- `callType`, `source`, `sourceId`, `tokensUsed`, `latencyMs`, `success` 저장
- `content` 미저장

### Phase 2

- `conceptId`, `conceptName`, `level`, `stepType` 등 컨텍스트 추가
- 대시보드: 토큰 사용량, 실패율, 평균 지연 시간

### Phase 3

- 샘플 `content` 저장 (동의/샘플링 정책 적용)
- 프롬프트 개선용 분석 파이프라인

---

## 7. 개인정보·정책

| 항목 | 권장 |
|------|------|
| userId | `userIdHash`(sha256) 또는 미저장 |
| prompt/response | 샘플만, 또는 미저장 |
| 보관 기간 | 90일~1년 후 아카이브/삭제 |
| 동의 | 이용약관 또는 별도 동의로 명시 |

---

## 8. 인덱스 및 쿼리 예시

```sql
-- 개념별 채점 품질
SELECT concept_name, call_type, AVG(score), COUNT(*) 
FROM llm_call_logs 
WHERE call_type LIKE 'evaluate_%' AND success = true
GROUP BY concept_name, call_type;

-- 파싱 실패 모니터링
SELECT * FROM llm_call_logs WHERE success = false ORDER BY created_at DESC;

-- 토큰 사용 추이
SELECT date_trunc('day', created_at), SUM(tokens_used) 
FROM llm_call_logs GROUP BY 1;
```

---

## 9. 요약

1. **LlmCallLog** 단일 테이블로 시작
2. **메타데이터 위주** 저장, `content`는 Phase 3에서 선택
3. **LlmService**에서 중앙 로깅, 비동기 처리
4. **샘플링**으로 비용·용량 관리
5. **개인정보**는 해시/미저장으로 최소화

---

*작성일: 2026-03*

export const CONCEPT_EXPLANATION_PROMPT = (
  conceptName: string,
  level: number,
  description: string,
) => `"${conceptName}" 개념을 난이도 ${level}/5 수준으로 설명하세요.

개념 설명: ${description}

JSON 형식으로 응답하세요:
{
  "explanation": "개념에 대한 명확하고 상세한 설명 (3~5 문단)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "codeExample": "개념을 보여주는 실제 코드 예시 (코드만, 마크다운 없이)"
}`;

export const BASIC_QUESTION_PROMPT = (
  conceptName: string,
  level: number,
  explanation: string,
) => `"${conceptName}" 개념 (레벨 ${level}/5)에 대한 객관식 문제를 1개 출제하세요.

학습한 내용: ${explanation}

반드시 아래 JSON 형식으로 응답하세요:
{
  "question": "문제 본문 (코드 스니펫 포함 가능)",
  "options": ["A) 선택지1", "B) 선택지2", "C) 선택지3", "D) 선택지4"],
  "correctAnswer": "A",
  "explanation": "정답인 이유와 각 오답이 틀린 이유에 대한 해설"
}

주의:
- correctAnswer는 반드시 "A", "B", "C", "D" 중 하나
- 단순 암기가 아닌 개념 이해를 테스트하는 문제 출제`;

export const SUBJECTIVE_QUESTION_PROMPT = (
  conceptName: string,
  level: number,
) => `"${conceptName}" 개념 (레벨 ${level}/5)에 대해 학습자가 직접 설명하는 서술형 문제를 출제하세요.

JSON 형식으로 응답하세요:
{
  "question": "학습자에게 개념을 자신의 말로 설명하게 하는 구체적인 질문",
  "evaluationCriteria": ["평가 기준 1: 반드시 포함해야 할 내용", "평가 기준 2: 언급해야 할 핵심 용어", "평가 기준 3: 피해야 할 흔한 오해"]
}`;

export const APPLICATION_QUESTION_PROMPT = (
  conceptName: string,
  level: number,
  previousScores: { objective: number; subjective: number },
) => `"${conceptName}" 개념 (레벨 ${level}/5)에 대한 응용/실전 문제를 출제하세요.
학습자의 이전 점수: 객관식 ${previousScores.objective}/100, 서술형 ${previousScores.subjective}/100

JSON 형식으로 응답하세요:
{
  "question": "실전 상황이나 코드 디버깅/분석/작성 문제 (코드 포함 가능)",
  "expectedAnswer": "모범 답안의 핵심 내용",
  "evaluationCriteria": ["평가 기준 1", "평가 기준 2", "평가 기준 3"]
}

주의: 이전 점수가 높으면 더 어려운 문제를, 낮으면 기본적인 응용 문제를 출제하세요.`;

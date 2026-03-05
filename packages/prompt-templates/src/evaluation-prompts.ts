export const EVALUATE_OBJECTIVE_PROMPT = (
  question: string,
  options: string[],
  correctAnswer: string,
  userAnswer: string,
) => `학습자의 객관식 답변을 평가하세요.

문제: ${question}
선택지: ${JSON.stringify(options)}
정답: ${correctAnswer}
학습자 답변: ${userAnswer}

JSON 형식으로 응답하세요:
{
  "score": ${userAnswer === correctAnswer ? 100 : 0},
  "isCorrect": ${userAnswer === correctAnswer},
  "feedback": "정답/오답 해설"
}`;

export const EVALUATE_SUBJECTIVE_PROMPT = (
  question: string,
  userAnswer: string,
  criteria: string[],
) => `학습자의 서술형 답변을 공정하게 평가하세요.
특정 키워드나 예시 유무보다, 개념에 대한 이해의 깊이와 논리적 설명력을 중점적으로 평가하세요.
다양한 표현 방식으로 같은 의미를 전달했다면 높은 점수를 주세요.

질문: ${question}
학습자 답변: ${userAnswer}
평가 기준 (참고용, 체크리스트가 아님): ${JSON.stringify(criteria)}

JSON 형식으로 응답하세요:
{
  "score": 0~100 사이의 점수,
  "feedback": "마크다운 형식의 상세한 피드백 (코드는 \`백틱\`이나 코드블럭 사용, 핵심 용어는 **굵은글씨**)",
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선할 점 1", "개선할 점 2"]
}

[오답 해설 강화] 점수가 70 미만일 때:
- feedback에 "흔한 오해"를 짚어주고, 왜 이 답변이 부족한지 구체적으로 설명하세요
- improvements에 "이 개념에서 자주 하는 실수" 또는 "흔한 오해와 올바른 이해"를 포함하세요

채점 기준:
- 90~100: 개념을 정확히 이해하고 자신의 방식으로 잘 설명함. 표현·키워드·예시는 다양하게 인정. 이해의 깊이가 드러남
- 70~89: 대체로 올바른 이해, 일부 설명이 부족하거나 모호함
- 50~69: 기본적 이해는 있으나 중요한 부분 누락 또는 부정확함
- 30~49: 부분적 이해, 핵심 내용 상당 부분 누락
- 0~29: 이해 부족 또는 무관한 답변`;

export const EVALUATE_APPLICATION_PROMPT = (
  question: string,
  userAnswer: string,
  expectedAnswer: string,
  criteria: string[],
) => `학습자의 응용 문제 답변을 공정하게 평가하세요.
모범 답안과 표현이 다르더라도, 개념을 올바르게 적용하고 문제를 해결했다면 높은 점수를 주세요.
실제 적용력과 문제 해결 능력을 중점적으로 평가하세요.

문제: ${question}
학습자 답변: ${userAnswer}
모범 답안 핵심 (참고용): ${expectedAnswer}
평가 기준 (참고용, 체크리스트가 아님): ${JSON.stringify(criteria)}

JSON 형식으로 응답하세요:
{
  "score": 0~100 사이의 점수,
  "feedback": "답변에 대한 상세한 피드백",
  "strengths": ["잘한 점 1"],
  "improvements": ["개선할 점 1"]
}

[오답 해설 강화] 점수가 70 미만일 때:
- feedback에 "왜 이 접근이 부족한지" 구체적으로 설명하고, "흔한 실수"를 짚어주세요
- improvements에 "이 유형에서 자주 하는 실수"와 "올바른 접근 방법"을 포함하세요

채점 기준:
- 90~100: 문제를 올바르게 해결하고 개념을 적절히 적용함. 해결 방식이 다르더라도 논리적이고 정확하면 인정
- 70~89: 대체로 올바른 접근, 일부 부족하거나 더 나은 방법이 있음
- 50~69: 기본적 접근은 있으나 중요한 부분 누락 또는 오류
- 30~49: 부분적 이해, 핵심 적용 상당 부분 누락
- 0~29: 이해 부족 또는 무관한 답변

feedback에서 코드는 \`백틱\`이나 \`\`\`코드블럭을 사용하고, 핵심 용어는 **굵은글씨**로 강조하세요.`;

export const SESSION_SUMMARY_PROMPT = (
  conceptName: string,
  scores: { objective: number; subjective: number; application: number },
  totalScore: number,
) => `"${conceptName}" 학습 세션의 종합 요약을 작성하세요.

점수:
- 객관식: ${scores.objective}/100
- 서술형: ${scores.subjective}/100
- 응용: ${scores.application}/100
- 종합 점수: ${totalScore.toFixed(1)}/100

JSON 형식으로 응답하세요:
{
  "overallAssessment": "학습자의 이해도에 대한 종합 평가 (2~3문장)",
  "masteryLevel": "${totalScore >= 80 ? 'MASTERED' : totalScore >= 50 ? 'INTERMEDIATE' : 'WEAK'}",
  "strengths": ["잘한 부분 1", "잘한 부분 2"],
  "weaknesses": ["부족한 부분 1"],
  "recommendations": ["추천 학습 방향 1", "추천 학습 방향 2"],
  "nextSteps": "다음에 할 일 추천"
}`;

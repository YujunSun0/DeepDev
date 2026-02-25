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
) => `학습자의 서술형 답변을 엄격하게 평가하세요.

질문: ${question}
학습자 답변: ${userAnswer}
평가 기준: ${JSON.stringify(criteria)}

JSON 형식으로 응답하세요:
{
  "score": 0~100 사이의 점수,
  "feedback": "답변에 대한 상세한 피드백",
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선할 점 1", "개선할 점 2"]
}

채점 기준:
- 90~100: 모든 평가 기준을 정확히 충족, 깊은 이해 드러남
- 70~89: 대부분의 기준 충족, 일부 부족
- 50~69: 기본적 이해는 있으나 중요한 부분 누락
- 30~49: 부분적 이해, 핵심 내용 상당 부분 누락
- 0~29: 이해 부족 또는 무관한 답변`;

export const EVALUATE_APPLICATION_PROMPT = (
  question: string,
  userAnswer: string,
  expectedAnswer: string,
  criteria: string[],
) => `학습자의 응용 문제 답변을 엄격하게 평가하세요.

문제: ${question}
학습자 답변: ${userAnswer}
모범 답안 핵심: ${expectedAnswer}
평가 기준: ${JSON.stringify(criteria)}

JSON 형식으로 응답하세요:
{
  "score": 0~100 사이의 점수,
  "feedback": "답변에 대한 상세한 피드백",
  "strengths": ["잘한 점 1"],
  "improvements": ["개선할 점 1"]
}

채점 기준은 서술형과 동일하되, 실제 적용력과 문제 해결 능력을 더 중점적으로 평가하세요.`;

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

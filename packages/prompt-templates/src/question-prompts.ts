export const CONCEPT_EXPLANATION_PROMPT = (
  conceptName: string,
  level: number,
  description: string,
) => `"${conceptName}" 개념을 난이도 ${level}/5 수준으로 설명하세요.

개념 설명: ${description}

[구조] 반드시 "왜 → 뭐 → 어떻게" 순서로 작성하세요:
1. **왜?** - 이 개념을 모르면 면접/실무에서 어떻게 막히는지 1~2문장
2. **뭐?** - 정의, 핵심
3. **어떻게?** - 동작 원리, 예시, 적용

JSON 형식으로 응답하세요:
{
  "explanation": "(아래 형식 참고)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "codeExample": "개념을 보여주는 실제 코드 예시 (코드만, 마크다운 없이)"
}

[중요] explanation 값은 반드시 아래 예시처럼 마크다운 문법을 포함해야 합니다:

예시:
"explanation": "## 변수란?\\n\\n**변수**는 데이터를 저장하는 이름이 붙은 공간입니다.\\n\\n## 선언 방법\\n\\nJavaScript에서는 \`var\`, \`let\`, \`const\` 세 가지 키워드로 변수를 선언합니다.\\n\\n- \`var\`: 함수 스코프\\n- \`let\`: 블록 스코프, 재할당 가능\\n- \`const\`: 블록 스코프, 재할당 불가\\n\\n> 현대 JavaScript에서는 **let**과 **const** 사용을 권장합니다.\\n\\n## 코드 예시\\n\\n\`\`\`javascript\\nlet name = \\"홍길동\\";\\nconst age = 25;\\n\`\`\`"

규칙:
- 반드시 ##, **, \`, >, - 등 마크다운 문법을 적극 사용하세요
- 줄바꿈은 \\n으로 표현하세요
- 3~5개의 소제목(##)으로 구조화하세요
- 핵심 용어는 **굵은글씨**, 코드/키워드는 \`백틱\`으로 감싸세요`;

export const BASIC_QUESTION_PROMPT = (
  conceptName: string,
  level: number,
  explanation: string,
) => `"${conceptName}" 개념 (레벨 ${level}/5)에 대한 객관식 문제를 1개 출제하세요.

학습한 내용: ${explanation}

반드시 아래 JSON 형식으로 응답하세요:
{
  "question": "문제 본문 (마크다운 사용 가능, 코드는 \`\`\`javascript 코드블럭 사용)",
  "options": ["A) 선택지1", "B) 선택지2", "C) 선택지3", "D) 선택지4"],
  "correctAnswer": "A",
  "explanation": "정답인 이유 + 각 오답(A,B,C,D)마다: (1) 왜 틀렸는지 (2) 이 선택지를 고를 때 흔한 오해는 무엇인지. 마크다운 사용"
}

주의:
- correctAnswer는 반드시 "A", "B", "C", "D" 중 하나
- 단순 암기가 아닌 개념 이해를 테스트하는 문제 출제
- explanation에서 **각 오답마다** "왜 틀렸는지"와 "이 선택지를 고를 때 흔한 오해"를 구체적으로 작성하세요
- question과 explanation에서 코드가 있으면 반드시 \`\`\`javascript 코드블럭을 사용하세요`;

export const SUBJECTIVE_QUESTION_PROMPT = (
  conceptName: string,
  level: number,
) => `"${conceptName}" 개념 (레벨 ${level}/5)에 대해 학습자가 직접 설명하는 서술형 문제를 출제하세요.

평가 기준은 특정 키워드나 예시를 강제하지 않고, 이해의 깊이와 논리적 설명력을 중심으로 작성하세요.

JSON 형식으로 응답하세요:
{
  "question": "학습자에게 개념을 자신의 말로 설명하게 하는 구체적인 질문",
  "evaluationCriteria": [
    "개념의 본질을 자신의 말로 정확히 설명했는가",
    "핵심 메커니즘을 논리적으로 연결해 설명했는가",
    "흔한 오해를 피하고 올바른 이해를 드러냈는가"
  ]
}`;

export const APPLICATION_QUESTION_PROMPT = (
  conceptName: string,
  level: number,
  previousScores: { objective: number; subjective: number },
) => `"${conceptName}" 개념 (레벨 ${level}/5)에 대한 응용/실전 문제를 출제하세요.
학습자의 이전 점수: 객관식 ${previousScores.objective}/100, 서술형 ${previousScores.subjective}/100

평가 기준은 특정 표현을 강제하지 않고, 문제 해결력과 개념 적용 능력을 중심으로 작성하세요.

JSON 형식으로 응답하세요:
{
  "question": "마크다운 형식의 실전 문제 (코드는 반드시 \`\`\`javascript 코드블럭 사용)",
  "expectedAnswer": "모범 답안의 핵심 내용 (참고용, 정답 형식은 다양하게 인정)",
  "evaluationCriteria": [
    "문제를 올바르게 이해하고 접근했는가",
    "개념을 실제 상황에 적절히 적용했는가",
    "논리적이고 일관된 해결 과정을 보였는가"
  ]
}

주의:
- 이전 점수가 높으면 더 어려운 문제를, 낮으면 기본적인 응용 문제를 출제하세요
- question의 코드는 반드시 \`\`\`javascript 코드블럭으로 감싸세요
- 마크다운 문법(**굵은글씨**, \`인라인코드\` 등)을 적극 활용하세요`;

/** CS 기초(자료구조, 알고리즘, OS, 네트워크 등)용 - 코드 실행 대신 상황/선택/추론 기반 */
export const APPLICATION_QUESTION_PROMPT_CS = (
  conceptName: string,
  level: number,
  previousScores: { objective: number; subjective: number },
) => `"${conceptName}" 개념 (레벨 ${level}/5)에 대한 **상황 기반/추론 문제**를 출제하세요.
학습자의 이전 점수: 객관식 ${previousScores.objective}/100, 서술형 ${previousScores.subjective}/100

코드 실행이 아닌, **개념 적용·선택·분석 능력**을 평가하는 문제를 내세요.

예시 유형:
- "다음 상황에서 어떤 자료구조/알고리즘을 선택하는가? 이유는?"
- "이 알고리즘의 시간복잡도는? 그 이유를 설명하라"
- "이 프로토콜이 왜 필요한가? 어떤 상황에서 쓰이는가?"
- "A와 B의 차이점은? 각각 언제 사용하는가?"

JSON 형식으로 응답하세요:
{
  "question": "마크다운 형식의 상황/추론 문제 (코드가 필요하면 pseudo-code나 간단한 예시 가능)",
  "expectedAnswer": "모범 답안의 핵심 내용 (참고용, 정답 형식은 다양하게 인정)",
  "evaluationCriteria": [
    "상황을 올바르게 이해하고 적절한 개념을 선택했는가",
    "선택/판단의 이유를 논리적으로 설명했는가",
    "핵심 개념을 정확히 적용했는가"
  ]
}

주의:
- 이전 점수가 높으면 더 어려운 상황/추론 문제를, 낮으면 기본적인 선택 문제를 출제하세요
- 코드 실행·출력 추론이 아닌, **개념 이해와 적용**을 테스트하세요`;

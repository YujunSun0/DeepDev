"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_SUMMARY_PROMPT = exports.EVALUATE_ANSWER_PROMPT = void 0;
const EVALUATE_ANSWER_PROMPT = (question, userAnswer, expectedAnswer, criteria) => `Evaluate the learner's answer to a JavaScript question.

Question: ${question}
Learner's Answer: ${userAnswer}
Expected Answer: ${expectedAnswer}
Evaluation Criteria: ${JSON.stringify(criteria)}

Respond in the following JSON format:
{
  "score": <number 0-100>,
  "isCorrect": <boolean>,
  "feedback": "Detailed feedback on the answer",
  "strengths": ["What the learner did well"],
  "improvements": ["What could be improved"]
}`;
exports.EVALUATE_ANSWER_PROMPT = EVALUATE_ANSWER_PROMPT;
const SESSION_SUMMARY_PROMPT = (conceptName, scores) => `Generate a learning session summary for the concept "${conceptName}".

Scores:
- Objective (multiple choice): ${scores.objective}/100
- Subjective (logical explanation): ${scores.subjective}/100
- Application (practical problem): ${scores.application}/100

Respond in the following JSON format:
{
  "overallAssessment": "Brief assessment of the learner's understanding",
  "masteryLevel": "WEAK | INTERMEDIATE | MASTERED",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "nextSteps": "What the learner should focus on next"
}`;
exports.SESSION_SUMMARY_PROMPT = SESSION_SUMMARY_PROMPT;
//# sourceMappingURL=evaluation-prompts.js.map
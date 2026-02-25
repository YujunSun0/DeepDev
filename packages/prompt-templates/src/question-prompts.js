"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SELF_EXPLANATION_PROMPT = exports.ADVANCED_QUESTION_PROMPT = exports.BASIC_QUESTION_PROMPT = void 0;
const BASIC_QUESTION_PROMPT = (conceptName, level, explanation) => `Based on the JavaScript concept "${conceptName}" at level ${level}/5, generate a basic multiple-choice question.

Context: ${explanation}

Respond in the following JSON format:
{
  "question": "The question text",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correctAnswer": "A",
  "explanation": "Why this answer is correct"
}`;
exports.BASIC_QUESTION_PROMPT = BASIC_QUESTION_PROMPT;
const ADVANCED_QUESTION_PROMPT = (conceptName, level, previousAnswers) => `Based on the JavaScript concept "${conceptName}" at level ${level}/5, generate an application-level question.
This should test deeper understanding and practical application.

Previous answers from the learner: ${JSON.stringify(previousAnswers)}

Respond in the following JSON format:
{
  "question": "The application question (may include code snippets)",
  "expectedAnswer": "What a good answer should include",
  "evaluationCriteria": ["criterion 1", "criterion 2", "criterion 3"]
}`;
exports.ADVANCED_QUESTION_PROMPT = ADVANCED_QUESTION_PROMPT;
const SELF_EXPLANATION_PROMPT = (conceptName) => `Ask the learner to explain the concept "${conceptName}" in their own words.

Respond in the following JSON format:
{
  "prompt": "A specific prompt asking the learner to explain the concept",
  "evaluationCriteria": ["What the explanation should include", "Key terms to mention", "Common misconceptions to avoid"]
}`;
exports.SELF_EXPLANATION_PROMPT = SELF_EXPLANATION_PROMPT;
//# sourceMappingURL=question-prompts.js.map
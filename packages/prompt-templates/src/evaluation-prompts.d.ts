export declare const EVALUATE_ANSWER_PROMPT: (question: string, userAnswer: string, expectedAnswer: string, criteria: string[]) => string;
export declare const SESSION_SUMMARY_PROMPT: (conceptName: string, scores: {
    objective: number;
    subjective: number;
    application: number;
}) => string;

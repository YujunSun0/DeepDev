import { api } from './api';

export interface ExplanationData {
  explanation: string;
  keyPoints: string[];
  codeExample: string;
}

export interface ObjectiveQuestionData {
  state: string;
  question: string;
  options: string[];
}

export interface ObjectiveAnswerResult {
  isCorrect: boolean;
  score: number;
  correctAnswer: string;
  feedback: string;
}

export interface SubjectiveQuestionData {
  state: string;
  question: string;
}

export interface SubjectiveAnswerResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ApplicationQuestionData {
  state: string;
  question: string;
}

export interface ApplicationAnswerResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface SummaryData {
  state: string;
  scores: { objective: number; subjective: number; application: number };
  totalScore: number;
  summary: {
    overallAssessment: string;
    masteryLevel: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    nextSteps: string;
  };
}

export const sessionApi = {
  startSession: (id: string) =>
    api.post<{ state: string; explanation: ExplanationData }>(`/sessions/${id}/start`).then(r => r.data),

  getObjectiveQuestion: (id: string) =>
    api.post<ObjectiveQuestionData>(`/sessions/${id}/objective`).then(r => r.data),

  submitObjectiveAnswer: (id: string, answer: string) =>
    api.post<ObjectiveAnswerResult>(`/sessions/${id}/objective/answer`, { answer }).then(r => r.data),

  getSubjectiveQuestion: (id: string) =>
    api.post<SubjectiveQuestionData>(`/sessions/${id}/subjective`).then(r => r.data),

  submitSubjectiveAnswer: (id: string, answer: string) =>
    api.post<SubjectiveAnswerResult>(`/sessions/${id}/subjective/answer`, { answer }).then(r => r.data),

  getApplicationQuestion: (id: string) =>
    api.post<ApplicationQuestionData>(`/sessions/${id}/application`).then(r => r.data),

  submitApplicationAnswer: (id: string, answer: string) =>
    api.post<ApplicationAnswerResult>(`/sessions/${id}/application/answer`, { answer }).then(r => r.data),

  getSummary: (id: string) =>
    api.post<SummaryData>(`/sessions/${id}/summary`).then(r => r.data),

  discuss: (id: string, stepType: 'objective' | 'subjective' | 'application', message: string) =>
    api.post<DiscussionResult>(`/sessions/${id}/discuss`, { stepType, message }).then(r => r.data),
};

export interface DiscussionResult {
  reply: string;
  remainingTurns: number;
  tokensUsed: number;
}

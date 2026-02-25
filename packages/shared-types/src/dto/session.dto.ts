export interface CreateSessionDto {
  conceptId: string;
  level: number;
}

export interface SubmitAnswerDto {
  sessionId: string;
  answer: string;
}

export interface SessionResponse {
  id: string;
  conceptId: string;
  conceptName: string;
  level: number;
  state: string;
  tokenUsed: number;
  score: number | null;
  createdAt: string;
}

export interface SessionStepResponse {
  state: string;
  content: string;
  question?: string;
  options?: string[];
  tokenUsed: number;
}

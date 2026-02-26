import { api } from './api';

export interface ExplorationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ExplorationSummary {
  id: string;
  title: string;
  conceptName: string;
  tokenUsed: number;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationDetail {
  id: string;
  title: string;
  conceptName: string;
  conceptId: string;
  messages: ExplorationMessage[];
  tokenUsed: number;
  turnsLeft: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExplorationResult {
  id: string;
  title: string;
  conceptName: string;
  messages: ExplorationMessage[];
  tokenUsed: number;
}

export interface SendMessageResult {
  reply: string;
  tokenUsed: number;
  turnsLeft: number;
}

export const explorationApi = {
  create: (conceptId: string, message: string) =>
    api.post<CreateExplorationResult>('/explorations', { conceptId, message }).then((r) => r.data),

  getAll: () =>
    api.get<ExplorationSummary[]>('/explorations').then((r) => r.data),

  getById: (id: string) =>
    api.get<ExplorationDetail>(`/explorations/${id}`).then((r) => r.data),

  sendMessage: (id: string, message: string) =>
    api.post<SendMessageResult>(`/explorations/${id}/message`, { message }).then((r) => r.data),
};

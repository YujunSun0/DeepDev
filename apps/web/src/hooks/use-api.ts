'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Concept {
  id: string;
  name: string;
  description: string;
  level: number;
  prerequisiteIds: string[];
  masteryWeight: number;
}

interface Mastery {
  id: string;
  conceptId: string;
  masteryScore: number;
  attemptCount: number;
  lastUpdated: string;
  concept: Concept;
}

interface Session {
  id: string;
  conceptId: string;
  level: number;
  state: string;
  tokenUsed: number;
  score: number | null;
  createdAt: string;
  concept: Concept;
}

export function useConcepts(level?: number) {
  return useQuery({
    queryKey: ['concepts', level],
    queryFn: async () => {
      const params = level ? `?level=${level}` : '';
      const { data } = await api.get<Concept[]>(`/concepts${params}`);
      return data;
    },
  });
}

export function useConceptTree() {
  return useQuery({
    queryKey: ['concepts', 'tree'],
    queryFn: async () => {
      const { data } = await api.get<Concept[]>('/concepts/tree');
      return data;
    },
  });
}

export function useMasteries() {
  return useQuery({
    queryKey: ['masteries'],
    queryFn: async () => {
      const { data } = await api.get<Mastery[]>('/mastery');
      return data;
    },
  });
}

export function useWeakConcepts() {
  return useQuery({
    queryKey: ['masteries', 'weak'],
    queryFn: async () => {
      const { data } = await api.get<Mastery[]>('/mastery/weak');
      return data;
    },
  });
}

export function useGSI() {
  return useQuery({
    queryKey: ['masteries', 'gsi'],
    queryFn: async () => {
      const { data } = await api.get<{ globalSkillIndex: number }>('/mastery/gsi');
      return data.globalSkillIndex;
    },
  });
}

interface SessionListResponse {
  items: Session[];
  total: number;
  page: number;
  totalPages: number;
}

export function useSessions(options?: { state?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.state) params.set('state', options.state);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();

  return useQuery({
    queryKey: ['sessions', options],
    queryFn: async () => {
      const { data } = await api.get<SessionListResponse>(`/sessions${qs ? `?${qs}` : ''}`);
      return data;
    },
  });
}

export interface UsageStatus {
  plan: string;
  limits: {
    monthlySessions: number;
    monthlyTokens: number;
    explorationTurns: number;
    monthlyExplorations: number;
  };
  month: {
    sessions: number;
    tokens: number;
    explorations: number;
  };
  percent: {
    sessions: number;
    tokens: number;
    explorations: number;
  };
  warning: boolean;
  exceeded: boolean;
}

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      const { data } = await api.get<UsageStatus>('/usage');
      return data;
    },
    refetchInterval: 60_000,
  });
}

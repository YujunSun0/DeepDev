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

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await api.get<Session[]>('/sessions');
      return data;
    },
  });
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useConceptTree, useMasteries } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { DomainTabs } from '@/components/domain-tabs';
import { UsageWarning } from '@/components/usage-warning';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorMessage } from '@/components/ui';
import { SessionSkeleton } from '@/components/skeletons';

const PLAN_MAX_LEVEL: Record<string, number> = {
  FREE: 2,
  PRO: 4,
  MASTER: 5,
};

const levelLabels: Record<number, string> = {
  1: '기초 개념',
  2: '중급',
  3: '비동기 심화',
  4: '내부 메커니즘',
  5: '실전 사고력',
};

const VALID_DOMAINS = ['javascript', 'dsa', 'os-network', 'react'];

export default function SessionPage() {
  const searchParams = useSearchParams();
  const domainFromUrl = searchParams.get('domain');
  const initialDomain = domainFromUrl && VALID_DOMAINS.includes(domainFromUrl) ? domainFromUrl : 'javascript';
  const [activeDomain, setActiveDomain] = useState(initialDomain);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (domainFromUrl && VALID_DOMAINS.includes(domainFromUrl)) {
      setActiveDomain(domainFromUrl);
    }
  }, [domainFromUrl]);
  const { user } = useAuth();
  const { data: concepts, isLoading } = useConceptTree();
  const { data: masteries } = useMasteries();
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const maxLevel = PLAN_MAX_LEVEL[user?.planType ?? 'FREE'] ?? 2;
  const masteryMap = new Map(
    masteries?.map((m) => [m.conceptId, m.masteryScore]) ?? [],
  );

  const conceptsByDomain = (concepts ?? []).filter(
    (c) => (c as { domain?: string }).domain === activeDomain,
  );
  const levelGroups = conceptsByDomain.reduce(
    (acc, c) => {
      if (!acc[c.level]) acc[c.level] = [];
      acc[c.level].push(c);
      return acc;
    },
    {} as Record<number, typeof conceptsByDomain>,
  );

  const handleStart = async (conceptId: string, level: number) => {
    setCreating(conceptId);
    setError('');
    try {
      const { data } = await api.post('/sessions', { conceptId, level });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      router.push(`/session/${data.id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setCreating(null);
    }
  };

  if (isLoading) {
    return <SessionSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">학습 세션</h1>
          <p className="mb-5 text-sm text-gray-400">
            학습할 개념을 선택하세요 &middot; 현재 플랜으로 Level {maxLevel}까지 이용 가능
          </p>
          <DomainTabs
            activeId={activeDomain}
            onChange={(id) => {
              setActiveDomain(id);
              router.replace(`/session?domain=${id}`);
            }}
          />
        </div>

        <div className="mb-6">
          <UsageWarning />
        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError('')} className="mb-6" />
        )}

        {conceptsByDomain.length > 0 ? (
          <div className="space-y-10">
            {Object.entries(levelGroups)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, items]) => {
                const lvl = Number(level);
                const locked = lvl > maxLevel;

                return (
                  <div key={level}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold ${
                        locked ? 'bg-gray-100 text-gray-300' : 'bg-primary-50 text-primary-500'
                      }`}>
                        {level}
                      </span>
                      <div>
                        <h2 className={`text-base font-bold ${locked ? 'text-gray-300' : 'text-gray-900'}`}>
                          {levelLabels[lvl] ?? `Level ${level}`}
                        </h2>
                        {locked && (
                          <p className="text-xs text-gray-300">Pro 이상 플랜에서 이용 가능</p>
                        )}
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
                      {items.map((concept) => {
                        const score = masteryMap.get(concept.id);
                        const isCreating = creating === concept.id;

                        return (
                          <div key={concept.id} className="rounded-3xl bg-white p-5 shadow-sm transition hover:shadow-md">
                            <div className="mb-2 flex items-start justify-between">
                              <h3 className="font-semibold text-gray-800">{concept.name}</h3>
                              {score !== undefined && (
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  score >= 80 ? 'bg-emerald-50 text-emerald-600'
                                    : score >= 50 ? 'bg-amber-50 text-amber-600'
                                      : 'bg-red-50 text-red-500'
                                }`}>
                                  {score.toFixed(0)}%
                                </span>
                              )}
                            </div>
                            <p className="mb-4 text-sm leading-relaxed text-gray-400 line-clamp-2">
                              {concept.description}
                            </p>
                            <button
                              onClick={() => handleStart(concept.id, concept.level)}
                              disabled={isCreating}
                              className="w-full rounded-2xl bg-primary-50 py-2.5 text-sm font-semibold text-primary-600 transition hover:bg-primary-100 disabled:opacity-50"
                            >
                              {isCreating ? '생성 중...' : '세션 시작하기'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
            <p className="text-base font-medium text-gray-400">준비 중인 도메인입니다</p>
            <p className="mt-2 text-sm text-gray-300">곧 출시될 예정이에요</p>
          </div>
        )}
      </div>
    </div>
  );
}

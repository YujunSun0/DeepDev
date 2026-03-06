'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Trophy, RefreshCw, Check, Flame, Target, TrendingUp,
  BookOpen, Globe,
} from 'lucide-react';
import { useAchievements, useAchievementsCheck } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import type { AchievementRecord, AchievementAward } from '@/hooks/use-api';

const RECORD_ICONS: Record<string, React.ReactNode> = {
  STREAK_MAX: <Flame className="h-6 w-6 text-orange-500" />,
  SESSION_TOTAL: <Target className="h-6 w-6 text-primary-500" />,
  SCORE_MAX: <TrendingUp className="h-6 w-6 text-emerald-500" />,
  CONCEPT_MASTERED: <BookOpen className="h-6 w-6 text-violet-500" />,
  DOMAIN_EXPLORER: <Globe className="h-6 w-6 text-blue-500" />,
};

function RecordCard({ r }: { r: AchievementRecord }) {
  const icon = RECORD_ICONS[r.code] ?? <Trophy className="h-6 w-6 text-amber-500" />;
  return (
    <div className="flex min-w-[160px] shrink-0 flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{r.currentValue}</p>
      <p className="text-sm font-medium text-gray-700">{r.name}</p>
      {r.achievedAt && (
        <p className="text-xs text-gray-400">
          {new Date(r.achievedAt).toLocaleDateString('ko-KR')}
        </p>
      )}
    </div>
  );
}

function AwardIcon({ a }: { a: AchievementAward }) {
  const [imgError, setImgError] = useState(false);
  const hasIcon = Boolean(a.icon) && !imgError;

  if (!hasIcon) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-300 text-gray-500">
        <Trophy className="h-6 w-6" />
      </div>
    );
  }
  return (
    <Image
      src={a.icon!}
      alt={a.name}
      width={48}
      height={48}
      className={`object-contain ${!a.unlocked ? 'opacity-40 grayscale' : ''}`}
      onError={() => setImgError(true)}
    />
  );
}

function AwardCard({ a }: { a: AchievementAward }) {
  const progress = a.progress;
  const percent = progress.target > 0
    ? Math.min(100, Math.round((progress.current / progress.target) * 100))
    : 0;

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
        a.unlocked
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-gray-100 bg-white'
      }`}
    >
      <div className="relative">
        <AwardIcon a={a} />
        {a.unlocked && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-2.5 w-2.5" />
          </div>
        )}
      </div>
      <p className="text-center text-sm font-semibold text-gray-900">{a.description}</p>
      {a.unlocked ? (
        <span className="text-xs text-emerald-600">달성</span>
      ) : (
        <div className="w-full">
          <div className="h-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary-400 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-0.5 text-center text-xs text-gray-500">
            {progress.current}/{progress.target}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const { data, isPending, refetch } = useAchievements();
  const { mutate: checkAchievements, isPending: checking } = useAchievementsCheck();

  if (!user) return null;

  const records = data?.records ?? [];
  const awards = data?.awards ?? [];
  const unlockedCount = awards.filter((a) => a.unlocked).length;

  // Awards를 업적 이름별로 그룹화 (연속 학습왕, 세션 마스터 등)
  const awardGroups = new Map<string, AchievementAward[]>();
  for (const a of awards) {
    if (!awardGroups.has(a.name)) awardGroups.set(a.name, []);
    awardGroups.get(a.name)!.push(a);
  }
  for (const arr of awardGroups.values()) {
    arr.sort((a, b) => a.targetValue - b.targetValue);
  }
  const sortedGroupEntries = Array.from(awardGroups.entries());

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Trophy className="h-7 w-7 text-amber-500" />
              업적
            </h1>
            <p className="text-sm text-gray-500">
              Personal Records와 Awards를 확인하세요
            </p>
          </div>
          <button
            onClick={() => checkAchievements()}
            disabled={checking || isPending}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {isPending ? (
          <div className="space-y-8">
            <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Personal Records - 가로 스크롤 */}
            <section className="mb-10">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                Personal Records
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {records.map((r) => (
                  <RecordCard key={r.id} r={r} />
                ))}
              </div>
            </section>

            {/* Awards - 업적별 그룹 */}
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                Awards ({unlockedCount}/{awards.length})
              </h2>
              <div className="space-y-8">
                {sortedGroupEntries.map(([name, items]) => (
                  <div key={name}>
                    <h3 className="mb-3 text-base font-semibold text-gray-800">{name}</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {items.map((a) => (
                        <AwardCard key={a.id} a={a} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

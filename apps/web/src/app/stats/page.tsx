'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Lock as LockIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSessions } from '@/hooks/use-api';

const PERIOD_OPTIONS = [
  { value: 7, label: '7일' },
  { value: 30, label: '30일' },
  { value: 90, label: '90일' },
] as const;

const CHART_COLORS = [
  '#8b5cf6', '#34d399', '#f59e0b', '#ef4444', '#3b82f6',
  '#ec4899', '#14b8a6', '#f97316',
];

interface Session {
  id: string;
  conceptId: string;
  score: number | null;
  createdAt: string;
  concept: { name: string };
}

function filterByPeriod(sessions: Session[], days: number): Session[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return sessions.filter((s) => new Date(s.createdAt) >= cutoff);
}

function aggregateScoreByDate(sessions: Session[]): { date: string; avgScore: number; count: number }[] {
  const withScore = sessions.filter((s) => s.score != null) as (Session & { score: number })[];
  const byDate = new Map<string, { sum: number; count: number }>();

  for (const s of withScore) {
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const cur = byDate.get(key) ?? { sum: 0, count: 0 };
    cur.sum += s.score;
    cur.count += 1;
    byDate.set(key, cur);
  }

  return Array.from(byDate.entries())
    .map(([date, { sum, count }]) => ({
      date,
      avgScore: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, label: d.date.slice(5).replace('-', '/') }));
}

function aggregateCountByDate(sessions: Session[]): { date: string; count: number }[] {
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }
  return Array.from(byDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, label: d.date.slice(5).replace('-', '/') }));
}

function aggregateByConcept(sessions: Session[]): { name: string; value: number }[] {
  const byConcept = new Map<string, number>();
  for (const s of sessions) {
    const name = s.concept?.name ?? '알 수 없음';
    byConcept.set(name, (byConcept.get(name) ?? 0) + 1);
  }
  return Array.from(byConcept.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export default function StatsPage() {
  const { user } = useAuth();
  const { data: sessionsData } = useSessions({ state: 'CLOSED', limit: 200 });
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const isPro = user?.planType === 'PRO' || user?.planType === 'MASTER';
  const allSessions = sessionsData?.items ?? [];
  const filtered = useMemo(() => filterByPeriod(allSessions, period), [allSessions, period]);

  const scoreData = useMemo(() => aggregateScoreByDate(filtered), [filtered]);
  const countData = useMemo(() => aggregateCountByDate(filtered), [filtered]);
  const conceptData = useMemo(() => aggregateByConcept(filtered), [filtered]);

  if (!isPro) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
            <LockIcon className="h-8 w-8 text-primary-500" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Pro 플랜 전용</h1>
          <p className="mb-6 text-sm text-gray-500">
            학습 통계 페이지는 Pro 플랜에서만 이용할 수 있습니다.
            <br />
            점수 추이, 일별 세션 수, 개념별 학습 분포를 확인하세요.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Pro로 업그레이드
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">학습 통계</h1>
            <p className="text-sm text-gray-400">학습 점수 추이와 활동 현황을 확인하세요</p>
          </div>
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  period === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Score Trend */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <TrendingUp className="h-4 w-4 text-primary-400" />
              점수 추이
            </h2>
            {scoreData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number) => [`${value}점`, '평균 점수']}
                      labelFormatter={(label) => `날짜: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                해당 기간에 완료한 세션이 없습니다
              </div>
            )}
          </div>

          {/* Session Count */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              일별 완료 세션 수
            </h2>
            {countData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number) => [value, '완료 세션']}
                      labelFormatter={(label) => `날짜: ${label}`}
                    />
                    <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                해당 기간에 완료한 세션이 없습니다
              </div>
            )}
          </div>

          {/* Concept Distribution */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <PieChartIcon className="h-4 w-4 text-amber-500" />
              개념별 학습 분포
            </h2>
            {conceptData.length > 0 ? (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="h-64 w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conceptData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {conceptData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        formatter={(value: number) => [value, '세션 수']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {conceptData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="flex-1 truncate text-sm text-gray-700">{c.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{c.value}회</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                해당 기간에 완료한 세션이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Trophy, Flame, BookOpen, TrendingUp,
  Braces, Box, ScanSearch, FunctionSquare, Layers,
  Cpu, ArrowUpDown, Lock as LockIcon, Pointer,
  Globe, Repeat, Timer, Workflow, Zap,
  ChevronRight, Sparkles, Target, AlertTriangle, Info,
  Hash, LayoutList, GitBranch, Binary, Network, BarChart3,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGSI, useConceptTree, useWeakConcepts, useSessions, useMasteries, useAchievements } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DomainTabs } from '@/components/domain-tabs';
import { UsageWarning } from '@/components/usage-warning';
import { GrowthChart } from '@/components/charts';
import { DashboardSkeleton } from '@/components/skeletons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { LanguageOnboardingOverlay, PREFERRED_LANGUAGE_DISMISS_KEY } from '@/components/language-onboarding-overlay';
import { getMaxLevel } from '@/lib/plan';

/* ───── helpers ───── */

function getMasteryBadge(score: number) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-600';
  if (score >= 50) return 'bg-amber-50 text-amber-600';
  return 'bg-red-50 text-red-500';
}

function getMasteryLabel(score: number) {
  if (score >= 80) return 'Mastered';
  if (score >= 50) return 'Intermediate';
  return 'Weak';
}

function getMasteryRingColor(score: number) {
  if (score >= 80) return '#34d399';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

function ProgressRing({ value, size = 100, stroke = 8, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

const conceptIcons: Record<string, React.ReactNode> = {
  '변수 (Variables)': <Braces className="h-4 w-4" />,
  '타입 (Types)': <ScanSearch className="h-4 w-4" />,
  '스코프 (Scope)': <Layers className="h-4 w-4" />,
  '함수 (Functions)': <FunctionSquare className="h-4 w-4" />,
  '배열/객체 (Array & Object)': <Box className="h-4 w-4" />,
  '실행 컨텍스트 (Execution Context)': <Cpu className="h-4 w-4" />,
  '호이스팅 (Hoisting)': <ArrowUpDown className="h-4 w-4" />,
  '클로저 (Closure)': <LockIcon className="h-4 w-4" />,
  'this 바인딩': <Pointer className="h-4 w-4" />,
  '프로토타입 (Prototype)': <Workflow className="h-4 w-4" />,
  'Event Loop': <Repeat className="h-4 w-4" />,
  'Call Stack': <Layers className="h-4 w-4" />,
  'Task vs Microtask': <Timer className="h-4 w-4" />,
  'Promise 내부 동작': <Globe className="h-4 w-4" />,
  'async/await 동작 원리': <Zap className="h-4 w-4" />,
  // CS 기초
  '배열 (Array)': <LayoutList className="h-4 w-4" />,
  '스택 (Stack)': <Layers className="h-4 w-4" />,
  '큐 (Queue)': <LayoutList className="h-4 w-4" />,
  '연결 리스트 (Linked List)': <GitBranch className="h-4 w-4" />,
  'Big O 표기법': <BarChart3 className="h-4 w-4" />,
  '해시 테이블 기초': <Hash className="h-4 w-4" />,
  '해시 충돌 해결': <Hash className="h-4 w-4" />,
  '트리 기초': <GitBranch className="h-4 w-4" />,
  '그래프 기초': <Network className="h-4 w-4" />,
  '정렬 알고리즘': <BarChart3 className="h-4 w-4" />,
  '이진 탐색': <Binary className="h-4 w-4" />,
  '시간·공간 복잡도 분석': <BarChart3 className="h-4 w-4" />,
  // OS & 네트워크
  '프로세스 vs 스레드': <Cpu className="h-4 w-4" />,
  '메모리 관리 기초': <Layers className="h-4 w-4" />,
  'TCP/IP 기초': <Network className="h-4 w-4" />,
  'CPU 스케줄링': <Timer className="h-4 w-4" />,
  '동기화 (뮤텍스, 세마포어)': <LockIcon className="h-4 w-4" />,
  'HTTP/HTTPS': <Globe className="h-4 w-4" />,
  'REST API': <Globe className="h-4 w-4" />,
  '데드락': <LockIcon className="h-4 w-4" />,
  '가상 메모리': <Layers className="h-4 w-4" />,
  'DNS': <Network className="h-4 w-4" />,
  '웹소켓': <Repeat className="h-4 w-4" />,
  // React
  'React 컴포넌트': <Box className="h-4 w-4" />,
  'JSX': <Braces className="h-4 w-4" />,
  'Props': <Pointer className="h-4 w-4" />,
  '조건부 렌더링': <FunctionSquare className="h-4 w-4" />,
  '리스트 렌더링': <LayoutList className="h-4 w-4" />,
  '컴포넌트 순수성': <Zap className="h-4 w-4" />,
  '이벤트 처리': <Pointer className="h-4 w-4" />,
  'State (useState)': <Layers className="h-4 w-4" />,
  'State 끌어올리기': <ArrowUpDown className="h-4 w-4" />,
  'useReducer': <Workflow className="h-4 w-4" />,
  'Context': <Globe className="h-4 w-4" />,
  'useEffect': <Repeat className="h-4 w-4" />,
  'useRef': <Pointer className="h-4 w-4" />,
  'Custom Hooks': <Zap className="h-4 w-4" />,
  'useReducer + Context': <Workflow className="h-4 w-4" />,
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group/tip relative ml-1 inline-flex">
      <Info className="h-3.5 w-3.5 cursor-help text-gray-300 transition hover:text-gray-400" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover/tip:opacity-100">
        <span className="block whitespace-nowrap rounded-xl bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </span>
      </span>
    </span>
  );
}

const levelMeta: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '기초 개념', color: 'text-blue-600', bg: 'bg-blue-50' },
  2: { label: '중급', color: 'text-violet-600', bg: 'bg-violet-50' },
  3: { label: '비동기 심화', color: 'text-orange-600', bg: 'bg-orange-50' },
  4: { label: '내부 메커니즘', color: 'text-rose-600', bg: 'bg-rose-50' },
  5: { label: '실전 사고력', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const levelMetaCS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '기초', color: 'text-blue-600', bg: 'bg-blue-50' },
  2: { label: '중급', color: 'text-violet-600', bg: 'bg-violet-50' },
  3: { label: '심화', color: 'text-orange-600', bg: 'bg-orange-50' },
  4: { label: '심화', color: 'text-rose-600', bg: 'bg-rose-50' },
  5: { label: '심화', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

/* ───── page ───── */

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const domainFromUrl = searchParams.get('domain');
  const VALID_DOMAINS = ['javascript', 'dsa', 'os-network', 'react'] as const;
  const activeDomain =
    domainFromUrl && VALID_DOMAINS.includes(domainFromUrl as (typeof VALID_DOMAINS)[number])
      ? domainFromUrl
      : 'javascript';

  const [sessionStartModalOpen, setSessionStartModalOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<{ id: string; name: string; level: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const [sessionStartError, setSessionStartError] = useState('');
  const [languageOverlayOpen, setLanguageOverlayOpen] = useState<boolean | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: gsi, isPending: gsiLoading, isError: gsiError, error: gsiErrorObj } = useGSI();
  const { data: concepts, isPending: conceptsLoading, isError: conceptsError, error: conceptsErrorObj } = useConceptTree();
  const { data: weakConcepts } = useWeakConcepts();
  const { user, refreshUser } = useAuth();
  const { data: sessionsData, isPending: sessionsLoading, isError: sessionsError, error: sessionsErrorObj } = useSessions();
  const { data: closedSessionsData } = useSessions({ state: 'CLOSED', limit: 100 });
  const { data: masteries, isPending: masteriesLoading, isError: masteriesError, error: masteriesErrorObj } = useMasteries();
  const { data: achievementsData } = useAchievements();

  const isDashboardLoading = gsiLoading || conceptsLoading || sessionsLoading || masteriesLoading;
  const hasError = gsiError || conceptsError || sessionsError || masteriesError;
  const firstError = gsiErrorObj ?? conceptsErrorObj ?? sessionsErrorObj ?? masteriesErrorObj;

  const isPro = user?.planType === 'PRO' || user?.planType === 'MASTER';
  const maxLevel = getMaxLevel(user?.planType);

  // 회원가입(이메일 인증) 완료 후 대시보드 진입 시 선호 언어 선택 오버레이 (게임 직업 선택 느낌)
  useEffect(() => {
    if (languageOverlayOpen !== null) return;
    if (!user) return;
    const noLang = user.preferredLanguage == null || user.preferredLanguage === '';
    const notDismissed = typeof window === 'undefined' || !sessionStorage.getItem(PREFERRED_LANGUAGE_DISMISS_KEY);
    if (noLang && notDismissed) setLanguageOverlayOpen(true);
    else setLanguageOverlayOpen(false);
  }, [user, languageOverlayOpen]);

  const masteryMap = new Map(
    masteries?.map((m) => [m.conceptId, m.masteryScore]) ?? [],
  );

  const conceptsByDomain = concepts?.filter(
    (c) => (c as { domain?: string }).domain === activeDomain,
  );
  const levelGroups = conceptsByDomain?.reduce(
    (acc, c) => {
      if (!acc[c.level]) acc[c.level] = [];
      acc[c.level].push(c);
      return acc;
    },
    {} as Record<number, typeof conceptsByDomain>,
  );

  const gsiValue = gsi ?? 0;
  const gsiColor = gsiValue > 0 ? getMasteryRingColor(gsiValue) : '#e5e7eb';
  const sessions = sessionsData?.items ?? [];
  const closedSessions = sessions.filter(s => s.state === 'CLOSED');
  const chartSessions = closedSessionsData?.items ?? [];
  const inProgressSessions = sessions.filter(s => s.state !== 'CLOSED');
  const SESSION_STEP_LABELS: Record<string, string> = {
    INIT: '시작 준비',
    EXPLAINING: '개념 설명',
    OBJECTIVE: '객관식',
    SUBJECTIVE: '서술형',
    APPLICATION: '응용',
    SUMMARY: '요약',
  };
  const inProgressStepByConcept = new Map<string, string>();
  const sortedByCreated = [...inProgressSessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const s of sortedByCreated) {
    if (!inProgressStepByConcept.has(s.conceptId)) {
      inProgressStepByConcept.set(s.conceptId, s.state);
    }
  }
  const totalConcepts = concepts?.length ?? 0;
  const progressPercent = totalConcepts > 0
    ? Math.round(((masteries?.length ?? 0) / totalConcepts) * 100)
    : 0;

  if (isDashboardLoading) {
    return <DashboardSkeleton />;
  }

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['masteries'] });
    queryClient.invalidateQueries({ queryKey: ['concepts'] });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  };

  const handleConceptClick = (concept: { id: string; name: string; level: number }) => {
    if (concept.level > maxLevel) return;
    const existingSession = inProgressSessions.find((s) => s.conceptId === concept.id);
    if (existingSession) {
      router.push(`/session/${existingSession.id}`);
      return;
    }
    setSelectedConcept(concept);
    setSessionStartError('');
    setSessionStartModalOpen(true);
  };

  const handleConfirmSessionStart = async () => {
    if (!selectedConcept) return;
    setCreating(true);
    setSessionStartError('');
    try {
      const { data } = await api.post('/sessions', {
        conceptId: selectedConcept.id,
        level: selectedConcept.level,
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      setSessionStartModalOpen(false);
      setSelectedConcept(null);
      router.push(`/session/${data.id}`);
    } catch (err: unknown) {
      setSessionStartError(getApiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {languageOverlayOpen && (
        <LanguageOnboardingOverlay
          onComplete={() => {
            refreshUser();
            setLanguageOverlayOpen(false);
          }}
          onDismiss={() => setLanguageOverlayOpen(false)}
        />
      )}
      <div className="mx-auto max-w-7xl">
        {hasError && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-red-50 px-4 py-3.5 text-sm text-red-600">
            <span>{getApiErrorMessage(firstError)}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="mb-5 text-sm text-gray-400">학습 현황을 한눈에 확인하세요</p>
          <DomainTabs
            activeId={activeDomain}
            onChange={(id) => {
              router.replace(`/dashboard?domain=${id}`);
            }}
          />
        </div>

        <div className="mb-6">
          <UsageWarning />
        </div>

        {/* ───── Stats Row ───── */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-5 lg:grid-cols-4">
          {/* GSI - with ring */}
          <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="relative">
                <div className="sm:hidden">
                  <ProgressRing value={gsiValue} size={52} stroke={5} color={gsiColor} />
                </div>
                <div className="hidden sm:block">
                  <ProgressRing value={gsiValue} size={80} stroke={7} color={gsiColor} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-extrabold sm:text-lg ${gsiValue > 0 ? 'text-gray-900' : 'text-gray-200'}`}>
                    {gsiLoading ? '...' : gsiValue.toFixed(0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="flex items-center text-[11px] font-medium text-gray-400 sm:text-xs">
                  Skill Index
                  <InfoTooltip text="모든 개념의 평균 숙련도입니다" />
                </p>
                <p className="mt-0.5 text-xs font-bold text-gray-800 sm:mt-1 sm:text-sm">
                  {gsiValue > 0 ? getMasteryLabel(gsiValue) : '측정 전'}
                </p>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 sm:h-12 sm:w-12 sm:rounded-2xl">
                <Flame className="h-4.5 w-4.5 text-primary-500 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="flex items-center text-[11px] font-medium text-gray-400 sm:text-xs">
                  완료 세션
                  <InfoTooltip text="끝까지 완료한 학습 세션 수입니다" />
                </p>
                <p className="mt-0.5 text-xl font-extrabold text-gray-900 sm:mt-1 sm:text-2xl">
                  {closedSessions.length}
                  {inProgressSessions.length > 0 && (
                    <span className="ml-1 text-[10px] font-medium text-gray-300 sm:ml-1.5 sm:text-xs">
                      +{inProgressSessions.length} 진행 중
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 sm:h-12 sm:w-12 sm:rounded-2xl">
                <BookOpen className="h-4.5 w-4.5 text-emerald-500 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="flex items-center text-[11px] font-medium text-gray-400 sm:text-xs">
                  학습 진도
                  <InfoTooltip text="한 번이라도 학습한 개념 수입니다" />
                </p>
                <p className="mt-0.5 text-xl font-extrabold text-gray-900 sm:mt-1 sm:text-2xl">
                  {masteries?.length ?? 0}
                  <span className="text-xs font-medium text-gray-300 sm:text-sm"> / {concepts?.length ?? 0}</span>
                </p>
              </div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 sm:mt-4 sm:h-2">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Weak count */}
          <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 sm:h-12 sm:w-12 sm:rounded-2xl">
                <Target className="h-4.5 w-4.5 text-amber-500 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="flex items-center text-[11px] font-medium text-gray-400 sm:text-xs">
                  약점 개념
                  <InfoTooltip text="숙련도 50% 미만인 개념 수입니다" />
                </p>
                <p className="mt-0.5 text-xl font-extrabold text-gray-900 sm:mt-1 sm:text-2xl">{weakConcepts?.length ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ───── Main Content ───── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Concept Tree */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">개념 트리</h2>
              <Link
                href="/session"
                className="flex items-center gap-1 rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                세션 시작
              </Link>
            </div>

            {levelGroups && Object.keys(levelGroups).length > 0 ? (
              Object.entries(levelGroups)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, items]) => {
                  const metaMap = activeDomain !== 'javascript' && activeDomain !== 'react' ? levelMetaCS : levelMeta;
                  const meta = metaMap[Number(level)] ?? { label: `Level ${level}`, color: 'text-gray-600', bg: 'bg-gray-50' };
                  return (
                    <div key={level} className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-2.5">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${meta.bg} ${meta.color}`}>
                          {level}
                        </span>
                        <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
                        <span className="ml-auto rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-400">{items!.length}개</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {items!.map((concept) => {
                          const score = masteryMap.get(concept.id);
                          const icon = conceptIcons[concept.name];
                          const locked = concept.level > maxLevel;
                          return (
                            <button
                              key={concept.id}
                              type="button"
                              onClick={() => handleConceptClick(concept)}
                              disabled={locked}
                              className={`group flex w-full items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3 text-left transition ${
                                locked
                                  ? 'cursor-default opacity-60'
                                  : 'cursor-pointer hover:border-primary-100 hover:bg-primary-50/30'
                              }`}
                            >
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                                {icon ?? <BookOpen className="h-4 w-4" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-800 group-hover:text-primary-700">
                                  {concept.name}
                                </p>
                                {score !== undefined ? (
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                                      <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                          score >= 80 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
                                        }`}
                                        style={{ width: `${score}%` }}
                                      />
                                    </div>
                                    <span className="shrink-0 text-xs font-semibold text-gray-500">{score.toFixed(0)}%</span>
                                  </div>
                                ) : (() => {
                                  const stepLabel = inProgressStepByConcept.get(concept.id);
                                  return (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                      {stepLabel
                                        ? `진행 중: ${SESSION_STEP_LABELS[stepLabel] ?? stepLabel}`
                                        : '미학습'}
                                    </p>
                                  );
                                })()}
                              </div>
                              {locked ? (
                                <LockIcon className="h-4 w-4 shrink-0 text-gray-300" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0 text-gray-200 transition group-hover:text-primary-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            ) : conceptsByDomain && conceptsByDomain.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
                <p className="text-sm font-medium text-gray-400">준비 중인 도메인입니다</p>
                <p className="mt-1 text-xs text-gray-300">곧 출시될 예정이에요</p>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-3xl bg-white shadow-sm">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
              </div>
            )}
          </div>

          {/* ───── Right Sidebar ───── */}
          <div className="space-y-6">
            {/* 업적 미리보기 */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  업적
                </h2>
                <Link
                  href="/achievements"
                  className="flex items-center gap-1 text-xs font-semibold text-primary-500 transition hover:text-primary-600"
                >
                  더보기
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {achievementsData?.awards && achievementsData.awards.length > 0 ? (
                <div className="space-y-2">
                  {achievementsData.awards
                    .filter((a) => a.unlocked)
                    .slice(0, 4)
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <Trophy className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800">{a.description}</p>
                          <p className="text-xs text-gray-500">
                            {a.achievedAt
                              ? new Date(a.achievedAt).toLocaleDateString('ko-KR')
                              : '달성'}
                          </p>
                        </div>
                      </div>
                    ))}
                  {achievementsData.awards.filter((a) => a.unlocked).length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-400">
                      학습을 완료하면 업적을 획득할 수 있어요
                    </p>
                  )}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">
                  학습을 완료하면 업적을 획득할 수 있어요
                </p>
              )}
            </div>

            {/* Growth Chart (Pro only) */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <TrendingUp className="h-4 w-4 text-primary-400" />
                성장 그래프
                {!isPro && <LockIcon className="h-3.5 w-3.5 text-gray-300" />}
              </h2>
              {isPro ? (
                <GrowthChart sessions={chartSessions} />
              ) : (
                <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-gray-50 text-center">
                  <LockIcon className="mb-2 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">Pro 플랜 전용 기능</p>
                  <p className="mt-0.5 text-xs text-gray-400">업그레이드하면 학습 점수 추이를 확인할 수 있습니다</p>
                  <Link
                    href="/pricing"
                    className="mt-3 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
                  >
                    Pro로 업그레이드
                  </Link>
                </div>
              )}
            </div>

            {/* Mastery Overview */}
            {masteries && masteries.length > 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  숙련도 분포
                </h2>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Mastered', count: masteries.filter(m => m.masteryScore >= 80).length, color: 'bg-emerald-400' },
                    { label: 'Intermediate', count: masteries.filter(m => m.masteryScore >= 50 && m.masteryScore < 80).length, color: 'bg-amber-400' },
                    { label: 'Weak', count: masteries.filter(m => m.masteryScore < 50).length, color: 'bg-red-400' },
                  ].map((g) => (
                    <div key={g.label} className="flex-1 text-center">
                      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${g.color}/10`}>
                        <span className="text-lg font-extrabold text-gray-800">{g.count}</span>
                      </div>
                      <p className="text-[10px] font-medium text-gray-400">{g.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-100">
                  {(() => {
                    const total = masteries.length;
                    const mastered = masteries.filter(m => m.masteryScore >= 80).length;
                    const inter = masteries.filter(m => m.masteryScore >= 50 && m.masteryScore < 80).length;
                    const weak = masteries.filter(m => m.masteryScore < 50).length;
                    return (
                      <>
                        {mastered > 0 && <div className="bg-emerald-400" style={{ width: `${(mastered / total) * 100}%` }} />}
                        {inter > 0 && <div className="bg-amber-400" style={{ width: `${(inter / total) * 100}%` }} />}
                        {weak > 0 && <div className="bg-red-400" style={{ width: `${(weak / total) * 100}%` }} />}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Weak Concepts */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                약점 개념
              </h2>
              {weakConcepts && weakConcepts.length > 0 ? (
                <div className="space-y-3">
                  {weakConcepts.map((w) => {
                    const icon = conceptIcons[w.concept.name];
                    return (
                      <div key={w.conceptId} className="rounded-2xl bg-red-50/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-500">
                            {icon ?? <AlertTriangle className="h-3.5 w-3.5" />}
                          </div>
                          <span className="flex-1 text-sm font-medium text-gray-700">{w.concept.name}</span>
                          <span className="text-sm font-bold text-red-500">{w.masteryScore.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-red-100">
                          <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${w.masteryScore}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-20 flex-col items-center justify-center text-center">
                  <p className="text-sm text-gray-300">
                    {masteries && masteries.length > 0 ? '약점이 없습니다!' : '학습을 시작하면 표시됩니다'}
                  </p>
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <TrendingUp className="h-4 w-4 text-primary-400" />
                  최근 세션
                </h2>
                {sessions.length > 0 && (
                  <Link
                    href="/history"
                    className="flex items-center gap-0.5 text-xs font-medium text-gray-400 transition hover:text-primary-500"
                  >
                    모두 보기
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-2.5">
                  {sessions.slice(0, 5).map((s) => {
                    const icon = conceptIcons[s.concept.name];
                    const isInProgress = s.state !== 'CLOSED';
                    const href = isInProgress ? `/session/${s.id}` : `/history?detail=${s.id}`;
                    return (
                      <Link
                        key={s.id}
                        href={href}
                        className="group flex items-center gap-3 rounded-2xl bg-gray-50 px-3.5 py-3 transition hover:bg-primary-50/50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                          {icon ?? <BookOpen className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-700 group-hover:text-primary-700">{s.concept.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(s.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        {isInProgress ? (
                          <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-semibold text-primary-500">
                            <Sparkles className="h-3 w-3" />
                            이어서 학습
                          </span>
                        ) : s.score !== null ? (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getMasteryBadge(s.score)}`}>
                            {s.score.toFixed(0)}점
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] text-gray-400">완료</span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-200 transition group-hover:text-primary-400" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-20 flex-col items-center justify-center text-center">
                  <p className="text-sm text-gray-300">아직 세션 기록이 없습니다</p>
                </div>
              )}
            </div>

            {/* Quick Start CTA */}
            <Link
              href="/session"
              className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-primary-500 to-violet-500 p-6 text-white shadow-md shadow-primary-200 transition hover:shadow-lg hover:shadow-primary-300"
            >
              <div>
                <p className="text-base font-bold">학습을 시작하세요</p>
                <p className="mt-1 text-xs text-white/70">새로운 개념을 탐험해보세요</p>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={sessionStartModalOpen}
        onClose={() => {
          setSessionStartModalOpen(false);
          setSelectedConcept(null);
          setSessionStartError('');
        }}
        onConfirm={handleConfirmSessionStart}
        title={selectedConcept ? `${selectedConcept.name} 학습을 시작할까요?` : '세션 시작'}
        message="이 세션은 월 세션 한도에 포함됩니다."
        confirmText="시작하기"
        cancelText="취소"
        closeOnConfirm={false}
        confirmLoading={creating}
        confirmLoadingText="시작 중..."
        error={sessionStartError || undefined}
      />
    </div>
  );
}

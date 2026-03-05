'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Clock, CheckCircle2, Loader2, ChevronLeft, ChevronRight,
  BookOpen, Trophy, AlertTriangle, Eye, Play, X,
} from 'lucide-react';
import { useSessions } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { DomainTabs } from '@/components/domain-tabs';
import { HistorySkeleton } from '@/components/skeletons';

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return null;
  const rounded = Math.round(score);
  const color =
    rounded >= 80 ? 'bg-emerald-50 text-emerald-600' :
    rounded >= 50 ? 'bg-amber-50 text-amber-600' :
    'bg-red-50 text-red-500';
  return (
    <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${color}`}>
      {rounded}점
    </span>
  );
}

function StateBadge({ state }: { state: string }) {
  if (state === 'CLOSED') {
    return (
      <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> 완료
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
      <Play className="h-3 w-3" /> 진행 중
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

/* ═══════════════════════════════════════════════════
   상세 모달
   ═══════════════════════════════════════════════════ */

interface SessionDetail {
  id: string;
  state: string;
  score: number | null;
  tokenUsed: number;
  concept: { name: string };
  context?: any;
  createdAt: string;
}

type DetailTab = 'summary' | 'explanation' | 'objective' | 'subjective' | 'application';

function DetailModal({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [data, setData] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('summary');

  useEffect(() => {
    api.get<SessionDetail>(`/sessions/${sessionId}`).then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sessionId]);

  const ctx = data?.context;

  const tabs = useMemo(() => {
    if (!ctx) return [];
    const list: { id: DetailTab; label: string }[] = [{ id: 'summary', label: '요약' }];
    if (ctx.explanation) list.push({ id: 'explanation', label: '개념설명' });
    if (ctx.objective) list.push({ id: 'objective', label: '객관식' });
    if (ctx.subjective?.userAnswer) list.push({ id: 'subjective', label: '서술형' });
    if (ctx.application?.userAnswer) list.push({ id: 'application', label: '응용' });
    return list;
  }, [ctx]);

  useEffect(() => {
    if (tabs.length && !tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : !data ? (
          <p className="py-16 text-center text-sm text-gray-400">데이터를 불러올 수 없습니다</p>
        ) : (
          <>
            {/* 헤더 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">{data.concept.name}</h2>
                <StateBadge state={data.state} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{formatDate(data.createdAt)}</span>
                {data.score !== null && (
                  <>
                    <span>·</span>
                    <span>총점 <strong className="text-gray-600">{Math.round(data.score)}점</strong></span>
                  </>
                )}
                <span>·</span>
                <span>토큰 {data.tokenUsed.toLocaleString()}</span>
              </div>
            </div>

            {data.state !== 'CLOSED' ? (
              <div className="rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-700">
                <p className="font-semibold mb-1">진행 중인 세션입니다</p>
                <p className="text-xs text-amber-600/70">이어서 진행하려면 학습 세션 페이지에서 계속할 수 있습니다.</p>
                <Link
                  href={`/session/${data.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-400"
                >
                  <Play className="h-3.5 w-3.5" />
                  이어서 학습하기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 탭 */}
                {tabs.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                          activeTab === t.id
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 탭별 콘텐츠 */}
                <div className="min-h-[200px]">
                  {activeTab === 'summary' && ctx && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: '객관식', score: ctx.objective?.score },
                          { label: '서술형', score: ctx.subjective?.score },
                          { label: '응용', score: ctx.application?.score },
                        ].map((item) => (
                          <div key={item.label} className="rounded-2xl bg-gray-50 p-4 text-center">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{item.label}</p>
                            <p className={`mt-1 text-2xl font-extrabold ${
                              (item.score ?? 0) >= 80 ? 'text-emerald-500' :
                              (item.score ?? 0) >= 50 ? 'text-amber-500' : 'text-red-400'
                            }`}>
                              {item.score ?? '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                      {ctx.summary && (
                        <Section title="AI 총평">
                          <MarkdownRenderer content={ctx.summary.overallAssessment} />
                          {ctx.summary.recommendations?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-gray-500 mb-1">추천 학습</p>
                              <ul className="space-y-1">
                                {ctx.summary.recommendations.map((r: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Section>
                      )}
                    </div>
                  )}

                  {activeTab === 'explanation' && ctx?.explanation && (
                    <Section title="개념 설명">
                      <MarkdownRenderer content={ctx.explanation.explanation} />
                    </Section>
                  )}

                  {activeTab === 'objective' && ctx?.objective && (
                    <Section title="객관식 문제">
                      <MarkdownRenderer content={ctx.objective.question} />
                      {ctx.objective.userAnswer && (
                        <div className="mt-3 space-y-1.5">
                          {ctx.objective.options?.map((opt: string, i: number) => {
                            const label = String.fromCharCode(65 + i);
                            const isUser = ctx.objective.userAnswer?.toUpperCase() === label;
                            const isCorrect = ctx.objective.correctAnswer?.toUpperCase() === label;
                            return (
                              <div
                                key={i}
                                className={`rounded-xl px-3 py-2 text-sm ${
                                  isCorrect ? 'bg-emerald-50 text-emerald-700 font-medium' :
                                  isUser ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                <span className="font-bold mr-2">{label}.</span>{opt}
                                {isCorrect && <span className="ml-2 text-[10px]">✓ 정답</span>}
                                {isUser && !isCorrect && <span className="ml-2 text-[10px]">← 내 선택</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Section>
                  )}

                  {activeTab === 'subjective' && ctx?.subjective?.userAnswer && (
                    <Section title="서술형 문제">
                      <MarkdownRenderer content={ctx.subjective.question} />
                      <div className="mt-3 rounded-xl bg-blue-50/50 px-4 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">내 답변</p>
                        <p className="text-sm text-gray-700">{ctx.subjective.userAnswer}</p>
                      </div>
                      {ctx.subjective.feedback && (
                        <div className="mt-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">AI 피드백</p>
                          <MarkdownRenderer content={ctx.subjective.feedback} />
                        </div>
                      )}
                    </Section>
                  )}

                  {activeTab === 'application' && ctx?.application?.userAnswer && (
                    <Section title="응용 문제">
                      <MarkdownRenderer content={ctx.application.question} />
                      <div className="mt-3 rounded-xl bg-blue-50/50 px-4 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">내 코드</p>
                        <MarkdownRenderer content={`\`\`\`javascript\n${ctx.application.userAnswer}\n\`\`\``} />
                      </div>
                      {ctx.application.feedback && (
                        <div className="mt-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">AI 피드백</p>
                          <MarkdownRenderer content={ctx.application.feedback} />
                        </div>
                      )}
                    </Section>
                  )}

                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   메인 페이지
   ═══════════════════════════════════════════════════ */

type FilterState = '' | 'CLOSED' | 'IN_PROGRESS';

const HISTORY_DOMAINS = ['', 'javascript', 'dsa', 'os-network', 'react'];

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const detailFromQuery = searchParams.get('detail');
  const domainFromUrl = searchParams.get('domain');

  const [filter, setFilter] = useState<FilterState>('');
  const [domain, setDomain] = useState(
    domainFromUrl && HISTORY_DOMAINS.includes(domainFromUrl) ? domainFromUrl : '',
  );
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(detailFromQuery);

  useEffect(() => {
    if (detailFromQuery) setSelectedId(detailFromQuery);
  }, [detailFromQuery]);

  useEffect(() => {
    if (domainFromUrl !== null && domainFromUrl !== domain) {
      setDomain(HISTORY_DOMAINS.includes(domainFromUrl) ? domainFromUrl : '');
    }
  }, [domainFromUrl, domain]);

  const stateParam = filter === 'IN_PROGRESS' ? undefined : filter || undefined;
  const { data, isLoading } = useSessions({
    state: stateParam,
    domain: domain || undefined,
    page,
    limit: 15,
  });

  const items = filter === 'IN_PROGRESS'
    ? (data?.items ?? []).filter(s => s.state !== 'CLOSED')
    : (data?.items ?? []);

  const filters: { value: FilterState; label: string }[] = [
    { value: '', label: '전체' },
    { value: 'CLOSED', label: '완료' },
    { value: 'IN_PROGRESS', label: '진행 중' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">학습 기록</h1>
          <p className="text-sm text-gray-400">지금까지의 학습 세션을 확인하세요</p>
        </div>

        {/* 도메인 탭 */}
        <div className="mb-6">
          <DomainTabs
            activeId={domain}
            onChange={(id) => {
              setDomain(id);
              setPage(1);
              const params = new URLSearchParams(searchParams.toString());
              if (id) params.set('domain', id);
              else params.delete('domain');
              const newUrl = params.toString() ? `/history?${params}` : '/history';
              router.replace(newUrl);
            }}
            showAllOption
          />
        </div>

        {/* 필터 */}
        <div className="mb-6 flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
          {data && (
            <span className="ml-auto text-xs text-gray-400">
              총 {data.total}개
            </span>
          )}
        </div>

        {/* 목록 */}
        {isLoading ? (
          <HistorySkeleton />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Clock className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm text-gray-400">아직 학습 기록이 없습니다</p>
            <Link
              href={domain ? `/session?domain=${domain}` : '/session'}
              className="mt-4 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              첫 세션 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="w-full rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      s.state === 'CLOSED' ? 'bg-primary-50' : 'bg-amber-50'
                    }`}>
                      {s.state === 'CLOSED'
                        ? <Trophy className="h-5 w-5 text-primary-500" />
                        : <BookOpen className="h-5 w-5 text-amber-500" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">{s.concept.name}</p>
                        <StateBadge state={s.state} />
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{formatDate(s.createdAt)}</span>
                        <span>·</span>
                        <span>Lv.{s.concept.level}</span>
                        <span>·</span>
                        <span>토큰 {s.tokenUsed.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ScoreBadge score={s.score} />
                    <Eye className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-500">
              {page} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedId && (
        <DetailModal
          sessionId={selectedId}
          onClose={() => {
            setSelectedId(null);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('detail');
            const newUrl = params.toString() ? `/history?${params}` : '/history';
            router.replace(newUrl);
          }}
        />
      )}
    </div>
  );
}

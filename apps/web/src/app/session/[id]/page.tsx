'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, CheckCircle2, Circle, Loader2,
  ChevronRight, Sparkles, Trophy, AlertTriangle,
  ArrowRight, RotateCcw, Home, Send, Lightbulb, Code,
} from 'lucide-react';
import { api } from '@/lib/api';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { CodeEditor } from '@/components/code-editor';
import { DiscussionChat } from '@/components/discussion-chat';
import {
  sessionApi,
  type ExplanationData,
  type ObjectiveQuestionData,
  type ObjectiveAnswerResult,
  type SubjectiveAnswerResult,
  type ApplicationAnswerResult,
  type SummaryData,
} from '@/lib/session-api';

/* ── Types ── */

interface SessionInfo {
  id: string;
  state: string;
  concept: { id: string; name: string; description: string; level: number };
}

type Step = 'loading' | 'explain' | 'objective' | 'objective-result' | 'subjective' | 'subjective-result' | 'application' | 'application-result' | 'summary';

const STEP_LABELS: Record<string, string> = {
  explain: '개념 설명',
  objective: '객관식',
  subjective: '서술형',
  application: '응용',
  summary: '요약',
};

const STEP_ORDER = ['explain', 'objective', 'subjective', 'application', 'summary'] as const;

/* ── Page ── */

export default function SessionPlayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // data for each step
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [objectiveQ, setObjectiveQ] = useState<ObjectiveQuestionData | null>(null);
  const [objectiveResult, setObjectiveResult] = useState<ObjectiveAnswerResult | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [subjectiveQ, setSubjectiveQ] = useState<string>('');
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  const [subjectiveResult, setSubjectiveResult] = useState<SubjectiveAnswerResult | null>(null);
  const [applicationQ, setApplicationQ] = useState<string>('');
  const [applicationAnswer, setApplicationAnswer] = useState('');
  const [applicationResult, setApplicationResult] = useState<ApplicationAnswerResult | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  /* Load session info */
  useEffect(() => {
    if (!id) return;
    api.get<SessionInfo>(`/sessions/${id}`).then(({ data }) => {
      setSession(data);
      if (data.state === 'INIT') {
        setStep('loading');
        handleStart(data.id);
      } else if (data.state === 'CLOSED') {
        setStep('summary');
      } else {
        setStep('loading');
        handleStart(data.id);
      }
    }).catch(() => {
      setError('세션을 불러올 수 없습니다');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* Flow handlers */

  const handleStart = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.startSession(sessionId);
      setExplanation(result.explanation);
      setStep('explain');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string' && msg.includes('already started')) {
        setStep('explain');
      } else {
        setError(msg ?? 'AI 호출에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetObjective = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.getObjectiveQuestion(id);
      setObjectiveQ(result);
      setSelectedOption('');
      setStep('objective');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'AI 호출 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitObjective = async () => {
    if (!selectedOption) return;
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.submitObjectiveAnswer(id, selectedOption);
      setObjectiveResult(result);
      setStep('objective-result');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '답변 제출 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSubjective = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.getSubjectiveQuestion(id);
      setSubjectiveQ(result.question);
      setSubjectiveAnswer('');
      setStep('subjective');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'AI 호출 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSubjective = async () => {
    if (!subjectiveAnswer.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.submitSubjectiveAnswer(id, subjectiveAnswer);
      setSubjectiveResult(result);
      setStep('subjective-result');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '답변 제출 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGetApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.getApplicationQuestion(id);
      setApplicationQ(result.question);
      setApplicationAnswer('');
      setStep('application');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'AI 호출 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!applicationAnswer.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.submitApplicationAnswer(id, applicationAnswer);
      setApplicationResult(result);
      setStep('application-result');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '답변 제출 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await sessionApi.getSummary(id);
      setSummaryData(result);
      setStep('summary');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '요약 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  /* ── Helpers ── */

  const currentStepIndex = STEP_ORDER.indexOf(
    step.replace('-result', '') as typeof STEP_ORDER[number],
  );

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  }

  function getScoreBg(score: number) {
    if (score >= 80) return 'bg-emerald-50';
    if (score >= 50) return 'bg-amber-50';
    return 'bg-red-50';
  }

  /* ── Render ── */

  if (error && step === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center">
          <p className="mb-1 text-base font-semibold text-gray-800">오류가 발생했습니다</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setError(''); setStep('loading'); handleStart(id); }}
            className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400"
          >
            <RotateCcw className="h-3.5 w-3.5" /> 다시 시도
          </button>
          <button
            onClick={() => router.push('/session')}
            className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* ── Header ── */}
        {session && (
          <div className="mb-6">
            <p className="mb-1 text-xs font-medium text-primary-400">LEVEL {session.concept.level}</p>
            <h1 className="text-xl font-bold text-gray-900">{session.concept.name}</h1>
          </div>
        )}

        {/* ── Step Indicator ── */}
        <div className="mb-8 flex items-center gap-1">
          {STEP_ORDER.map((s, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <div key={s} className="flex flex-1 items-center gap-1">
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    done ? 'bg-primary-500 text-white' : active ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-300' : 'bg-gray-100 text-gray-300'
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-primary-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div className={`mt-[-16px] h-0.5 flex-1 rounded ${done ? 'bg-primary-400' : 'bg-gray-100'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* ── Loading ── */}
        {step === 'loading' && !error && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary-400" />
            </div>
            <p className="text-sm font-medium text-gray-400">AI가 개념을 분석 중입니다...</p>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* STEP 1: Explanation                      */}
        {/* ════════════════════════════════════════ */}
        {step === 'explain' && explanation && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-bold text-gray-900">개념 설명</h2>
              </div>
              <MarkdownRenderer content={explanation.explanation} />
            </div>

            {explanation.keyPoints.length > 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-gray-800">핵심 포인트</h3>
                </div>
                <ul className="space-y-2">
                  {explanation.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-500">{i + 1}</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.codeExample && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-gray-800">코드 예시</h3>
                </div>
                <MarkdownRenderer content={`\`\`\`javascript\n${explanation.codeExample}\n\`\`\``} />
              </div>
            )}

            <button
              onClick={handleGetObjective}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'AI가 문제를 생성 중...' : '다음: 객관식 문제'}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* STEP 2: Objective Question               */}
        {/* ════════════════════════════════════════ */}
        {step === 'objective' && objectiveQ && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Circle className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-bold text-gray-900">객관식 문제</h2>
              </div>
              <div className="mb-6">
                <MarkdownRenderer content={objectiveQ.question} />
              </div>
              <div className="space-y-2.5">
                {objectiveQ.options.map((opt) => {
                  const letter = opt.charAt(0);
                  const isSelected = selectedOption === letter;
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedOption(letter)}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm transition ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50 text-primary-700'
                          : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {letter}
                      </span>
                      {opt.slice(2).trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmitObjective}
              disabled={loading || !selectedOption}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? '채점 중...' : '답변 제출'}
            </button>
          </div>
        )}

        {/* ── Objective Result ── */}
        {step === 'objective-result' && objectiveResult && (
          <div className="space-y-5">
            <div className={`rounded-3xl p-6 shadow-sm ${objectiveResult.isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className="mb-3 flex items-center gap-2">
                {objectiveResult.isCorrect
                  ? <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  : <AlertTriangle className="h-6 w-6 text-red-500" />
                }
                <h2 className={`text-lg font-bold ${objectiveResult.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                  {objectiveResult.isCorrect ? '정답입니다!' : '오답입니다'}
                </h2>
                <span className={`ml-auto rounded-full px-3 py-1 text-sm font-bold ${objectiveResult.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {objectiveResult.score}점
                </span>
              </div>
              <MarkdownRenderer content={objectiveResult.feedback} />
            </div>

            <DiscussionChat sessionId={id} stepType="objective" />

            <button
              onClick={handleGetSubjective}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'AI가 문제를 생성 중...' : '다음: 서술형 문제'}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* STEP 3: Subjective Question              */}
        {/* ════════════════════════════════════════ */}
        {step === 'subjective' && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-500" />
                <h2 className="text-lg font-bold text-gray-900">서술형 문제</h2>
              </div>
              <div className="mb-6">
                <MarkdownRenderer content={subjectiveQ} />
              </div>
              <textarea
                value={subjectiveAnswer}
                onChange={(e) => setSubjectiveAnswer(e.target.value)}
                placeholder="개념을 자신의 말로 설명해보세요..."
                rows={8}
                className="w-full resize-none rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-primary-300 focus:bg-white"
              />
              <p className="mt-2 text-right text-xs text-gray-300">{subjectiveAnswer.length}자</p>
            </div>

            <button
              onClick={handleSubmitSubjective}
              disabled={loading || !subjectiveAnswer.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? 'AI가 채점 중...' : '답변 제출'}
            </button>
          </div>
        )}

        {/* ── Subjective Result ── */}
        {step === 'subjective-result' && subjectiveResult && (
          <div className="space-y-5">
            <div className={`rounded-3xl p-6 shadow-sm ${getScoreBg(subjectiveResult.score)}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">서술형 채점 결과</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${getScoreColor(subjectiveResult.score)} ${getScoreBg(subjectiveResult.score)}`}>
                  {subjectiveResult.score}점
                </span>
              </div>
              <div className="mb-4">
                <MarkdownRenderer content={subjectiveResult.feedback} />
              </div>

              {subjectiveResult.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-xs font-bold text-emerald-600">잘한 점</p>
                  <ul className="space-y-1">
                    {subjectiveResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {subjectiveResult.improvements.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-bold text-amber-600">개선할 점</p>
                  <ul className="space-y-1">
                    {subjectiveResult.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DiscussionChat sessionId={id} stepType="subjective" />

            <button
              onClick={handleGetApplication}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'AI가 문제를 생성 중...' : '다음: 응용 문제'}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* STEP 4: Application Question             */}
        {/* ════════════════════════════════════════ */}
        {step === 'application' && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">응용 문제</h2>
              </div>
              <div className="mb-6">
                <MarkdownRenderer content={applicationQ} />
              </div>
              <CodeEditor
                value={applicationAnswer}
                onChange={setApplicationAnswer}
                language="javascript"
                height="300px"
              />
              <p className="mt-2 text-right text-xs text-gray-300">{applicationAnswer.length}자</p>
            </div>

            <button
              onClick={handleSubmitApplication}
              disabled={loading || !applicationAnswer.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? 'AI가 채점 중...' : '답변 제출'}
            </button>
          </div>
        )}

        {/* ── Application Result ── */}
        {step === 'application-result' && applicationResult && (
          <div className="space-y-5">
            <div className={`rounded-3xl p-6 shadow-sm ${getScoreBg(applicationResult.score)}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">응용 채점 결과</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${getScoreColor(applicationResult.score)} ${getScoreBg(applicationResult.score)}`}>
                  {applicationResult.score}점
                </span>
              </div>
              <div className="mb-4">
                <MarkdownRenderer content={applicationResult.feedback} />
              </div>

              {applicationResult.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-xs font-bold text-emerald-600">잘한 점</p>
                  <ul className="space-y-1">
                    {applicationResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {applicationResult.improvements.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-bold text-amber-600">개선할 점</p>
                  <ul className="space-y-1">
                    {applicationResult.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DiscussionChat sessionId={id} stepType="application" />

            <button
              onClick={handleGetSummary}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-violet-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
              {loading ? '종합 평가 생성 중...' : '종합 결과 보기'}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* STEP 5: Summary                          */}
        {/* ════════════════════════════════════════ */}
        {step === 'summary' && summaryData && (
          <div className="space-y-5">
            {/* Score Overview */}
            <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-violet-500 p-6 text-white shadow-lg shadow-primary-200">
              <div className="mb-4 text-center">
                <Trophy className="mx-auto mb-2 h-8 w-8 text-amber-300" />
                <p className="text-sm text-white/70">종합 점수</p>
                <p className="text-5xl font-extrabold">{summaryData.totalScore.toFixed(1)}</p>
                <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  {summaryData.summary.masteryLevel}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: '객관식', score: summaryData.scores.objective },
                  { label: '서술형', score: summaryData.scores.subjective },
                  { label: '응용', score: summaryData.scores.application },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white/10 p-3 text-center">
                    <p className="text-[10px] text-white/60">{s.label}</p>
                    <p className="mt-0.5 text-xl font-bold">{s.score}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-800">종합 평가</h3>
              <MarkdownRenderer content={summaryData.summary.overallAssessment} />
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-emerald-50 p-5">
                <p className="mb-2 text-xs font-bold text-emerald-600">잘한 부분</p>
                <ul className="space-y-1.5">
                  {summaryData.summary.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-red-50 p-5">
                <p className="mb-2 text-xs font-bold text-red-500">부족한 부분</p>
                <ul className="space-y-1.5">
                  {summaryData.summary.weaknesses.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-800">학습 추천</h3>
              <ul className="space-y-2">
                {summaryData.summary.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> {r}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-2xl bg-primary-50 p-3 text-sm font-medium text-primary-700">
                {summaryData.summary.nextSteps}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/session"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                다른 세션 시작
              </Link>
              <Link
                href="/dashboard"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-400"
              >
                <Home className="h-4 w-4" />
                대시보드
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

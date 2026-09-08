'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Zap,
  Crown,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorMessage } from '@/components/ui';
import { SubscriptionSuccessModal } from '@/components/subscription-success-modal';
import type { UsageStatus } from '@/hooks/use-api';

interface SubscriptionSummary {
  planType: string;
  status: string | null;
  priceMonthly: number;
  renewsAt: string | null;
  endsAt: string | null;
  usageResetsAt: string;
  cardBrand: string | null;
  cardLastFour: string | null;
  portalUrl: string | null;
  updatePaymentMethodUrl: string | null;
  hasSubscription: boolean;
  usage: UsageStatus;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function formatPrice(n: number) {
  return n === 0 ? '₩0' : `₩${n.toLocaleString('ko-KR')}`;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function daysLeft(iso: string | null) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function statusLabel(status: string | null) {
  switch (status) {
    case 'active':
      return '활성';
    case 'on_trial':
      return '체험 중';
    case 'cancelled':
    case 'canceled':
      return '해지 예정';
    case 'past_due':
      return '결제 지연';
    case 'expired':
      return '만료됨';
    case 'paused':
      return '일시정지';
    case 'paid':
      return '결제 완료';
    default:
      return status ?? '확인 중';
  }
}

function UsageBar({
  label,
  used,
  limit,
  percent,
  formatValue,
  hint,
}: {
  label: string;
  used: number;
  limit: number;
  percent: number;
  formatValue?: (n: number) => string;
  hint?: string;
}) {
  const fmt = formatValue ?? ((n: number) => String(n));
  const clamped = Math.min(percent, 100);
  const barColor =
    percent >= 90 ? 'bg-red-400' : percent >= 70 ? 'bg-amber-400' : 'bg-primary-400';

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <span className="text-sm text-gray-400">{Math.min(percent, 999)}% 사용</span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {fmt(used)} / {fmt(limit)}
        {hint ? ` · ${hint}` : ''}
      </p>
    </div>
  );
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [successOpen, setSuccessOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const handledCheckout = useRef(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => {
      const { data: summary } = await api.get<SubscriptionSummary>('/billing/subscription');
      return summary;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout !== 'success' || handledCheckout.current) return;
    handledCheckout.current = true;

    (async () => {
      await refreshUser();
      await refetch();
      setSuccessOpen(true);
      router.replace('/billing', { scroll: false });
    })();
  }, [searchParams, refreshUser, refetch, router]);

  const planType = data?.planType ?? user?.planType ?? 'FREE';
  const isPro = planType === 'PRO' || planType === 'MASTER';
  const resetDate = formatDate(data?.usageResetsAt ?? null);
  const renewDate = formatDate(data?.renewsAt ?? data?.endsAt ?? null);
  const left = daysLeft(data?.renewsAt ?? data?.endsAt ?? data?.usageResetsAt ?? null);

  const planMeta =
    planType === 'MASTER'
      ? { name: 'Master', icon: Crown, price: formatPrice(59_000) }
      : planType === 'PRO'
        ? { name: 'Pro', icon: Zap, price: formatPrice(data?.priceMonthly ?? 29_000) }
        : { name: 'Free', icon: CreditCard, price: formatPrice(0) };

  const PlanIcon = planMeta.icon;

  const openPortal = async () => {
    setPortalLoading(true);
    setError('');
    try {
      if (data?.portalUrl) {
        window.open(data.portalUrl, '_blank');
        return;
      }
      const { data: portal } = await api.get<{ portalUrl: string }>('/billing/portal');
      window.open(portal.portalUrl, '_blank');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e));
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-primary-500">Billing</p>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">구독 관리</h1>
          <p className="mt-2 text-sm text-gray-400">
            플랜과 이번 달 사용량을 확인하고, 결제 수단·해지는 Lemon Squeezy에서 관리할 수 있어요.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {isLoading || !data ? (
          <div className="flex h-48 items-center justify-center rounded-3xl bg-white shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  현재 플랜
                </p>
                <div className="mb-2 flex items-center gap-2">
                  <PlanIcon className="h-5 w-5 text-primary-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {planMeta.name}{' '}
                    <span className="text-base font-semibold text-gray-400">
                      {planMeta.price}/월
                    </span>
                  </h2>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                  {isPro
                    ? renewDate
                      ? `다음 갱신일 ${renewDate}${left != null ? ` (${left}일 남음)` : ''}`
                      : resetDate
                        ? `사용량 초기화 ${resetDate}${left != null ? ` (${left}일 남음)` : ''}`
                        : '구독이 활성화되어 있습니다'
                    : '무료 플랜을 이용 중입니다'}
                </p>
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    {statusLabel(data.status)}
                  </span>
                  {data.cardBrand && data.cardLastFour && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {data.cardBrand.toUpperCase()} ···· {data.cardLastFour}
                    </span>
                  )}
                </div>
                {isPro ? (
                  <button
                    type="button"
                    onClick={openPortal}
                    disabled={portalLoading || !data.hasSubscription}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    결제·해지 관리
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
                  >
                    <Zap className="h-4 w-4" />
                    Pro로 업그레이드
                  </Link>
                )}
              </div>

              <div
                className={`rounded-3xl p-6 shadow-sm ${
                  isPro
                    ? 'bg-gradient-to-br from-primary-50 to-white ring-1 ring-primary-100'
                    : 'bg-white'
                }`}
              >
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-primary-500">
                  {isPro ? '플랜 안내' : '업그레이드'}
                </p>
                {isPro ? (
                  <>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">Pro 혜택 이용 중</h2>
                    <p className="mb-5 text-sm leading-relaxed text-gray-500">
                      월 100 세션 · 5M 토큰 · 탐구 30회와 성장 그래프, 약점 분석을 사용할 수 있어요.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-500"
                    >
                      요금제 비교 보기
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">
                      Pro {formatPrice(29_000)}/월
                    </h2>
                    <p className="mb-5 text-sm leading-relaxed text-gray-500">
                      세션·토큰 한도를 크게 늘리고 성장 리포트를 확인하세요.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
                    >
                      업그레이드
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-gray-900">
                  {planMeta.name} 포함 사용량
                </h2>
                {resetDate && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {resetDate} 초기화
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm text-gray-400">이번 달 학습·탐구 사용량입니다.</p>
              <div className="divide-y divide-gray-100">
                <UsageBar
                  label="학습 세션"
                  used={data.usage.month.sessions}
                  limit={data.usage.limits.monthlySessions}
                  percent={data.usage.percent.sessions}
                />
                <UsageBar
                  label="토큰"
                  used={data.usage.month.tokens}
                  limit={data.usage.limits.monthlyTokens}
                  percent={data.usage.percent.tokens}
                  formatValue={formatTokens}
                />
                <UsageBar
                  label="탐구 대화"
                  used={data.usage.month.explorations}
                  limit={data.usage.limits.monthlyExplorations}
                  percent={data.usage.percent.explorations}
                  hint={`대화당 ${data.usage.limits.explorationTurns}턴`}
                />
              </div>
            </div>

            {isPro && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-1 text-base font-bold text-gray-900">결제 · 영수증</h2>
                <p className="mb-5 text-sm text-gray-400">
                  카드 변경, 구독 해지, 영수증 확인은 Lemon Squeezy 고객 포털에서 안전하게 처리됩니다.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={openPortal}
                    disabled={portalLoading || !data.hasSubscription}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    고객 포털 열기
                  </button>
                  {data.updatePaymentMethodUrl && (
                    <a
                      href={data.updatePaymentMethodUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      결제 수단 변경
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <SubscriptionSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}

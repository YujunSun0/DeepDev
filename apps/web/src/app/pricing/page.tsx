'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Crown, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorMessage } from '@/components/ui';
import { getPaddle, type PaddleClientConfig } from '@/lib/paddle';

interface BillingStatus {
  checkoutEnabled: boolean;
  paddle: PaddleClientConfig | null;
}

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutEnabled, setCheckoutEnabled] = useState<boolean | null>(null);
  const [paddleConfig, setPaddleConfig] = useState<PaddleClientConfig | null>(null);

  const isPro = user?.planType === 'PRO' || user?.planType === 'MASTER';

  const envCheckoutEnabled =
    process.env.NEXT_PUBLIC_BILLING_CHECKOUT_ENABLED !== 'false';

  useEffect(() => {
    if (!envCheckoutEnabled) {
      setCheckoutEnabled(false);
      return;
    }
    api
      .get<BillingStatus>('/billing/status')
      .then(({ data }) => {
        setCheckoutEnabled(data.checkoutEnabled);
        setPaddleConfig(data.paddle);
      })
      .catch(() => setCheckoutEnabled(false));
  }, [envCheckoutEnabled]);

  // 이 페이지는 Paddle 기본 결제 링크라서 미리 초기화해 둔다 (?_ptxn= 링크로 오면 결제창 자동 오픈)
  useEffect(() => {
    if (!paddleConfig) return;
    getPaddle(paddleConfig).catch(() => undefined);
  }, [paddleConfig]);

  const handleUpgrade = async () => {
    if (!paddleConfig) return;
    setLoading(true);
    setError('');
    try {
      const [paddle, { data }] = await Promise.all([
        getPaddle(paddleConfig),
        api.post<{ transactionId: string; customerEmail: string | null }>('/billing/checkout'),
      ]);
      if (!paddle) throw new Error('결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');

      paddle.Checkout.open({
        transactionId: data.transactionId,
        ...(data.customerEmail ? { customer: { email: data.customerEmail } } : {}),
        settings: {
          displayMode: 'overlay',
          locale: 'ko',
          // 결제가 끝나면 구독 관리 화면에서 webhook 반영을 기다린 뒤 성공 모달을 띄움
          successUrl: `${window.location.origin}/billing?checkout=success`,
        },
      });
    } catch (e: unknown) {
      setError(e instanceof Error && !('response' in e) ? e.message : getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '0',
      currency: '₩',
      period: '',
      description: '개발 학습의 첫 걸음을 무료로 시작하세요',
      features: [
        { text: '월 10 세션', included: true },
        { text: '월 100K 토큰', included: true },
        { text: '탐구 대화 월 3개 (10턴/대화)', included: true },
        { text: 'Level 1~2 학습', included: true },
        { text: '기본 숙련도 분석', included: true },
        { text: '약점 자동 분석', included: false },
        { text: '성장 리포트', included: false },
      ],
      cta: user?.planType === 'FREE' ? '현재 플랜' : '무료로 시작',
      highlight: false,
      isCurrent: user?.planType === 'FREE',
    },
    {
      name: 'Pro',
      price: '29,000',
      currency: '₩',
      period: '/월',
      description: '심화 학습과 성장 분석을 원한다면',
      features: [
        { text: '월 100 세션', included: true },
        { text: '월 5M 토큰', included: true },
        { text: '탐구 대화 월 30개 (20턴/대화)', included: true },
        { text: 'Level 1~4 학습', included: true },
        { text: '약점 자동 분석', included: true },
        { text: '성장 그래프', included: true },
        { text: '우선 응답', included: true },
      ],
      cta: isPro ? '구독 중' : 'Pro 시작하기',
      highlight: true,
      isCurrent: isPro,
      icon: <Zap className="h-4 w-4" />,
    },
    {
      name: 'Master',
      price: '59,000',
      currency: '₩',
      period: '/월',
      description: '최고 수준의 AI 학습 경험',
      features: [
        { text: '월 300 세션', included: true },
        { text: '월 15M 토큰', included: true },
        { text: '탐구 대화 월 100개 (30턴/대화)', included: true },
        { text: 'Level 1~5 전체 해금', included: true },
        { text: 'GPT-4o 고급 분석 모델', included: true },
        { text: 'AI 맞춤 커리큘럼', included: true },
        { text: '주간 학습 리포트', included: true },
      ],
      cta: 'Coming Soon',
      highlight: false,
      comingSoon: true,
      icon: <Crown className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold text-primary-500">Pricing</p>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            나에게 맞는 플랜을 선택하세요
          </h1>
          <p className="text-gray-400">
            무료 플랜으로 시작하고, 필요할 때 업그레이드하세요
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-8 max-w-md">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl bg-white p-8 transition ${
                plan.highlight
                  ? 'shadow-lg shadow-primary-100 ring-2 ring-primary-200'
                  : plan.comingSoon
                    ? 'opacity-80 shadow-sm'
                    : 'shadow-sm hover:shadow-md'
              }`}
            >
              {plan.highlight && !plan.isCurrent && (
                <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                  <Zap className="h-3 w-3" />
                  추천
                </span>
              )}
              {plan.isCurrent && (
                <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  현재 플랜
                </span>
              )}
              {(plan.comingSoon || (plan.name === 'Pro' && checkoutEnabled === false)) && (
                <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  <Lock className="h-3 w-3" />
                  준비 중
                </span>
              )}
              <h2 className="mb-1 text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="mb-5 text-sm text-gray-400">{plan.description}</p>
              <p className="mb-6">
                <span className="text-sm text-gray-500">{plan.currency}</span>
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-gray-400">{plan.period}</span>
                )}
              </p>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex items-start gap-2.5 text-sm ${
                      feature.included ? 'text-gray-600' : 'text-gray-300'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                        feature.included
                          ? 'bg-primary-50 text-primary-500'
                          : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      {feature.included ? '✓' : '—'}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>

              {plan.comingSoon ? (
                <button
                  disabled
                  className="block w-full cursor-not-allowed rounded-2xl bg-gray-100 py-3.5 text-center text-sm font-semibold text-gray-400"
                >
                  Coming Soon
                </button>
              ) : plan.isCurrent ? (
                plan.name === 'Pro' ? (
                  <div className="rounded-2xl bg-emerald-50 py-3.5 text-center text-sm font-semibold text-emerald-600">
                    구독 중
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 py-3.5 text-center text-sm font-semibold text-gray-400">
                    현재 플랜
                  </div>
                )
              ) : plan.name === 'Pro' && checkoutEnabled === false ? (
                <button
                  disabled
                  className="block w-full cursor-not-allowed rounded-2xl bg-gray-100 py-3.5 text-center text-sm font-semibold text-gray-400"
                >
                  준비 중
                </button>
              ) : plan.name === 'Pro' ? (
                <button
                  onClick={handleUpgrade}
                  disabled={loading || checkoutEnabled === null || !paddleConfig}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="block w-full rounded-2xl bg-gray-50 py-3.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-1.5 text-center text-xs leading-5 text-gray-400">
          <p>
            유료 플랜은 1개월 단위 정기결제이며 해지 전까지 매월 자동 갱신됩니다. 언제든 해지할 수
            있고, 해지 후에도 결제한 기간이 끝날 때까지 이용할 수 있습니다.
          </p>
          <p>
            첫 결제 후 7일 이내에는 전액 환불됩니다. 결제는 판매자(Merchant of Record)인
            Paddle.com을 통해 처리됩니다.
          </p>
          <p className="space-x-3">
            <Link href="/terms" className="underline-offset-2 hover:text-gray-600 hover:underline">
              이용약관
            </Link>
            <Link href="/privacy" className="underline-offset-2 hover:text-gray-600 hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/refund" className="underline-offset-2 hover:text-gray-600 hover:underline">
              환불정책
            </Link>
          </p>
        </div>

        {isPro && (
          <div className="mt-8 text-center">
            <Link
              href="/billing"
              className="text-sm font-medium text-gray-400 transition hover:text-primary-500"
            >
              구독 관리 · 사용량 · 결제 수단
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

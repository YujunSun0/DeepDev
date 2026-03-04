'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Crown, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorMessage } from '@/components/ui';

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPro = user?.planType === 'PRO' || user?.planType === 'MASTER';

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<{ checkoutUrl: string }>('/billing/checkout');
      window.open(data.checkoutUrl, '_blank');
      const onFocus = () => {
        refreshUser();
        window.removeEventListener('focus', onFocus);
      };
      window.addEventListener('focus', onFocus);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ portalUrl: string }>('/billing/portal');
      window.open(data.portalUrl, '_blank');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e));
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
      cta: isPro ? '현재 플랜' : 'Pro 시작하기',
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
              {plan.comingSoon && (
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
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-50 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    구독 관리
                  </button>
                ) : (
                  <div className="rounded-2xl bg-gray-50 py-3.5 text-center text-sm font-semibold text-gray-400">
                    현재 플랜
                  </div>
                )
              ) : plan.name === 'Pro' ? (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
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

        {isPro && (
          <div className="mt-8 text-center">
            <button
              onClick={handleManageSubscription}
              className="text-sm font-medium text-gray-400 transition hover:text-primary-500"
            >
              구독 취소 · 결제 수단 변경 · 영수증 확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

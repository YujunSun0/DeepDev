import Link from 'next/link';
import { Zap, Crown, Lock } from 'lucide-react';

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
    cta: '무료로 시작',
    highlight: false,
    icon: null,
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
    cta: 'Pro 시작하기',
    highlight: true,
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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold text-primary-500">Pricing</p>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            나에게 맞는 플랜을 선택하세요
          </h1>
          <p className="text-gray-400">
            무료 플랜으로 시작하고, 필요할 때 업그레이드하세요
          </p>
        </div>

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
              {plan.highlight && (
                <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                  <Zap className="h-3 w-3" />
                  추천
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
              ) : (
                <Link
                  href="/login"
                  className={`block w-full rounded-2xl py-3.5 text-center text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-primary-500 text-white hover:bg-primary-400'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

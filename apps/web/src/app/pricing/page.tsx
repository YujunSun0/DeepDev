import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '0',
    currency: '₩',
    period: '',
    description: 'JavaScript 기초를 무료로 시작하세요',
    features: [
      'Level 2까지 학습',
      '하루 1세션',
      'Core Curriculum 숙련도 반영',
      'Exploration Mode (Level 2)',
    ],
    cta: '무료로 시작',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '29,000',
    currency: '₩',
    period: '/월',
    description: '심화 학습과 성장 분석을 원한다면',
    features: [
      'Level 4까지 학습',
      '하루 5세션',
      '성장 그래프',
      '약점 자동 분석',
      'Exploration Mode 전체',
    ],
    cta: 'Pro 시작하기',
    highlight: true,
  },
  {
    name: 'Master',
    price: '59,000',
    currency: '₩',
    period: '/월',
    description: '면접 준비와 완벽한 JS 마스터리',
    features: [
      'Level 5 전체 해금',
      '면접 모드',
      '코드 분석 문제',
      '무제한 세션',
      '전체 기능 이용',
    ],
    cta: 'Master 시작하기',
    highlight: false,
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
              className={`rounded-3xl bg-white p-8 transition ${
                plan.highlight
                  ? 'shadow-lg shadow-primary-100 ring-2 ring-primary-200'
                  : 'shadow-sm hover:shadow-md'
              }`}
            >
              {plan.highlight && (
                <span className="mb-4 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                  인기
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
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-500">
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { SiJavascript, SiReact } from 'react-icons/si';
import { HiOutlineAcademicCap, HiOutlineServerStack } from 'react-icons/hi2';
import { LandingNav } from '@/components/landing-nav';
import { LandingCta } from '@/components/landing-cta';

const domains = [
  { name: 'JavaScript', tag: '출시', available: true, icon: <SiJavascript className="h-8 w-8" />, iconColor: 'text-yellow-400' },
  { name: 'CS 기초', tag: '준비 중', available: false, icon: <HiOutlineAcademicCap className="h-8 w-8" />, iconColor: 'text-blue-400' },
  { name: 'Backend', tag: '준비 중', available: false, icon: <HiOutlineServerStack className="h-8 w-8" />, iconColor: 'text-green-400' },
  { name: 'React 내부 동작', tag: '준비 중', available: false, icon: <SiReact className="h-8 w-8" />, iconColor: 'text-cyan-400' },
];

const concepts = [
  { name: '실행 컨텍스트', domain: 'JavaScript' },
  { name: '클로저', domain: 'JavaScript' },
  { name: 'Event Loop', domain: 'JavaScript' },
  { name: 'Promise', domain: 'JavaScript' },
  { name: 'this 바인딩', domain: 'JavaScript' },
  { name: '프로토타입', domain: 'JavaScript' },
];

const steps = [
  {
    num: '01',
    title: '도메인 선택',
    desc: '학습하고 싶은 기술 도메인과 개념을 선택하세요',
  },
  {
    num: '02',
    title: 'AI 학습 세션',
    desc: 'AI가 설명하고, 문제를 출제하고, 답변을 평가합니다',
  },
  {
    num: '03',
    title: '숙련도 측정',
    desc: '정량화된 점수로 내 실력을 정확히 파악합니다',
  },
  {
    num: '04',
    title: '약점 보완',
    desc: '부족한 개념을 자동으로 추천받아 반복 학습합니다',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-gray-900 to-gray-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

        <LandingNav />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-300">
            AI 기반 개발자 숙련도 측정 플랫폼
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            내 개발 실력을<br />
            <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
              정확히 알고 있나요?
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-400">
            개념 그래프 기반으로 당신의 기술 숙련도를 정량화합니다.
            <br />
            단순 Q&A가 아닌, 체계적인 실력 측정 시스템.
          </p>
          <div className="flex items-center justify-center gap-4">
            <LandingCta variant="hero" />
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold text-primary-500">Domains</p>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              다양한 기술 도메인을 학습하세요
            </h2>
            <p className="mx-auto max-w-lg text-gray-500">
              JavaScript부터 시작해서 CS 기초, Backend, 프레임워크 내부 동작까지.
              지속적으로 도메인이 확장됩니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {domains.map((d) => (
              <div
                key={d.name}
                className={`rounded-3xl p-6 text-center transition ${
                  d.available
                    ? 'bg-white shadow-sm hover:shadow-md'
                    : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className={`mb-4 flex justify-center ${d.available ? d.iconColor : 'text-gray-300'}`}>
                  {d.icon}
                </div>
                <p className={`mb-2 text-lg font-bold ${d.available ? 'text-gray-900' : 'text-gray-400'}`}>
                  {d.name}
                </p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    d.available
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {d.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold text-primary-500">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900">
              4단계로 완성하는 기술 숙련도
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="rounded-3xl bg-white p-7 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-lg font-bold text-primary-500">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concept Preview */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold text-primary-500">Concept Graph</p>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              기초부터 심화까지, 빠짐없이
            </h2>
            <p className="mx-auto max-w-lg text-gray-500">
              각 도메인을 Level 1~5로 구조화하여 체계적으로 학습합니다.
              아래는 JavaScript 도메인의 일부 개념입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {concepts.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="font-medium text-gray-800">{c.name}</span>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                  {c.domain}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mastery System */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-primary-500">Mastery Score</p>
              <h2 className="mb-5 text-3xl font-bold text-gray-900">
                숙련도를 숫자로 보여드립니다
              </h2>
              <p className="mb-8 leading-relaxed text-gray-500">
                각 개념별 객관식, 서술, 응용 문제를 종합 평가하여
                정량적인 숙련도 점수를 산출합니다.
                시간이 지나면 자연스럽게 감쇄되어 지속적인 학습을 유도합니다.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Mastered', score: '80% 이상', color: 'bg-emerald-100 text-emerald-700' },
                  { label: 'Intermediate', score: '50~79%', color: 'bg-amber-100 text-amber-700' },
                  { label: 'Weak', score: '50% 미만', color: 'bg-red-100 text-red-700' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.color}`}>{m.label}</span>
                    <span className="text-sm text-gray-500">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-400">Global Skill Index</p>
                <p className="mt-1 text-6xl font-extrabold text-primary-500">72.4</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: '클로저', score: 85, color: 'bg-emerald-400' },
                  { name: 'Event Loop', score: 62, color: 'bg-amber-400' },
                  { name: 'this 바인딩', score: 45, color: 'bg-red-400' },
                  { name: '프로토타입', score: 78, color: 'bg-amber-400' },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-900">{item.score}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100">
                      <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-5 text-3xl font-bold text-gray-900">
            지금 바로 실력을 측정해보세요
          </h2>
          <p className="mb-10 text-gray-500">
            무료 플랜으로 시작할 수 있습니다.
            회원가입 후 바로 첫 세션을 시작하세요.
          </p>
          <LandingCta variant="cta" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="text-sm font-bold text-gray-800">
            <span className="text-primary-500">Deep</span>Dev
          </span>
          <p className="mt-2 text-xs text-gray-400">
            &copy; 2026 DeepDev. Developer Mastery Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}

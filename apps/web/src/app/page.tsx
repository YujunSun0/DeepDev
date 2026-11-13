import Link from 'next/link';
import Image from 'next/image';
import { SiJavascript, SiReact } from 'react-icons/si';
import { HiOutlineAcademicCap, HiOutlineServerStack, HiOutlineCircleStack } from 'react-icons/hi2';
import { LandingNav } from '@/components/landing-nav';
import { LandingCta } from '@/components/landing-cta';
import { SiteFooter } from '@/components/legal/site-footer';

const domains = [
  { name: 'JavaScript', tag: '출시', available: true, icon: <SiJavascript className="h-6 w-6 sm:h-8 sm:w-8" />, iconColor: 'text-yellow-400' },
  { name: '자료구조 & 알고리즘', tag: '출시', available: true, icon: <HiOutlineAcademicCap className="h-6 w-6 sm:h-8 sm:w-8" />, iconColor: 'text-blue-400' },
  { name: 'OS & 네트워크', tag: '출시', available: true, icon: <HiOutlineServerStack className="h-6 w-6 sm:h-8 sm:w-8" />, iconColor: 'text-green-400' },
  { name: 'React', tag: '출시', available: true, icon: <SiReact className="h-6 w-6 sm:h-8 sm:w-8" />, iconColor: 'text-cyan-400' },
];

const concepts = [
  { name: '클로저', domain: 'JavaScript' },
  { name: '해시 테이블 기초', domain: '자료구조 & 알고리즘' },
  { name: 'Event Loop', domain: 'JavaScript' },
  { name: '프로세스 vs 스레드', domain: 'OS & 네트워크' },
  { name: '트리 기초', domain: '자료구조 & 알고리즘' },
  { name: 'React 컴포넌트', domain: 'React' },
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
    title: '맞춤 복습',
    desc: '학습 진행에 따라 추천되는 개념을 집중적으로 복습합니다',
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

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 md:pb-24 md:pt-20">
          <div className="mb-4 inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs text-primary-300 sm:mb-6 sm:px-4 sm:py-1.5 sm:text-sm">
            AI 기반 개발자 숙련도 측정 플랫폼
          </div>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            내 개발 실력을<br />
            <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
              정확히 알고 있나요?
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-gray-400 sm:mb-10 sm:text-lg">
            개념 그래프 기반으로 당신의 기술 숙련도를 정량화합니다.
            <br />
            단순 Q&A가 아닌, 체계적인 실력 측정 시스템.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <LandingCta variant="hero" />
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center md:mb-16">
            <p className="mb-2 text-xs font-semibold text-primary-500 sm:mb-3 sm:text-sm">Domains</p>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 md:text-3xl">
              다양한 기술 도메인을 학습하세요
            </h2>
            <p className="mx-auto max-w-lg text-sm text-gray-500 sm:text-base">
              JavaScript, 자료구조 & 알고리즘, OS & 네트워크, React까지.
              다양한 기술 도메인을 체계적으로 학습하세요.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {domains.map((d) => (
              <div
                key={d.name}
                className={`rounded-2xl p-4 text-center transition sm:rounded-3xl sm:p-6 ${
                  d.available
                    ? 'bg-white shadow-sm hover:shadow-md'
                    : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className={`mb-3 flex justify-center sm:mb-4 ${d.available ? d.iconColor : 'text-gray-300'}`}>
                  {d.icon}
                </div>
                <p className={`mb-1.5 text-sm font-bold sm:mb-2 sm:text-base md:text-lg ${d.available ? 'text-gray-900' : 'text-gray-400'}`}>
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
      <section className="bg-gray-50 py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center md:mb-16">
            <p className="mb-2 text-xs font-semibold text-primary-500 sm:mb-3 sm:text-sm">How it works</p>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              4단계로 완성하는 기술 숙련도
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:rounded-3xl sm:p-7">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-500 sm:mb-4 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-lg">
                  {step.num}
                </div>
                <h3 className="mb-1.5 text-base font-bold text-gray-900 sm:mb-2 sm:text-lg">{step.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 탐구모드 & 업적 */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {/* 탐구모드: 2/3 너비, 이미지 강조 */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
              <div className="relative h-[200px] bg-gray-50 sm:h-[260px] md:h-[320px]">
                <Image
                  src="/tamgu.png"
                  alt="탐구모드"
                  fill
                  className="object-contain object-top"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                {/* 창 프레임 느낌 */}
                <div className="absolute left-4 top-3 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
              </div>
              <div className="border-t border-gray-50 px-4 py-3 sm:px-5 sm:py-4">
                <h3 className="mb-1 text-base font-bold text-gray-900 sm:text-lg">탐구모드</h3>
                <p className="mb-2 text-xs text-gray-500 sm:mb-3 sm:text-sm">
                  궁금한 개념을 선택하고 AI와 대화하며 깊이 있게 학습하세요.
                </p>
                <Link href="/explore" className="text-xs font-semibold text-primary-500 hover:text-primary-600 sm:text-sm">
                  탐구하기 →
                </Link>
              </div>
            </div>
            {/* 업적: 1/3 너비 */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="relative h-[150px] bg-gray-900 sm:h-[180px] md:h-[220px]">
                <Image
                  src="/achievements.png"
                  alt="업적"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="border-t border-gray-50 px-4 py-3 sm:px-5 sm:py-4">
                <h3 className="mb-1 text-base font-bold text-gray-900 sm:text-lg">업적 시스템</h3>
                <p className="mb-2 text-xs text-gray-500 sm:mb-3 sm:text-sm">
                  연속 학습왕, 세션 마스터, 만점왕 등 다양한 업적을 달성하세요.
                </p>
                <Link href="/achievements" className="text-xs font-semibold text-primary-500 hover:text-primary-600 sm:text-sm">
                  업적 보기 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept Preview */}
      <section className="py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center md:mb-16">
            <p className="mb-2 text-xs font-semibold text-primary-500 sm:mb-3 sm:text-sm">Concept Graph</p>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 md:text-3xl">
              기초부터 심화까지, 빠짐없이
            </h2>
            <p className="mx-auto max-w-lg text-sm text-gray-500 sm:text-base">
              각 도메인을 Level 1~5로 구조화하여 체계적으로 학습합니다.
              아래는 여러 도메인에서 골고루 뽑은 일부 개념입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {concepts.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                <span className="truncate text-sm font-medium text-gray-800 sm:text-base">{c.name}</span>
                <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600 sm:px-3 sm:py-1 sm:text-xs">
                  {c.domain}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mastery System */}
      <section className="bg-gray-50 py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="mb-2 text-xs font-semibold text-primary-500 sm:mb-3 sm:text-sm">Mastery Score</p>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-5 md:text-3xl">
                숙련도를 숫자로 보여드립니다
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-500 sm:mb-8 sm:text-base">
                각 개념별 객관식, 서술, 응용 문제를 종합 평가하여
                정량적인 숙련도 점수를 산출합니다.
                시간이 지나면 자연스럽게 감쇄되어 지속적인 학습을 유도합니다.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { label: 'Mastered', score: '80% 이상', color: 'bg-emerald-100 text-emerald-700' },
                  { label: 'Intermediate', score: '50~79%', color: 'bg-amber-100 text-amber-700' },
                  { label: 'Weak', score: '50% 미만', color: 'bg-red-100 text-red-700' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2 sm:gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${m.color}`}>{m.label}</span>
                    <span className="text-xs text-gray-500 sm:text-sm">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
              <div className="mb-4 text-center sm:mb-6">
                <p className="text-xs text-gray-400 sm:text-sm">Global Skill Index</p>
                <p className="mt-1 text-4xl font-extrabold text-primary-500 sm:text-5xl md:text-6xl">72.4</p>
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                {[
                  { name: '클로저 (JS)', score: 85, color: 'bg-emerald-400' },
                  { name: '해시 테이블 (DSA)', score: 62, color: 'bg-amber-400' },
                  { name: 'HTTP/HTTPS (OS)', score: 45, color: 'bg-red-400' },
                  { name: 'React 컴포넌트', score: 78, color: 'bg-amber-400' },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-xs sm:mb-1.5 sm:text-sm">
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
      <section className="py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-5 md:text-3xl">
            지금 바로 실력을 측정해보세요
          </h2>
          <p className="mb-8 text-sm text-gray-500 sm:mb-10 sm:text-base">
            무료 플랜으로 시작할 수 있습니다.
            회원가입 후 바로 첫 세션을 시작하세요.
          </p>
          <LandingCta variant="cta" />
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

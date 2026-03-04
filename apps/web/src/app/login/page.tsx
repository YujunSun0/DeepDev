// apps/web/src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorMessage } from '@/components/ui';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="relative hidden w-4/5 overflow-hidden bg-gray-900 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/50 via-gray-900 to-gray-900" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 px-16 text-center">
          <h1 className="mb-6 text-5xl font-extrabold text-white">
            <span className="text-primary-400">Deep</span>Dev
          </h1>
          <p className="mb-3 text-lg text-gray-300">
            개발자 숙련도 측정 AI 학습 엔진
          </p>
          <p className="text-sm leading-relaxed text-gray-500">
            개념 그래프 기반으로 당신의 기술 실력을<br />
            정량화하고 체계적으로 성장시킵니다
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-10 text-center lg:hidden">
            <h1 className="text-3xl font-extrabold">
              <span className="text-primary-500">Deep</span>Dev
            </h1>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            {isLogin ? '다시 오셨군요!' : '함께 시작해요'}
          </h2>
          <p className="mb-8 text-sm text-gray-400">
            {isLogin
              ? '이메일과 비밀번호로 로그인하세요'
              : '이메일로 간편하게 가입하세요'}
          </p>

          {error && (
            <ErrorMessage message={error} onDismiss={() => setError('')} className="mb-5" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="이름을 입력하세요"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="8자 이상 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : isLogin ? '로그인' : '가입하기'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-gray-400 transition hover:text-primary-500"
            >
              {isLogin ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
              <span className="font-semibold text-primary-500">
                {isLogin ? '회원가입' : '로그인'}
              </span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-gray-300 transition hover:text-gray-500">
              &larr; 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

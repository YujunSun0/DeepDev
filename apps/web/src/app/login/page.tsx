// apps/web/src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { resendVerificationEmail, loginWithOAuthToken, getOAuthAuthUrl } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorMessage } from '@/components/ui';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered) {
      setSuccess(decodeURIComponent(registered));
      setIsLogin(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = searchParams.get('token');
    const oauth = searchParams.get('oauth');
    const err = searchParams.get('error');
    if (err === 'oauth_failed') {
      setError('소셜 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else if (err === 'github_email_required') {
      setError('GitHub에서 이메일 정보를 가져올 수 없습니다. GitHub 설정에서 이메일 공개를 허용해주세요.');
    } else if (token && oauth === '1') {
      loginWithOAuthToken(token)
        .then((user) => {
          if (user) router.replace('/dashboard');
          else setError('로그인 처리 중 오류가 발생했습니다.');
        })
        .catch(() => setError('로그인 처리 중 오류가 발생했습니다.'));
    }
  }, [searchParams, router]);

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
            <div className="mb-5">
              <ErrorMessage message={error} onDismiss={() => setError('')} />
              {error.includes('이메일 인증') && (
                <button
                  type="button"
                  onClick={async () => {
                    setResending(true);
                    try {
                      const res = await resendVerificationEmail(email);
                      setError('');
                      setSuccess(res.message);
                    } catch (e) {
                      setError(getApiErrorMessage(e));
                    } finally {
                      setResending(false);
                    }
                  }}
                  disabled={resending || !email}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  {resending ? '전송 중...' : '인증 메일 다시 보내기'}
                </button>
              )}
            </div>
          )}
          {success && (
            <div className="mb-5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
              <p>{success}</p>
              {(success.includes('이메일') || success.includes('인증')) && (
                <p className="mt-2 text-xs text-green-600/90">
                  메일이 보이지 않는다면 스팸 메일함을 확인해주세요.
                </p>
              )}
            </div>
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">또는</span>
            </div>
          </div>
          <div className="space-y-3">
            <a
              href={getOAuthAuthUrl('google')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google로 계속하기
            </a>
            <a
              href={getOAuthAuthUrl('github')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub로 계속하기
            </a>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
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

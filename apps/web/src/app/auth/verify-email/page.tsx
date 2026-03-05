'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { verifyEmailAndLogin } from '@/lib/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('유효하지 않은 링크입니다.');
      return;
    }

    verifyEmailAndLogin(token)
      .then(async (res) => {
        if (res.success && res.accessToken && res.user) {
          await refreshUser();
          router.push('/dashboard');
          return;
        }
        setStatus('success');
        setMessage(res.message ?? '이메일이 인증되었습니다.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message ?? '만료되었거나 유효하지 않은 링크입니다.');
      });
  }, [token, router, refreshUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-500" />
            <p className="text-gray-600">인증 처리 중...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h1 className="mb-2 text-xl font-bold text-gray-900">인증 완료</h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <Link
              href="/login"
              className="inline-block rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              로그인하기
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="mb-2 text-xl font-bold text-gray-900">인증 실패</h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <Link
              href="/login"
              className="inline-block rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              로그인으로 돌아가기
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

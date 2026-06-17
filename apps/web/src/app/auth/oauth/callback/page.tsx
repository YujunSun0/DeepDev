'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState('');
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const token = searchParams.get('token');
    if (!token) {
      setError('로그인 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    handledRef.current = true;
    completeOAuthLogin(token).catch(() => {
      setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    });
  }, [searchParams, completeOAuthLogin]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-sm text-red-600">{error}</p>
        <Link
          href="/login"
          className="rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
        >
          로그인 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary-500" />
      <p className="text-sm text-gray-500">로그인 처리 중...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}

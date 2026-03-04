'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { user } = useAuth();

  useEffect(() => {
    logger.error('Unhandled error', error);
  }, [error]);

  const homeHref = user ? '/dashboard' : '/';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <p className="mb-2 text-4xl font-extrabold text-red-200">오류</p>
      <h1 className="mb-2 text-xl font-bold text-gray-800">문제가 발생했습니다</h1>
      <p className="mb-8 max-w-md text-center text-sm text-gray-500">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
        >
          다시 시도
        </button>
        <Link
          href={homeHref}
          className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

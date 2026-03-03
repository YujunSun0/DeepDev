'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function NotFound() {
  const { user } = useAuth();
  const homeHref = user ? '/dashboard' : '/';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <p className="mb-2 text-6xl font-extrabold text-gray-200">404</p>
      <h1 className="mb-2 text-xl font-bold text-gray-800">페이지를 찾을 수 없습니다</h1>
      <p className="mb-8 text-sm text-gray-500">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Link
        href={homeHref}
        className="rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}

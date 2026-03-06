'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function LandingNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
      <Link href="/" className="text-lg font-bold text-white sm:text-xl">
        <span className="text-primary-400">Deep</span>Dev
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-xs font-medium text-gray-300 transition hover:text-white sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
            >
              대시보드
            </Link>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/20 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-xs font-medium text-gray-300 transition hover:text-white sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-xs font-medium text-gray-300 transition hover:text-white sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
            >
              로그인
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-400 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
            >
              시작하기
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function LandingNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-xl font-bold text-white">
        <span className="text-primary-400">Deep</span>Dev
      </Link>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:text-white"
            >
              대시보드
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-white">
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:text-white"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:text-white"
            >
              로그인
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              시작하기
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/session', label: '학습 세션' },
  { href: '/explore', label: '탐구 모드' },
  { href: '/pricing', label: '요금제' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const planStyle: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    PRO: 'bg-primary-50 text-primary-600',
    MASTER: 'bg-amber-50 text-amber-600',
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="text-lg font-extrabold">
            <span className="text-primary-500">Deep</span>
            <span className="text-gray-900">Dev</span>
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  pathname.startsWith(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${planStyle[user.planType] ?? planStyle.FREE}`}
          >
            {user.planType}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="rounded-xl px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-50 hover:text-red-500"
          >
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
}

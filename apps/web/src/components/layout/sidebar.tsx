'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUsage } from '@/hooks/use-api';
import {
  LayoutDashboard, GraduationCap, ClipboardList, BarChart3,
  MessageCircle, CreditCard, LogOut, ChevronLeft,
  Menu, Zap, X, Sparkles, Settings,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';

const NAV_SECTIONS = [
  {
    title: '학습',
    items: [
      { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
      { href: '/session', label: '학습하기', icon: GraduationCap },
      { href: '/history', label: '학습 기록', icon: ClipboardList },
      { href: '/stats', label: '통계', icon: BarChart3 },
    ],
  },
  {
    title: '탐구',
    items: [
      { href: '/explore', label: '탐구하기', icon: MessageCircle },
    ],
  },
  {
    title: '계정',
    items: [
      { href: '/settings', label: '설정', icon: Settings },
      { href: '/pricing', label: '요금제', icon: CreditCard },
    ],
  },
];

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { data: usage } = useUsage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!user) return null;

  const planStyle: Record<string, { bg: string; text: string; label: string }> = {
    FREE: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Free' },
    PRO: { bg: 'bg-primary-50', text: 'text-primary-600', label: 'Pro' },
    MASTER: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Master' },
  };
  const plan = planStyle[user.planType] ?? planStyle.FREE;

  const usagePercent = usage
    ? Math.round(
        (usage.percent.sessions + usage.percent.tokens + usage.percent.explorations) / 3
      )
    : 0;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-extrabold">
              <span className="text-primary-500">Deep</span>
              <span className="text-gray-900">Dev</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 lg:block"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usage Bar */}
      {!collapsed && usage && (
        <div className="mx-3 mb-4 rounded-2xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              이번 달 사용량
            </span>
            <span className="text-[10px] font-semibold text-gray-500">
              {usagePercent}%
            </span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 90 ? 'bg-red-400' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-primary-400'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="space-y-1 text-[10px] text-gray-400">
            <div className="flex justify-between">
              <span>세션</span>
              <span>{usage.month.sessions}/{usage.limits.monthlySessions}</span>
            </div>
            <div className="flex justify-between">
              <span>토큰</span>
              <span>{formatTokens(usage.month.tokens)}/{formatTokens(usage.limits.monthlyTokens)}</span>
            </div>
            <div className="flex justify-between">
              <span>탐구</span>
              <span>{usage.month.explorations}/{usage.limits.monthlyExplorations}</span>
            </div>
          </div>
          {user.planType === 'FREE' ? (
            <Link
              href="/pricing"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-500 py-2 text-[11px] font-bold text-white transition hover:bg-primary-400"
            >
              <Zap className="h-3 w-3" />
              PRO 업그레이드
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-200"
            >
              구독 관리
            </Link>
          )}
        </div>
      )}

      {/* User Profile */}
      <div className={`border-t border-gray-100 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${collapsed ? 'flex-col px-0' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user.name ?? user.email.split('@')[0]}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${plan.bg} ${plan.text}`}>
                  {plan.label}
                </span>
                <span className="truncate text-[10px] text-gray-400">{user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className={`shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 ${collapsed ? '' : ''}`}
            title="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2.5 shadow-md transition hover:shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-100 bg-white transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-gray-100 bg-white transition-all duration-300 lg:block ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      <ConfirmModal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={logout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        variant="danger"
      />
    </>
  );
}

'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUsage } from '@/hooks/use-api';
import { useSidebarCollapsed } from '@/hooks/use-sidebar-collapsed';
import {
  LayoutDashboard, GraduationCap, ClipboardList, BarChart3,
  MessageCircle, CreditCard, LogOut, ChevronLeft,
  Zap, X, Sparkles, Settings, Trophy,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Tooltip } from '@/components/ui/tooltip';
import { useSidebarMobile } from './sidebar-mobile-context';

const NAV_SECTIONS = [
  {
    title: '학습',
    items: [
      { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
      { href: '/session', label: '학습하기', icon: GraduationCap },
      { href: '/history', label: '학습 기록', icon: ClipboardList },
      { href: '/stats', label: '통계', icon: BarChart3 },
      { href: '/achievements', label: '업적', icon: Trophy },
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
      { href: '/billing', label: '구독 관리', icon: CreditCard },
      { href: '/pricing', label: '요금제', icon: Zap },
    ],
  },
];

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function SidebarLabel({
  show,
  children,
  className = '',
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-150 ease-out ${
        show ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
      } ${className}`}
      aria-hidden={!show}
    >
      {children}
    </span>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { data: usage } = useUsage();
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  const [showLabels, setShowLabels] = useState(() => !collapsed);
  const { mobileOpen, setMobileOpen } = useSidebarMobile();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleToggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      if (prev) {
        // 펼칠 때 : 너비 애니메이션과 함께 라벨 표시 (transitionend 대기 없음)
        setShowLabels(true);
      } else {
        setShowLabels(false);
      }
      return !prev;
    });
  }, [setCollapsed]);

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

  const showCollapsedTooltips = collapsed;

  const renderSidebarContent = (compact: boolean, { forceLabels = false, showMobileClose = false } = {}) => {
    const labelsVisible = !compact && (forceLabels || showLabels);

    return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className={`flex h-16 items-center justify-between ${compact ? 'px-3' : 'px-5'}`}>
        <Tooltip content="DeepDev" disabled={!showCollapsedTooltips || !compact}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <SidebarLabel show={labelsVisible} className="text-lg font-extrabold">
              <span className="text-primary-500">Deep</span>
              <span className="text-gray-900">Dev</span>
            </SidebarLabel>
          </Link>
        </Tooltip>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip content="사이드바 펼치기" disabled={!showCollapsedTooltips || !compact}>
            <button
              onClick={handleToggleCollapsed}
              className="hidden rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 lg:block"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${compact ? 'rotate-180' : ''}`} />
            </button>
          </Tooltip>
          {showMobileClose && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav Sections */}
      <nav className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3 ${compact ? 'px-2' : 'px-3'}`}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4 last:mb-0">
            {!compact && (
              <SidebarLabel
                show={labelsVisible}
                className="mb-1.5 block px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400"
              >
                {section.title}
              </SidebarLabel>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Tooltip
                    key={item.href}
                    content={item.label}
                    disabled={!showCollapsedTooltips || !compact}
                    className={compact ? 'flex w-full justify-center' : 'w-full'}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center rounded-xl py-2 text-sm font-medium transition-colors ${
                        compact ? 'w-full justify-center' : 'w-full gap-3 px-3'
                      } ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {!compact && (
                        <SidebarLabel show={labelsVisible}>
                          {item.label}
                        </SidebarLabel>
                      )}
                    </Link>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usage Bar */}
      {labelsVisible && usage && (
        <div className="mx-3 mb-3 shrink-0 rounded-xl bg-gray-50 p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              이번 달 사용량
            </span>
            <span className="text-[10px] font-semibold text-gray-500">
              {usagePercent}%
            </span>
          </div>
          <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 90 ? 'bg-red-400' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-primary-400'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <p className="truncate text-[10px] leading-relaxed text-gray-400">
            세션 {usage.month.sessions}/{usage.limits.monthlySessions}
            {' · '}
            토큰 {formatTokens(usage.month.tokens)}/{formatTokens(usage.limits.monthlyTokens)}
            {' · '}
            탐구 {usage.month.explorations}/{usage.limits.monthlyExplorations}
          </p>
          {user.planType === 'FREE' ? (
            <Link
              href="/pricing"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary-500 transition hover:text-primary-600"
            >
              <Zap className="h-3 w-3" />
              PRO 업그레이드
            </Link>
          ) : (
            <Link
              href="/billing"
              className="mt-2 inline-flex text-[10px] font-medium text-gray-500 transition hover:text-gray-700"
            >
              구독 관리
            </Link>
          )}
        </div>
      )}

      {/* User Profile */}
      <div className={`shrink-0 border-t border-gray-100 p-2.5 ${compact ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex items-center gap-2.5 rounded-xl px-2 py-2 ${compact ? 'flex-col px-0' : ''}`}>
          <Tooltip
            content={user.name ?? user.email.split('@')[0]}
            disabled={!showCollapsedTooltips || !compact}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
          </Tooltip>
          {labelsVisible && (
            <Tooltip content={user.email} disabled={compact}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {user.name ?? user.email.split('@')[0]}
                </p>
                <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${plan.bg} ${plan.text}`}>
                  {plan.label}
                </span>
              </div>
            </Tooltip>
          )}
          <Tooltip content="로그아웃" disabled={!showCollapsedTooltips || !compact}>
            <button
              onClick={() => setLogoutConfirmOpen(true)}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(false, { forceLabels: true, showMobileClose: true })}
      </aside>

      {/* Desktop sidebar */}
      <aside
        data-desktop-sidebar
        suppressHydrationWarning
        className={`sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-gray-100 bg-white transition-[width] duration-300 ease-in-out lg:block ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className="relative h-full">
          {renderSidebarContent(collapsed)}
        </div>
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

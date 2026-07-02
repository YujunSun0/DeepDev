'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles } from 'lucide-react';

type SidebarMobileContextValue = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
};

const SidebarMobileContext = createContext<SidebarMobileContextValue | null>(null);

export function SidebarMobileProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleMobileOpen = () => setMobileOpen((prev) => !prev);

  return (
    <SidebarMobileContext.Provider value={{ mobileOpen, setMobileOpen, toggleMobileOpen }}>
      {children}
    </SidebarMobileContext.Provider>
  );
}

export function useSidebarMobile() {
  const ctx = useContext(SidebarMobileContext);
  if (!ctx) {
    throw new Error('useSidebarMobile must be used within SidebarMobileProvider');
  }
  return ctx;
}

export function AppMobileHeader() {
  const { toggleMobileOpen } = useSidebarMobile();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 lg:hidden">
      <button
        type="button"
        onClick={toggleMobileOpen}
        className="shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-extrabold">
          <span className="text-primary-500">Deep</span>
          <span className="text-gray-900">Dev</span>
        </span>
      </Link>
    </header>
  );
}

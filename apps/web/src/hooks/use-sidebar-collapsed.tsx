'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';

export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'deepdev_sidebar_collapsed';

export function readSidebarCollapsedFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function syncSidebarCollapsedClass(collapsed: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
}

type SidebarCollapsedContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
};

const SidebarCollapsedContext = createContext<SidebarCollapsedContextValue | null>(null);

export function SidebarCollapsedProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(readSidebarCollapsedFromStorage);

  useEffect(() => {
    syncSidebarCollapsedClass(collapsed);
  }, [collapsed]);

  const setCollapsed = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setCollapsedState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      syncSidebarCollapsedClass(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ collapsed, setCollapsed }), [collapsed, setCollapsed]);

  return (
    <SidebarCollapsedContext.Provider value={value}>
      {children}
    </SidebarCollapsedContext.Provider>
  );
}

export function useSidebarCollapsed() {
  const ctx = useContext(SidebarCollapsedContext);
  if (!ctx) {
    throw new Error('useSidebarCollapsed must be used within SidebarCollapsedProvider');
  }
  return ctx;
}

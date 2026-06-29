'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'deepdev_sidebar_collapsed';

export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCollapsedState(stored === 'true');
      }
    } catch {
      // localStorage unavailable
    }
    setHydrated(true);
  }, []);

  const setCollapsed = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setCollapsedState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  return { collapsed, setCollapsed, hydrated };
}

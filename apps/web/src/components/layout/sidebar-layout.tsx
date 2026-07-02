'use client';

import { Sidebar } from './sidebar';
import { ProtectedRoute } from './protected-route';
import { AchievementLoginCheck } from '@/components/achievement-login-check';
import { AppMobileHeader, SidebarMobileProvider } from './sidebar-mobile-context';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarMobileProvider>
        <AchievementLoginCheck />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppMobileHeader />
            <main className="flex-1 overflow-x-hidden">{children}</main>
          </div>
        </div>
      </SidebarMobileProvider>
    </ProtectedRoute>
  );
}

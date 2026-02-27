'use client';

import { Sidebar } from './sidebar';
import { ProtectedRoute } from './protected-route';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';

export function SessionLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSessionDetail = pathname !== '/session' && pathname.startsWith('/session/');

  if (isSessionDetail) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}

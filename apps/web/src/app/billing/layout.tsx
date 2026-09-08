import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export const metadata: Metadata = {
  title: '구독 관리',
  description: '플랜, 사용량, 결제 정보를 관리하세요.',
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

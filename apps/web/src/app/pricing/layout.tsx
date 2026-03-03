import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export const metadata: Metadata = {
  title: '요금제',
  description:
    'DeepDev Free, Pro, Master 플랜. 무료로 시작하고 필요할 때 업그레이드하세요. 월 10 세션, 100K 토큰, 탐구 3개부터.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export const metadata: Metadata = {
  title: '대시보드',
  description:
    '학습 현황, Skill Index, 개념 트리, 약점 분석, 최근 세션을 한눈에 확인하세요.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

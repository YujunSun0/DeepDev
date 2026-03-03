import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export const metadata: Metadata = {
  title: '학습 통계',
  description:
    'Pro 플랜 전용. 학습 점수 추이, 일별 완료 세션 수, 개념별 학습 분포를 확인하세요.',
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

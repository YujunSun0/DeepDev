import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export const metadata: Metadata = {
  title: '학습 기록',
  description:
    '완료한 학습 세션과 점수를 확인하고, 이어서 학습할 수 있습니다.',
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

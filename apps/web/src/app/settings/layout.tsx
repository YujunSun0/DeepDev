import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export const metadata: Metadata = {
  title: '설정',
  description: '프로필과 학습 환경을 설정하세요.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

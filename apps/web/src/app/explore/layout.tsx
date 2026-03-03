import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/layout/protected-route';

export const metadata: Metadata = {
  title: '탐구하기',
  description:
    '궁금한 개념을 선택하고 AI와 자유롭게 대화하며 깊이 있게 학습하세요. AI가 꼬리질문으로 이해도를 파악합니다.',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

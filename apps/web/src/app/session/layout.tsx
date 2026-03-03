import type { Metadata } from 'next';
import { SessionLayoutClient } from './session-layout-client';

export const metadata: Metadata = {
  title: '학습하기',
  description:
    'AI가 개념을 설명하고, 객관식·서술형·응용 문제를 출제·평가합니다. 체계적으로 JavaScript 개념을 학습하세요.',
};

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return <SessionLayoutClient>{children}</SessionLayoutClient>;
}

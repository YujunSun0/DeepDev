import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: 'DeepDev에 로그인하거나 회원가입하여 AI 기반 개발 학습을 시작하세요.',
  robots: { index: false, follow: true }, // 로그인 페이지는 검색 결과에서 제외
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

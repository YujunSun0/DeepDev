import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { SITE_URL } from '@/lib/constants';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DeepDev - AI 기반 개발자 숙련도 측정 플랫폼',
    template: '%s | DeepDev',
  },
  description:
    '개념 그래프 기반으로 JavaScript 등 개발 기술 숙련도를 정량화합니다. AI 학습 세션, 객관식·서술형·응용 문제, 탐구 모드로 체계적으로 실력을 측정하세요.',
  keywords: [
    '개발자 학습',
    'JavaScript 학습',
    'AI 학습',
    '숙련도 측정',
    '개념 학습',
    '프로그래밍 교육',
    '프론트엔드 학습',
    '백엔드 학습',
    '데이터베이스 학습',
    '네트워크 학습',
    '모바일 학습',
    'DeepDev',
  ],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'DeepDev',
    title: 'DeepDev - AI 기반 개발자 숙련도 측정 플랫폼',
    description:
      '개념 그래프 기반으로 개발 기술 숙련도를 정량화. AI 학습 세션과 탐구 모드로 체계적으로 실력을 측정하세요.',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'DeepDev' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeepDev - AI 기반 개발자 숙련도 측정 플랫폼',
    description: '개념 그래프 기반으로 개발 기술 숙련도를 정량화. AI 학습 세션과 탐구 모드로 체계적으로 실력을 측정하세요.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

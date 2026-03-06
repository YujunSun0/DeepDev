'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

interface LandingCtaProps {
  className?: string;
  /** hero: 큰 버튼, cta: 중간 버튼 */
  variant?: 'hero' | 'cta';
}

export function LandingCta({ className = '', variant = 'hero' }: LandingCtaProps) {
  const { user } = useAuth();

  const baseClass =
    variant === 'hero'
      ? 'rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-400 hover:shadow-primary-400/30 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base'
      : 'inline-block rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-400 sm:rounded-2xl sm:px-10 sm:py-4 sm:text-base';

  if (user) {
    return (
      <Link href="/dashboard" className={`${baseClass} ${className}`}>
        학습 시작하기
      </Link>
    );
  }

  return (
    <Link href="/login" className={`${baseClass} ${className}`}>
      무료로 시작하기
    </Link>
  );
}

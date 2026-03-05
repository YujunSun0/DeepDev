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
      ? 'rounded-2xl bg-primary-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-400 hover:shadow-primary-400/30'
      : 'inline-block rounded-2xl bg-primary-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-400';

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

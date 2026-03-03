'use client';

import Link from 'next/link';
import { AlertTriangle, Zap, X } from 'lucide-react';
import { useState } from 'react';
import { useUsage } from '@/hooks/use-api';

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

interface UsageWarningProps {
  compact?: boolean;
}

export function UsageWarning({ compact = false }: UsageWarningProps) {
  const { data: usage } = useUsage();
  const [dismissed, setDismissed] = useState(false);

  if (!usage || dismissed) return null;

  const avgPercent = Math.round(
    (usage.percent.sessions + usage.percent.tokens + usage.percent.explorations) / 3
  );
  const maxPercent = Math.max(
    usage.percent.sessions,
    usage.percent.tokens,
    usage.percent.explorations,
  );

  if (avgPercent < 80 && maxPercent < 100) return null;

  const isExceeded = maxPercent >= 100;
  const isNearLimit = avgPercent >= 90 || maxPercent >= 90;

  const explorationsFull = usage.month.explorations >= usage.limits.monthlyExplorations;
  const sessionsFull = usage.month.sessions >= usage.limits.monthlySessions;
  const tokensFull = usage.month.tokens >= usage.limits.monthlyTokens;

  const getExceededMessage = (short = false) => {
    if (explorationsFull && !sessionsFull && !tokensFull) {
      return short ? '탐구 한도 도달. 기존 대화는 계속 가능' : '새 탐구 생성 한도에 도달했습니다. 기존 탐구 대화는 계속 가능합니다.';
    }
    if (sessionsFull && !explorationsFull && !tokensFull) {
      return short ? '세션 한도 도달' : '이번 달 학습 세션 한도에 도달했습니다.';
    }
    if (tokensFull) {
      return short ? '토큰 한도 도달' : '이번 달 토큰 한도에 도달했습니다.';
    }
    const parts: string[] = [];
    if (explorationsFull) parts.push('탐구');
    if (sessionsFull) parts.push('세션');
    if (tokensFull) parts.push('토큰');
    return short ? `${parts.join('·')} 한도 도달` : `${parts.join('·')} 한도에 도달했습니다.`;
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
        isExceeded
          ? 'bg-red-50 text-red-600'
          : isNearLimit
            ? 'bg-amber-50 text-amber-600'
            : 'bg-yellow-50 text-yellow-600'
      }`}>
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 shrink">
          {isExceeded
            ? getExceededMessage(true)
            : `이번 달 사용량 ${avgPercent}% 도달`}
        </span>
        {usage.plan === 'FREE' && (
          <Link
            href="/pricing"
            className="ml-1 flex items-center gap-1 rounded-lg bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white transition hover:bg-primary-400"
          >
            <Zap className="h-2.5 w-2.5" />
            업그레이드
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border px-5 py-4 ${
      isExceeded
        ? 'border-red-200 bg-red-50'
        : isNearLimit
          ? 'border-amber-200 bg-amber-50'
          : 'border-yellow-200 bg-yellow-50'
    }`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 transition hover:bg-white/60 hover:text-gray-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-xl p-2 ${
          isExceeded ? 'bg-red-100' : isNearLimit ? 'bg-amber-100' : 'bg-yellow-100'
        }`}>
          <AlertTriangle className={`h-4 w-4 ${
            isExceeded ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-yellow-500'
          }`} />
        </div>

        <div className="flex-1">
          <p className={`text-sm font-bold ${
            isExceeded ? 'text-red-700' : isNearLimit ? 'text-amber-700' : 'text-yellow-700'
          }`}>
            {isExceeded
              ? getExceededMessage()
              : '이번 달 사용 한도가 얼마 남지 않았어요'}
          </p>
          <p className={`mt-1 text-xs ${
            isExceeded ? 'text-red-600/70' : isNearLimit ? 'text-amber-600/70' : 'text-yellow-600/70'
          }`}>
            {isExceeded
              ? explorationsFull && !sessionsFull && !tokensFull
                ? '기존 탐구 대화는 남은 횟수만큼 계속 가능합니다. 다음 달 1일에 초기화됩니다.'
                : '다음 달 1일에 초기화됩니다. PRO 플랜으로 업그레이드하면 더 많은 학습이 가능합니다.'
              : `세션 ${usage.month.sessions}/${usage.limits.monthlySessions}회 · 토큰 ${formatTokens(usage.month.tokens)}/${formatTokens(usage.limits.monthlyTokens)} · 탐구 ${usage.month.explorations}/${usage.limits.monthlyExplorations}개`}
          </p>

          {usage.plan === 'FREE' && (
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-400 hover:shadow-md"
            >
              <Zap className="h-3.5 w-3.5" />
              PRO 플랜으로 업그레이드
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

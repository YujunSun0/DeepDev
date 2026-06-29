'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ChevronRight, Trophy, Flame } from 'lucide-react';

export type AchievementToastItem = {
  id: string;
  title: string;
  message: string;
  icon: string | null;
  code?: string;
};

const AUTO_DISMISS_MS = 3000;

function ToastIcon({ icon, code }: { icon: string | null; code?: string }) {
  if (icon) {
    return (
      <Image
        src={icon}
        alt=""
        width={36}
        height={36}
        className="shrink-0 object-contain"
      />
    );
  }
  const isStreak = code?.startsWith('STREAK_');
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        isStreak ? 'bg-orange-50' : 'bg-amber-50'
      }`}
    >
      {isStreak ? (
        <Flame className="h-5 w-5 text-orange-500" />
      ) : (
        <Trophy className="h-5 w-5 text-amber-500" />
      )}
    </div>
  );
}

function AchievementToast({
  item,
  onDismiss,
}: {
  item: AchievementToastItem;
  onDismiss: (id: string) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  const goToAchievements = useCallback(() => {
    onDismiss(item.id);
    router.push('/achievements');
  }, [item.id, onDismiss, router]);

  return (
    <div
      role="status"
      className="animate-toast-in pointer-events-auto flex w-[min(100vw-2rem,22rem)] items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-lg shadow-gray-200/60"
    >
      <ToastIcon icon={item.icon} code={item.code} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
        <p className="line-clamp-2 text-xs text-gray-500">{item.message}</p>
      </div>
      <button
        type="button"
        onClick={goToAchievements}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-primary-500"
        aria-label="업적 페이지로 이동"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export function AchievementToastStack({
  items,
  onDismiss,
}: {
  items: AchievementToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (items.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[200] flex flex-col items-end gap-2 sm:right-6 sm:top-6">
      {items.map((item) => (
        <AchievementToast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

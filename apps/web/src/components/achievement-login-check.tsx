'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAchievementsCheck } from '@/hooks/use-api';
import {
  AchievementToastStack,
  type AchievementToastItem,
} from '@/components/achievement-toast';

const ATTENDANCE_TOAST_KEY_PREFIX = 'deepdev_attendance_modal_';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 로그인 후 사이드바 레이아웃 진입 시 하루 1회 출석·연속 학습 업적 토스트 */
export function AchievementLoginCheck() {
  const achievementsCheck = useAchievementsCheck();
  const ranRef = useRef(false);
  const [toasts, setToasts] = useState<AchievementToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const storageKey = `${ATTENDANCE_TOAST_KEY_PREFIX}${todayKey()}`;
    if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
      return;
    }

    (async () => {
      try {
        const result = await achievementsCheck.mutateAsync();
        const items: AchievementToastItem[] = [];

        if (result.progressNotification) {
          const p = result.progressNotification;
          items.push({
            id: nextToastId(),
            title: p.name,
            message: p.message,
            icon: p.icon,
            code: p.code,
          });
        }

        if (result.awardedAchievements && result.awardedAchievements.length > 0) {
          for (const a of result.awardedAchievements) {
            items.push({
              id: nextToastId(),
              title: a.name || '업적 달성',
              message: `${a.description} 달성!`,
              icon: a.icon,
              code: a.code,
            });
          }
        } else if (result.awarded > 0 && result.achievementNames?.length) {
          for (const desc of result.achievementNames) {
            items.push({
              id: nextToastId(),
              title: '업적 달성',
              message: `${desc} 달성!`,
              icon: null,
            });
          }
        }

        if (items.length > 0) {
          localStorage.setItem(storageKey, '1');
          setToasts(items);
        }
      } catch {
        // 출석/업적 체크 실패는 무시
      }
    })();
  }, [achievementsCheck]);

  return <AchievementToastStack items={toasts} onDismiss={dismissToast} />;
}

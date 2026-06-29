'use client';

import { useEffect, useRef, useState } from 'react';
import { useAchievementsCheck } from '@/hooks/use-api';
import { AchievementModal } from '@/components/achievement-modal';

const ATTENDANCE_MODAL_KEY_PREFIX = 'deepdev_attendance_modal_';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type ModalData =
  | {
      type: 'achievement';
      items: Array<{
        code: string;
        name: string;
        description: string;
        icon: string | null;
        current: number;
        target: number;
      }>;
    }
  | {
      type: 'progress';
      code: string;
      name: string;
      description: string;
      icon: string | null;
      current: number;
      target: number;
      message: string;
    };

/** 로그인 후 사이드바 레이아웃 진입 시 하루 1회 출석·연속 학습 업적 알림 */
export function AchievementLoginCheck() {
  const achievementsCheck = useAchievementsCheck();
  const ranRef = useRef(false);
  const [modalQueue, setModalQueue] = useState<ModalData[]>([]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const storageKey = `${ATTENDANCE_MODAL_KEY_PREFIX}${todayKey()}`;
    if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
      return;
    }

    (async () => {
      try {
        const result = await achievementsCheck.mutateAsync();
        const queue: ModalData[] = [];

        // 출석(연속 학습 진행) 알림을 먼저 — 신규 업적 달성보다 우선
        if (result.progressNotification) {
          const p = result.progressNotification;
          queue.push({
            type: 'progress',
            code: p.code,
            name: p.name,
            description: p.description,
            icon: p.icon,
            current: p.current,
            target: p.target,
            message: p.message,
          });
        }

        if (result.awardedAchievements && result.awardedAchievements.length > 0) {
          queue.push({ type: 'achievement', items: result.awardedAchievements });
        } else if (result.awarded > 0 && result.achievementNames?.length) {
          queue.push({
            type: 'achievement',
            items: result.achievementNames.map((desc) => ({
              code: '',
              name: '',
              description: desc,
              icon: null,
              current: 0,
              target: 0,
            })),
          });
        }

        if (queue.length > 0) {
          localStorage.setItem(storageKey, '1');
          setModalQueue(queue);
        }
      } catch {
        // 출석/업적 체크 실패는 무시
      }
    })();
  }, [achievementsCheck]);

  const currentModal = modalQueue[0] ?? null;

  return (
    <AchievementModal
      open={currentModal != null}
      onClose={() => setModalQueue((q) => q.slice(1))}
      data={currentModal}
    />
  );
}

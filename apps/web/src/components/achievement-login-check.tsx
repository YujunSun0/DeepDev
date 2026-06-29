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
  const [modalData, setModalData] = useState<ModalData | null>(null);

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

        if (result.awardedAchievements && result.awardedAchievements.length > 0) {
          setModalData({ type: 'achievement', items: result.awardedAchievements });
          localStorage.setItem(storageKey, '1');
          return;
        }

        if (result.progressNotification) {
          const p = result.progressNotification;
          setModalData({
            type: 'progress',
            code: p.code,
            name: p.name,
            description: p.description,
            icon: p.icon,
            current: p.current,
            target: p.target,
            message: p.message,
          });
          localStorage.setItem(storageKey, '1');
        }
      } catch {
        // 출석/업적 체크 실패는 무시
      }
    })();
  }, [achievementsCheck]);

  return (
    <AchievementModal
      open={modalData != null}
      onClose={() => setModalData(null)}
      data={modalData}
    />
  );
}

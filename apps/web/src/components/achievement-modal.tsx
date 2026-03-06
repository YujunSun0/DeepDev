'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Trophy, Flame } from 'lucide-react';

export type AchievementItem = {
  code: string;
  name: string;
  description: string;
  icon: string | null;
  current: number;
  target: number;
};

type ModalData =
  | { type: 'achievement'; items: AchievementItem[] }
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

export interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
  data: ModalData | null;
}

function ProgressBar({ current, target, duration = 700 }: { current: number; target: number; duration?: number }) {
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="w-full">
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-500 transition-all ease-out"
          style={{
            width: animated ? `${percent}%` : '0%',
            transitionDuration: `${duration}ms`,
          }}
        />
      </div>
      <p className="mt-1.5 text-center text-sm text-gray-500">
        {current} / {target}
        {current >= target && target > 0 && ' ✓'}
      </p>
    </div>
  );
}

function getAchievementAnimation(code: string): string {
  if (code.startsWith('STREAK_')) return 'animate-pulse';
  if (code.startsWith('PERFECT_')) return 'animate-pulse';
  if (code.startsWith('SESSION_')) return 'animate-pulse';
  if (code.startsWith('SPEED_LEARNER')) return 'animate-pulse';
  return 'animate-pulse';
}

function AchievementIcon({ item, size = 64 }: { item: AchievementItem; size?: number }) {
  const animation = getAchievementAnimation(item.code);
  if (item.icon) {
    return (
      <div className={`relative ${animation}`}>
        <Image
          src={item.icon}
          alt={item.name}
          width={size}
          height={size}
          className="object-contain"
        />
        {(item.code.startsWith('STREAK_') || item.code.startsWith('PERFECT_')) && (
          <div className="absolute -inset-2 -z-10 animate-pulse rounded-full bg-orange-100/50" />
        )}
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center rounded-2xl bg-amber-50 ${animation}`} style={{ width: size, height: size }}>
      <Trophy className="h-10 w-10 text-amber-500" style={size < 64 ? { width: size * 0.5, height: size * 0.5 } : undefined} />
    </div>
  );
}

export function AchievementModal({ open, onClose, data }: AchievementModalProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setExiting(false);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!open || !data) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ${
          visible && !exiting ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {data.type === 'achievement' ? (
          data.items.length === 0 ? (
            <div className="py-4 text-center text-gray-500">업적 달성!</div>
          ) : data.items.length === 1 ? (
            <>
              <div className="mb-4 flex justify-center">
                <AchievementIcon item={data.items[0]} />
              </div>
              <h2 className="mb-1 text-center text-lg font-bold text-gray-900">
                {data.items[0].name}
              </h2>
              <p className="mb-4 text-center text-sm text-gray-600">
                {data.items[0].description} 달성!
              </p>
              {data.items[0].target > 0 && (
                <div className="mb-6">
                  <ProgressBar current={data.items[0].current} target={data.items[0].target} />
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="mb-4 text-center text-lg font-bold text-gray-900">
                🎉 업적 {data.items.length}개 달성! 🎉
              </h2>
              <div className="mb-6 space-y-4">
                {data.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <AchievementIcon item={item} size={48} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.description} 달성!</p>
                      </div>
                    </div>
                    {item.target > 0 && (
                      <ProgressBar current={item.current} target={item.target} duration={500 + i * 100} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              {data.icon ? (
                <div className="relative">
                  <Image
                    src={data.icon}
                    alt={data.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                  <div className="absolute -inset-2 -z-10 animate-pulse rounded-full bg-orange-100/50" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
                  <Flame className="h-10 w-10 text-orange-500" />
                </div>
              )}
            </div>
            <h2 className="mb-1 text-center text-lg font-bold text-gray-900">
              {data.name}
            </h2>
            <p className="mb-4 text-center text-sm text-gray-600">{data.message}</p>
            <ProgressBar current={data.current} target={data.target} />
          </>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
        >
          확인
        </button>
      </div>
    </div>
  );
}

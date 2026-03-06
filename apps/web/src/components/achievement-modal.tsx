'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trophy, ChevronRight, Flame } from 'lucide-react';

type ModalData =
  | {
      type: 'achievement';
      count: number;
      names: string[];
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

export interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
  data: ModalData | null;
}

function ProgressBar({ current, target }: { current: number; target: number }) {
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
          className="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out"
          style={{ width: animated ? `${percent}%` : '0%' }}
        />
      </div>
      <p className="mt-1.5 text-center text-sm text-gray-500">
        {current} / {target}
      </p>
    </div>
  );
}

export function AchievementModal({ open, onClose, data }: AchievementModalProps) {
  if (!open || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {data.type === 'achievement' ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
                <Trophy className="h-10 w-10 text-amber-500" />
              </div>
            </div>
            <h2 className="mb-2 text-center text-lg font-bold text-gray-900">
              업적 {data.count}개 달성!
            </h2>
            <div className="mb-6 space-y-1 text-center text-sm text-gray-600">
              {data.names.map((name, i) => (
                <p key={i}>{name}</p>
              ))}
            </div>
          </>
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

        <Link
          href="/achievements"
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
        >
          업적 보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

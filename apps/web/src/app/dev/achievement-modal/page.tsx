'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AchievementModal, type AchievementItem } from '@/components/achievement-modal';
import { ChevronLeft } from 'lucide-react';

const SAMPLE_ACHIEVEMENTS: Record<string, AchievementItem> = {
  STREAK_3: {
    code: 'STREAK_3',
    name: '연속 학습왕',
    description: '3일 연속 학습',
    icon: '/achievements/acv_1-rmbg.png',
    current: 3,
    target: 3,
  },
  STREAK_7_PROGRESS: {
    code: 'STREAK_7',
    name: '연속 학습왕',
    description: '7일 연속 학습',
    icon: '/achievements/acv_1-rmbg.png',
    current: 2,
    target: 7,
  },
  SESSION_5: {
    code: 'SESSION_5',
    name: '세션 마스터',
    description: '5개 세션 완료',
    icon: '/achievements/acv_3-rmbg.png',
    current: 5,
    target: 5,
  },
  PERFECT_1: {
    code: 'PERFECT_1',
    name: '만점왕',
    description: '100점 1회',
    icon: '/achievements/acv_4-rmbg.png',
    current: 1,
    target: 1,
  },
  EXPLORER_3: {
    code: 'EXPLORER_3',
    name: '탐구왕',
    description: '탐구 대화 3턴',
    icon: '/achievements/acv_6-rmbg.png',
    current: 3,
    target: 3,
  },
};

export default function AchievementModalTestPage() {
  const [modalData, setModalData] = useState<Parameters<typeof AchievementModal>[0]['data']>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-amber-50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            대시보드
          </Link>
          <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
            개발용
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-xl font-bold text-gray-900">업적 모달 테스트</h1>
        <p className="mb-8 text-sm text-gray-500">
          각 버튼을 눌러 업적 달성 모달을 미리 확인할 수 있습니다.
        </p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">업적 달성 (단일)</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  setModalData({
                    type: 'achievement',
                    items: [SAMPLE_ACHIEVEMENTS.STREAK_3],
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                🔥 연속 학습왕 (3일 달성)
              </button>
              <button
                onClick={() =>
                  setModalData({
                    type: 'achievement',
                    items: [SAMPLE_ACHIEVEMENTS.SESSION_5],
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                👑 세션 마스터 (5개 달성)
              </button>
              <button
                onClick={() =>
                  setModalData({
                    type: 'achievement',
                    items: [SAMPLE_ACHIEVEMENTS.PERFECT_1],
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                💯 만점왕 (1회 달성)
              </button>
              <button
                onClick={() =>
                  setModalData({
                    type: 'achievement',
                    items: [SAMPLE_ACHIEVEMENTS.EXPLORER_3],
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                🧭 탐구왕 (3턴 달성)
              </button>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">업적 달성 (복수)</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  setModalData({
                    type: 'achievement',
                    items: [
                      SAMPLE_ACHIEVEMENTS.STREAK_3,
                      SAMPLE_ACHIEVEMENTS.SESSION_5,
                    ],
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                연속 학습왕 + 세션 마스터
              </button>
              <button
                onClick={() =>
                  setModalData({
                    type: 'achievement',
                    items: [
                      SAMPLE_ACHIEVEMENTS.STREAK_3,
                      SAMPLE_ACHIEVEMENTS.SESSION_5,
                      SAMPLE_ACHIEVEMENTS.PERFECT_1,
                    ],
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                3개 업적 동시 달성
              </button>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">진행률 알림</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  setModalData({
                    type: 'progress',
                    code: 'STREAK_7',
                    name: '연속 학습왕',
                    description: '7일 연속 학습',
                    icon: '/achievements/acv_1-rmbg.png',
                    current: 2,
                    target: 7,
                    message: '2일 연속 학습 완료! (목표 7일)',
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                🔥 연속 학습왕 진행률 (2/7일)
              </button>
              <button
                onClick={() =>
                  setModalData({
                    type: 'progress',
                    code: 'STREAK_30',
                    name: '연속 학습왕',
                    description: '30일 연속 학습',
                    icon: '/achievements/acv_1-rmbg.png',
                    current: 14,
                    target: 30,
                    message: '14일 연속 학습 완료! (목표 30일)',
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                🔥 연속 학습왕 진행률 (14/30일)
              </button>
              <button
                onClick={() =>
                  setModalData({
                    type: 'progress',
                    code: 'SPEED_LEARNER_3',
                    name: '빠른 학습자',
                    description: '하루 3세션 완료',
                    icon: '/achievements/acv_2-rmbg.png',
                    current: 2,
                    target: 3,
                    message: '오늘 2세션 완료! (목표 3세션)',
                  })
                }
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                ⚡ 빠른 학습자 진행률 (2/3)
              </button>
            </div>
          </section>
        </div>
      </div>

      <AchievementModal
        open={modalData !== null}
        onClose={() => setModalData(null)}
        data={modalData}
      />
    </div>
  );
}

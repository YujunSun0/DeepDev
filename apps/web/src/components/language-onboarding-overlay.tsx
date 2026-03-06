'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiOpenjdk,
  SiC,
  SiCplusplus,
  SiGo,
  SiRust,
} from 'react-icons/si';
import * as authLib from '@/lib/auth';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript', icon: SiJavascript, color: 'text-[#F7DF1E]' },
  { value: 'typescript', label: 'TypeScript', icon: SiTypescript, color: 'text-[#3178C6]' },
  { value: 'python', label: 'Python', icon: SiPython, color: 'text-[#3776AB]' },
  { value: 'java', label: 'Java', icon: SiOpenjdk, color: 'text-[#ED8B00]' },
  { value: 'c', label: 'C', icon: SiC, color: 'text-[#A8B9CC]' },
  { value: 'cpp', label: 'C++', icon: SiCplusplus, color: 'text-[#00599C]' },
  { value: 'go', label: 'Go', icon: SiGo, color: 'text-[#00ADD8]' },
  { value: 'rust', label: 'Rust', icon: SiRust, color: 'text-[#CE422B]' },
];

const DISMISS_KEY = 'preferredLanguageOnboardingDismissed';

export function LanguageOnboardingOverlay({
  onComplete,
  onDismiss,
}: {
  onComplete: () => void;
  onDismiss: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await authLib.updateProfile({ preferredLanguage: selected });
      if (updated) {
        onComplete();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_KEY, '1');
    }
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
            <Sparkles className="h-7 w-7 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            주로 사용하는 언어를 선택하세요
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            코드 예시를 이 언어로 생성해드려요. 마이페이지에서 언제든 변경할 수 있습니다
          </p>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-3">
          {LANGUAGE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition ${
                  isSelected
                    ? 'border-primary-400 bg-primary-50 shadow-md'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${opt.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <span className={`line-clamp-1 w-full text-center text-xs font-medium ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            나중에
          </button>
          <button
            type="button"
            onClick={handleSelect}
            disabled={!selected || saving}
            className="flex-1 rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:opacity-50"
          >
            {saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : '선택하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export const PREFERRED_LANGUAGE_DISMISS_KEY = DISMISS_KEY;

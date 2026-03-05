'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import * as authLib from '@/lib/auth';
import { Settings, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
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
import { ErrorMessage } from '@/components/ui';

const LANGUAGE_OPTIONS = [
  { value: '', label: '기본값', icon: Sparkles, color: 'text-gray-400' },
  { value: 'javascript', label: 'JavaScript', icon: SiJavascript, color: 'text-[#F7DF1E]' },
  { value: 'typescript', label: 'TypeScript', icon: SiTypescript, color: 'text-[#3178C6]' },
  { value: 'python', label: 'Python', icon: SiPython, color: 'text-[#3776AB]' },
  { value: 'java', label: 'Java', icon: SiOpenjdk, color: 'text-[#ED8B00]' },
  { value: 'c', label: 'C', icon: SiC, color: 'text-[#A8B9CC]' },
  { value: 'cpp', label: 'C++', icon: SiCplusplus, color: 'text-[#00599C]' },
  { value: 'go', label: 'Go', icon: SiGo, color: 'text-[#00ADD8]' },
  { value: 'rust', label: 'Rust', icon: SiRust, color: 'text-[#CE422B]' },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [preferredLanguage, setPreferredLanguage] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.preferredLanguage) {
      setPreferredLanguage(user.preferredLanguage);
    } else {
      setPreferredLanguage('');
    }
  }, [user?.preferredLanguage]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      const value = preferredLanguage || null;
      const updated = await authLib.updatePreferredLanguage(value);
      if (updated) {
        refreshUser();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    (preferredLanguage || '') !== (user?.preferredLanguage ?? '');

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Settings className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">설정</h1>
            <p className="text-sm text-gray-500">학습 환경을 맞춤 설정하세요</p>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError('')} className="mb-6" />
        )}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-gray-900">선호 프로그래밍 언어</h2>
          <p className="mb-5 text-sm text-gray-500">
            개념 설명과 문제의 코드 예시를 이 언어로 생성합니다. 모르는 언어의 예시는 이해하기 어려우니,
            주로 학습하는 언어를 선택해보세요.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {LANGUAGE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = (preferredLanguage || '') === opt.value;
              return (
                <button
                  key={opt.value || 'default'}
                  type="button"
                  onClick={() => setPreferredLanguage(opt.value)}
                  title={opt.value === '' ? '개념 도메인에 맞춤' : undefined}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition ${
                    isSelected
                      ? 'border-primary-400 bg-primary-50 shadow-sm'
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
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : null}
              {saving ? '저장 중...' : saved ? '저장됨' : '저장'}
            </button>
            {saved && (
              <span className="text-sm text-emerald-600">설정이 저장되었습니다</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface SubscriptionSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionSuccessModal({ open, onClose }: SubscriptionSuccessModalProps) {
  return (
    <Modal open={open} onClose={onClose} showCloseButton={false} maxWidth="sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <CheckCircle2 className="h-7 w-7 text-primary-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Pro 구독이 시작됐어요</h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          결제가 완료되었습니다. 이제 더 많은 세션·토큰과
          <br />
          성장 분석 기능을 이용할 수 있어요.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            확인
          </button>
          <Link
            href="/billing"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
          >
            <Sparkles className="h-4 w-4" />
            구독 관리
          </Link>
        </div>
      </div>
    </Modal>
  );
}

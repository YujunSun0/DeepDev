'use client';

import { Modal } from './modal';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** 위험 액션(로그아웃, 삭제 등) 시 true. 확인 버튼이 빨간색으로 표시 */
  variant?: 'default' | 'danger';
  /** false면 확인 시 모달을 자동으로 닫지 않음 (비동기 처리 후 부모가 onClose 호출) */
  closeOnConfirm?: boolean;
  /** true면 확인 버튼 비활성화 및 로딩 텍스트 표시 */
  confirmLoading?: boolean;
  confirmLoadingText?: string;
  /** 에러 메시지 (모달 내 표시) */
  error?: string;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  closeOnConfirm = true,
  confirmLoading = false,
  confirmLoadingText = '처리 중...',
  error,
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    if (closeOnConfirm) onClose();
  };

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-primary-500 text-white hover:bg-primary-600';

  return (
    <Modal open={open} onClose={onClose} title={title} showCloseButton={false}>
      <p className="mb-6 text-sm text-gray-600">{message}</p>
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirmLoading}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
        >
          {confirmLoading ? confirmLoadingText : confirmText}
        </button>
      </div>
    </Modal>
  );
}

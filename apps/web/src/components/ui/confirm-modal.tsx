'use client';

import { Modal } from './modal';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** 위험 액션(로그아웃, 삭제 등) 시 true. 확인 버튼이 빨간색으로 표시 */
  variant?: 'default' | 'danger';
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
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-primary-500 text-white hover:bg-primary-600';

  return (
    <Modal open={open} onClose={onClose} title={title} showCloseButton={false}>
      <p className="mb-6 text-sm text-gray-600">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${confirmButtonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

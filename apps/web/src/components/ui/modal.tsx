'use client';

import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** 배경 클릭 시 닫기. 기본 true */
  closeOnBackdrop?: boolean;
  /** max-width. 기본 max-w-md */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** 닫기 버튼 표시. 기본 true */
  showCloseButton?: boolean;
}

const maxWidthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`relative w-full ${maxWidthClass[maxWidth]} max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            {title && (
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

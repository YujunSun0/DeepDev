'use client';

import { X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onDismiss, className = '' }: ErrorMessageProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3.5 text-sm text-red-600 ${className}`}
      role="alert"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1.5 text-red-500 transition hover:bg-red-100 hover:text-red-700"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

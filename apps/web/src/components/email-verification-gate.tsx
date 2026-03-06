'use client';

import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { resendVerificationEmail } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api-error';

export function EmailVerificationGate({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  if (!user) return <>{children}</>;
  if (user.emailVerified !== false) return <>{children}</>;

  const handleResend = async () => {
    if (!user.email) return;
    setResending(true);
    setResendError('');
    setResendMessage('');
    try {
      const res = await resendVerificationEmail(user.email);
      setResendMessage(res.message);
      setTimeout(() => setResendMessage(''), 5000);
    } catch (e) {
      setResendError(getApiErrorMessage(e));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          이메일 인증이 필요합니다
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          서비스를 이용하려면 가입 시 발송된 이메일의 인증 링크를 클릭해주세요.
          <br />
          메일이 오지 않았다면 아래 버튼으로 다시 보내드릴 수 있습니다.
        </p>
        {resendMessage && (
          <p className="mb-4 text-center text-sm text-green-600">{resendMessage}</p>
        )}
        {resendError && (
          <p className="mb-4 text-center text-sm text-red-600">{resendError}</p>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:opacity-50"
        >
          {resending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {resending ? '전송 중...' : '인증 메일 다시 보내기'}
        </button>
      </div>
    </div>
  );
}

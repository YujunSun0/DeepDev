'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Link2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  previewOAuthLink,
  confirmOAuthLink,
  getProviderLabel,
  type OAuthLinkPreview,
} from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorMessage } from '@/components/ui';

function OAuthLinkContent() {
  const searchParams = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [preview, setPreview] = useState<OAuthLinkPreview | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const linkToken = searchParams.get('token');

  useEffect(() => {
    if (!linkToken) {
      setError('연동 요청 정보가 없습니다. 다시 소셜 로그인을 시도해주세요.');
      setLoading(false);
      return;
    }

    previewOAuthLink(linkToken)
      .then(setPreview)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [linkToken]);

  const handleConfirm = async () => {
    if (!linkToken) return;
    setError('');
    setSubmitting(true);

    try {
      const { accessToken } = await confirmOAuthLink(
        linkToken,
        preview?.requiresPassword ? password : undefined,
      );
      await completeOAuthLogin(accessToken);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-sm text-red-600">{error}</p>
        <Link
          href="/login"
          className="rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
        >
          로그인 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  if (!preview || !linkToken) return null;

  const providerLabel = getProviderLabel(preview.provider);
  const existingLabel = getProviderLabel(preview.existingAuthProvider);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Link2 className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">계정 연동</h1>
        <p className="mb-6 text-center text-sm leading-relaxed text-gray-600">
          <span className="font-medium text-gray-900">{preview.email}</span>
          {' '}으로 가입된 {existingLabel} 계정이 있습니다.
          <br />
          {providerLabel} 계정을 연동하시겠습니까?
        </p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {preview.requiresPassword && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              기존 계정 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="보안 확인을 위해 비밀번호를 입력하세요"
            />
            <p className="mt-2 text-xs text-gray-400">
              본인 확인을 위해 기존 이메일 계정의 비밀번호가 필요합니다.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || (preview.requiresPassword && password.length < 8)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? '연동 중...' : `${providerLabel} 계정 연동하기`}
          </button>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-2xl border border-gray-200 py-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            취소
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OAuthLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <OAuthLinkContent />
    </Suspense>
  );
}

/**
 * API 에러에서 사용자에게 보여줄 메시지를 추출합니다.
 */
export function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return '오류가 발생했습니다';
  }

  // Axios error
  if ('response' in error) {
    const err = error as { response?: { data?: { message?: string | string[] }; status?: number } };
    const msg = err.response?.data?.message;

    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg) && msg.length > 0) return msg[0];

    const status = err.response?.status;
    if (status === 400) return '잘못된 요청입니다';
    if (status === 401) return '로그인이 필요합니다';
    if (status === 403) return '권한이 없습니다';
    if (status === 404) return '요청한 리소스를 찾을 수 없습니다';
    if (status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요';
    if (status && status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
  }

  // Network error
  if ('message' in error && typeof (error as { message: string }).message === 'string') {
    const msg = (error as { message: string }).message;
    if (msg.includes('Network Error') || msg.includes('ECONNABORTED')) {
      return '네트워크 연결을 확인해주세요';
    }
  }

  return '오류가 발생했습니다';
}

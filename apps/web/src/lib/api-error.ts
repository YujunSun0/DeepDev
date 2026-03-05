/** API에서 반환할 수 있는 영어 메시지 → 한글 매핑 (fallback) */
const ENGLISH_TO_KOREAN: Record<string, string> = {
  'Invalid credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
  'Email already registered': '이미 등록된 이메일입니다',
  'Invalid token': '유효하지 않은 토큰입니다',
  'User not found': '사용자를 찾을 수 없습니다',
  'Concept not found': '개념을 찾을 수 없습니다',
  'Session not found': '세션을 찾을 수 없습니다',
  'Not your session': '권한이 없습니다',
  'Not in correct state': '올바른 상태가 아닙니다',
  'Invalid signature': '유효하지 않은 서명입니다',
  'email must be an email': '올바른 이메일 형식이 아닙니다',
  'password must be longer than or equal to 8 characters': '비밀번호는 8자 이상이어야 합니다',
};

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

    let resolved: string | undefined;
    if (typeof msg === 'string') resolved = msg;
    else if (Array.isArray(msg) && msg.length > 0) resolved = msg[0];

    if (resolved) {
      return ENGLISH_TO_KOREAN[resolved] ?? resolved;
    }

    const status = err.response?.status;
    if (status === 400) return '잘못된 요청입니다. 입력 내용을 확인해주세요';
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

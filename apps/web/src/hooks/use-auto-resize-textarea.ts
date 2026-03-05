'use client';

import { useRef, useCallback, useEffect } from 'react';

/**
 * textarea가 내용에 따라 높이를 자동 조절하도록 합니다.
 * @param value - textarea value (변경 시 높이 재계산)
 * @param options - minHeightPx, maxHeightPx
 * @returns ref, adjustHeight (수동 호출용)
 */
export function useAutoResizeTextarea(
  value: string,
  options?: { minHeightPx?: number; maxHeightPx?: number },
) {
  const { minHeightPx = 44, maxHeightPx = 128 } = options ?? {};
  const ref = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const newHeight = Math.max(minHeightPx, Math.min(ta.scrollHeight, maxHeightPx));
    ta.style.height = `${newHeight}px`;
  }, [minHeightPx, maxHeightPx]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return { ref, adjustHeight };
}

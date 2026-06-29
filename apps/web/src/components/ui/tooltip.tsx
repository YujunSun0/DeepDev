'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  /** 툴팁에 표시할 텍스트 또는 노드 */
  content: ReactNode;
  /** 선택: 단축키 표시 (예: "⇧⌘O") */
  shortcut?: string;
  /** 툴팁이 나타날 방향 */
  side?: TooltipSide;
  /** true면 툴팁 비활성화 */
  disabled?: boolean;
  /** 표시 전 지연(ms) */
  delay?: number;
  children: ReactNode;
  className?: string;
}

const SIDE_OFFSET = 8;

function getTooltipPosition(
  rect: DOMRect,
  side: TooltipSide,
): Pick<CSSProperties, 'top' | 'left'> {
  switch (side) {
    case 'top':
      return {
        top: rect.top - SIDE_OFFSET,
        left: rect.left + rect.width / 2,
      };
    case 'bottom':
      return {
        top: rect.bottom + SIDE_OFFSET,
        left: rect.left + rect.width / 2,
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - SIDE_OFFSET,
      };
    case 'right':
    default:
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + SIDE_OFFSET,
      };
  }
}

const transformOrigin: Record<TooltipSide, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
};

export function Tooltip({
  content,
  shortcut,
  side = 'right',
  disabled = false,
  delay = 0,
  children,
  className = '',
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Pick<CSSProperties, 'top' | 'left'>>({
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDelay = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords(getTooltipPosition(rect, side));
  }, [side]);

  const show = useCallback(() => {
    if (disabled) return;
    clearDelay();
    delayRef.current = setTimeout(() => {
      updatePosition();
      setOpen(true);
    }, delay);
  }, [disabled, delay, clearDelay, updatePosition]);

  const hide = useCallback(() => {
    clearDelay();
    setOpen(false);
  }, [clearDelay]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => () => clearDelay(), [clearDelay]);

  return (
    <>
      <span
        ref={triggerRef}
        className={className || 'inline-flex'}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top: coords.top,
              left: coords.left,
              transform: transformOrigin[side],
            }}
            className="pointer-events-none fixed z-[200] animate-tooltip-in"
          >
            <div className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
              <span>{content}</span>
              {shortcut && (
                <kbd className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-normal text-white/80">
                  {shortcut}
                </kbd>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

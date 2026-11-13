import { initializePaddle, type Paddle, type PaddleEventData } from '@paddle/paddle-js';

export interface PaddleClientConfig {
  clientToken: string;
  environment: 'sandbox' | 'production';
}

let paddlePromise: Promise<Paddle | undefined> | null = null;
const listeners = new Set<(event: PaddleEventData) => void>();

/**
 * Paddle.js를 한 번만 초기화한다.
 * 초기화된 페이지(기본 결제 링크인 /pricing)에 `?_ptxn=` 이 붙어 오면 Paddle.js가 결제창을 자동으로 연다.
 */
export function getPaddle(config: PaddleClientConfig): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token: config.clientToken,
      environment: config.environment,
      checkout: { settings: { displayMode: 'overlay', locale: 'ko', theme: 'light' } },
      eventCallback: (event) => listeners.forEach((fn) => fn(event)),
    }).catch((e) => {
      paddlePromise = null;
      throw e;
    });
  }
  return paddlePromise;
}

/** Paddle 결제창 이벤트 구독. 반환된 함수로 해제 */
export function onPaddleEvent(fn: (event: PaddleEventData) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

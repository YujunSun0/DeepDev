const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  error(message: string, error?: unknown): void {
    if (isDev) {
      console.error(`[Error] ${message}`, error ?? '');
    } else {
      console.error(`[Error] ${message}`, error ?? '');
    }
  },

  warn(message: string, data?: unknown): void {
    if (isDev) {
      console.warn(`[Warn] ${message}`, data ?? '');
    }
  },

  info(message: string, data?: unknown): void {
    if (isDev) {
      console.info(`[Info] ${message}`, data ?? '');
    }
  },
};

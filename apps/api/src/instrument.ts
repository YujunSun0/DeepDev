import * as dotenv from 'dotenv';
import * as path from 'path';

// .env를 가장 먼저 로드 (instrument이 main보다 먼저 실행되므로)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
  enabled: !!process.env.SENTRY_DSN,
});

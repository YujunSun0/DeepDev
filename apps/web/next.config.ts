import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  transpilePackages: ['@deepdev/shared-types'],
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT || 'deepdev-web',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Source map 업로드는 CI에서 SENTRY_AUTH_TOKEN 설정 시에만
});

/** 사이트 URL. SEO(sitemap, robots, og:url)에 사용. 프로덕션 배포 시 NEXT_PUBLIC_SITE_URL 설정 필요 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

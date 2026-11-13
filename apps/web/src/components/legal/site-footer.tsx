import Link from 'next/link';
import { LEGAL_LINKS, SELLER, type LegalLang } from '@/lib/legal';

/** 판매자 정보와 법적 고지 링크를 담은 공개 페이지용 푸터 (Paddle 심사 요건) */
export function SiteFooter({ lang = 'ko' }: { lang?: LegalLang }) {
  const langQuery = lang === 'en' ? '?lang=en' : '';
  const name = lang === 'en' ? SELLER.nameEn : SELLER.nameKo;

  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl space-y-3 px-4 text-center sm:px-6">
        <span className="text-sm font-bold text-gray-800">
          <span className="text-primary-500">Deep</span>Dev
        </span>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`${link.href}${langQuery}`}
              className={`transition hover:text-gray-800 ${
                link.href === '/privacy' ? 'font-semibold text-gray-700' : ''
              }`}
            >
              {link[lang]}
            </Link>
          ))}
          <Link href="/pricing" className="transition hover:text-gray-800">
            {lang === 'en' ? 'Pricing' : '요금제'}
          </Link>
        </nav>
        <p className="text-xs leading-5 text-gray-400">
          {lang === 'en' ? 'Operator' : '운영자'}: {name}
          <span className="mx-1.5">·</span>
          {lang === 'en' ? 'Contact' : '문의'}:{' '}
          <a href={`mailto:${SELLER.email}`} className="hover:text-gray-600">
            {SELLER.email}
          </a>
          {SELLER.phone && (
            <>
              <span className="mx-1.5">·</span>
              {SELLER.phone}
            </>
          )}
        </p>
        <p className="text-xs text-gray-400">
          {lang === 'en'
            ? 'Payments are processed by Paddle.com, our Merchant of Record.'
            : '결제는 판매자(Merchant of Record)인 Paddle.com을 통해 처리됩니다.'}
        </p>
        <p className="text-xs text-gray-400">&copy; 2026 DeepDev. Developer Mastery Platform.</p>
      </div>
    </footer>
  );
}

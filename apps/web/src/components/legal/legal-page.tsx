import Link from 'next/link';
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LINKS,
  type LegalBlock,
  type LegalDoc,
  type LegalLang,
} from '@/lib/legal';
import { SiteFooter } from './site-footer';

export function parseLegalLang(value: string | string[] | undefined): LegalLang {
  return value === 'en' ? 'en' : 'ko';
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="leading-7 text-gray-600">{block.text}</p>;
    case 'ul':
    case 'ol': {
      const ListTag = block.type;
      return (
        <ListTag
          className={`space-y-1.5 pl-5 leading-7 text-gray-600 ${
            block.type === 'ul' ? 'list-disc' : 'list-decimal'
          }`}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {block.head.map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3 align-top leading-6 ${i === 0 ? 'whitespace-nowrap font-medium text-gray-700' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

interface LegalPageProps {
  docs: Record<LegalLang, LegalDoc>;
  lang: LegalLang;
  /** 현재 문서 경로 (예: /terms) */
  path: string;
}

export function LegalPage({ docs, lang, path }: LegalPageProps) {
  const doc = docs[lang];
  const langQuery = lang === 'en' ? '?lang=en' : '';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-extrabold text-gray-900">
            <span className="text-primary-500">Deep</span>Dev
          </Link>
          <div className="flex gap-1 rounded-full bg-gray-100 p-1 text-xs font-medium">
            {(['ko', 'en'] as const).map((l) => (
              <Link
                key={l}
                href={l === 'en' ? `${path}?lang=en` : path}
                className={`rounded-full px-3 py-1 transition ${
                  lang === l ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={lang === l ? 'page' : undefined}
              >
                {l === 'ko' ? '한국어' : 'English'}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-8 flex flex-wrap gap-2 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`${link.href}${langQuery}`}
              className={`rounded-full border px-3 py-1.5 transition ${
                link.href === path
                  ? 'border-primary-200 bg-primary-50 font-semibold text-primary-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {link[lang]}
            </Link>
          ))}
        </nav>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">{doc.title}</h1>
        <p className="mb-8 text-sm text-gray-400">
          {lang === 'ko' ? '시행일: ' : 'Effective date: '}
          {LEGAL_EFFECTIVE_DATE[lang]}
        </p>
        {doc.intro && <p className="mb-10 leading-7 text-gray-600">{doc.intro}</p>}

        <div className="space-y-10">
          {doc.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">{section.heading}</h2>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </div>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}

import type { Metadata } from 'next';
import { LegalPage, parseLegalLang } from '@/components/legal/legal-page';
import { terms } from '@/lib/legal-content/terms';

type Props = { searchParams: Promise<{ lang?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang } = await searchParams;
  const title = terms[parseLegalLang(lang)].title;
  return { title, description: `DeepDev ${title}` };
}

export default async function Page({ searchParams }: Props) {
  const { lang } = await searchParams;
  return <LegalPage docs={terms} lang={parseLegalLang(lang)} path="/terms" />;
}

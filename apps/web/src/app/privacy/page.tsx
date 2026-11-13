import type { Metadata } from 'next';
import { LegalPage, parseLegalLang } from '@/components/legal/legal-page';
import { privacy } from '@/lib/legal-content/privacy';

type Props = { searchParams: Promise<{ lang?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang } = await searchParams;
  const title = privacy[parseLegalLang(lang)].title;
  return { title, description: `DeepDev ${title}` };
}

export default async function Page({ searchParams }: Props) {
  const { lang } = await searchParams;
  return <LegalPage docs={privacy} lang={parseLegalLang(lang)} path="/privacy" />;
}

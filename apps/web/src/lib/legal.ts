/**
 * 법적 고지(약관·개인정보처리방침·환불정책)와 푸터에 표시되는 판매자 정보.
 *
 * ⚠️ Paddle 심사 시 아래 이름은 Paddle 계정(신분증) 이름과 철자까지 정확히 같아야 합니다.
 * 값을 바꾸면 모든 법적 페이지와 푸터에 함께 반영됩니다.
 */
export const SELLER = {
  /** 운영자 실명 (한글) */
  nameKo: '선유준',
  /** 운영자 실명 (영문, 신분증/여권 표기와 동일하게) */
  nameEn: 'Yujun Sun',
  /** 고객 문의 이메일 (환불·개인정보 문의 포함) */
  email: 'yujunsun0@gmail.com',
  /** 고객 문의 전화번호 (Paddle은 이메일+전화 표시를 요구. 비우면 표시하지 않음) */
  phone: '+82 10-8579-6705',
} as const;

export const SERVICE_NAME = 'DeepDev';

/** 문서 시행일. 내용을 개정하면 함께 바꾸고, 이전 버전은 보관해 두세요. */
export const LEGAL_EFFECTIVE_DATE = {
  ko: '2026년 11월 13일',
  en: 'November 13, 2026',
} as const;

export type LegalLang = 'ko' | 'en';

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  intro?: string;
  sections: LegalSection[];
}

export const LEGAL_LINKS = [
  { href: '/terms', ko: '이용약관', en: 'Terms of Service' },
  { href: '/privacy', ko: '개인정보처리방침', en: 'Privacy Policy' },
  { href: '/refund', ko: '환불정책', en: 'Refund Policy' },
] as const;

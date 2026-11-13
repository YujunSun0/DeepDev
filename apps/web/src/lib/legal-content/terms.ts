import { SELLER, SERVICE_NAME, type LegalDoc, type LegalLang } from '@/lib/legal';

/**
 * 이용약관. 공정거래위원회 콘텐츠이용 표준약관의 구성을 참고하고,
 * Paddle(Merchant of Record) 고지 문구와 AI 생성 콘텐츠 관련 조항을 추가함.
 */
export const terms: Record<LegalLang, LegalDoc> = {
  ko: {
    title: '이용약관',
    sections: [
      {
        heading: '제1조 (목적)',
        blocks: [
          {
            type: 'p',
            text: `이 약관은 ${SELLER.nameKo}(이하 "운영자")가 제공하는 ${SERVICE_NAME} 서비스(이하 "서비스")의 이용과 관련하여 운영자와 회원 간의 권리, 의무 및 책임사항, 그 밖에 필요한 사항을 정하는 것을 목적으로 합니다.`,
          },
        ],
      },
      {
        heading: '제2조 (정의)',
        blocks: [
          {
            type: 'ol',
            items: [
              '"서비스"란 운영자가 웹사이트를 통해 제공하는 AI 기반 개발 개념 학습, 문제 풀이, 숙련도 측정, 탐구(자유 질문) 기능 등 일체를 말합니다.',
              '"회원"이란 이 약관에 동의하고 계정을 생성하여 서비스를 이용하는 자를 말합니다.',
              '"유료 서비스"란 회원이 대금을 지불하고 이용하는 Pro 등 구독 플랜을 말합니다.',
              '"AI 생성 콘텐츠"란 서비스가 인공지능 모델을 이용하여 생성한 설명, 문제, 평가, 피드백 등을 말합니다.',
            ],
          },
        ],
      },
      {
        heading: '제3조 (약관의 게시와 개정)',
        blocks: [
          {
            type: 'ol',
            items: [
              '운영자는 이 약관의 내용과 운영자 정보, 연락처를 회원이 쉽게 알 수 있도록 서비스 화면에 게시합니다.',
              '운영자는 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시 시행일과 개정 사유를 시행일 7일 전(회원에게 불리한 변경은 30일 전)부터 서비스 내에 공지합니다.',
              '회원이 개정 약관에 동의하지 않는 경우 이용계약을 해지할 수 있으며, 시행일 이후에도 서비스를 계속 이용하면 개정 약관에 동의한 것으로 봅니다.',
            ],
          },
        ],
      },
      {
        heading: '제4조 (회원가입 및 계정)',
        blocks: [
          {
            type: 'ol',
            items: [
              '회원가입은 이메일 또는 Google·GitHub 계정 연동으로 할 수 있으며, 가입 시 이 약관과 개인정보처리방침에 동의해야 합니다.',
              '만 14세 미만은 서비스에 가입할 수 없습니다.',
              '회원은 정확한 정보를 제공해야 하며, 계정과 비밀번호를 스스로 관리할 책임이 있습니다. 계정 도용을 알게 된 경우 즉시 운영자에게 알려야 합니다.',
            ],
          },
        ],
      },
      {
        heading: '제5조 (회원 탈퇴)',
        blocks: [
          {
            type: 'ol',
            items: [
              '회원은 설정 화면에서 언제든지 탈퇴할 수 있습니다.',
              '탈퇴 시 계정은 즉시 비활성화되며, 학습 기록 등 데이터는 개인정보처리방침에 정한 기간 동안 보관된 후 파기됩니다.',
              '부정 이용 방지를 위해 탈퇴한 이메일로는 다시 가입할 수 없습니다. 탈퇴 전 이 점을 확인해 주세요.',
              '이용 중인 유료 구독이 있다면 탈퇴 전에 구독을 해지해야 다음 결제가 발생하지 않습니다.',
            ],
          },
        ],
      },
      {
        heading: '제6조 (서비스의 제공 및 변경)',
        blocks: [
          {
            type: 'ol',
            items: [
              '서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·장애·외부 서비스(AI 모델 제공자, 호스팅 등) 장애 시 일시 중단될 수 있습니다.',
              '플랜별 이용 한도(월 세션 수, 토큰 사용량, 탐구 횟수 등)는 요금제 페이지에 게시된 내용을 따릅니다.',
              '운영자는 서비스 개선을 위해 기능을 추가·변경할 수 있으며, 유료 서비스의 주요 내용을 회원에게 불리하게 변경하는 경우 30일 전에 공지합니다.',
            ],
          },
        ],
      },
      {
        heading: '제7조 (유료 서비스와 결제)',
        blocks: [
          {
            type: 'p',
            text: '유료 서비스의 주문 절차는 온라인 리셀러인 Paddle.com이 진행합니다. Paddle.com은 모든 주문의 판매자(Merchant of Record)이며, 결제·세금 처리·영수증 발급과 결제 관련 고객 문의 및 환불을 처리합니다. 결제에는 Paddle의 구매자 약관(Buyer Terms)이 함께 적용됩니다.',
          },
          {
            type: 'ol',
            items: [
              '유료 플랜은 1개월 단위 정기결제이며, 회원이 해지하기 전까지 매월 같은 날짜에 자동으로 갱신·결제됩니다.',
              '가격은 요금제 페이지와 결제 화면에 표시되며, 거주 국가에 따라 부가가치세 등 세금이 포함되거나 별도로 표시될 수 있습니다.',
              '회원은 결제 관리 화면에서 언제든지 구독을 해지할 수 있으며, 해지 후에도 이미 결제한 기간이 끝날 때까지 유료 기능을 이용할 수 있습니다.',
              '청약철회 및 환불은 환불정책에 따릅니다.',
              '운영자가 가격을 변경하는 경우 최소 30일 전에 알리며, 변경된 가격은 공지 이후 다음 갱신일부터 적용됩니다.',
            ],
          },
        ],
      },
      {
        heading: '제8조 (AI 생성 콘텐츠)',
        blocks: [
          {
            type: 'ol',
            items: [
              'AI 생성 콘텐츠는 학습 보조를 위한 것으로, 부정확하거나 최신이 아닌 내용이 포함될 수 있습니다. 실무 적용이나 중요한 판단 전에는 공식 문서 등으로 확인하시기 바랍니다.',
              '숙련도 점수와 평가는 서비스 내 학습 활동을 바탕으로 한 참고 지표이며, 공인된 자격이나 능력을 보증하지 않습니다.',
              '부정확하거나 부적절한 답변을 발견하면 고객 문의 이메일로 신고할 수 있으며, 운영자는 이를 검토하여 개선합니다.',
            ],
          },
        ],
      },
      {
        heading: '제9조 (회원의 의무)',
        blocks: [
          {
            type: 'p',
            text: '회원은 다음 행위를 해서는 안 됩니다.',
          },
          {
            type: 'ul',
            items: [
              '타인의 정보 도용 또는 계정의 공유·양도·판매',
              '자동화 도구 등을 이용한 비정상적인 대량 요청, 이용 한도 우회',
              '서비스의 AI 기능을 이용해 불법적이거나 타인의 권리를 침해하는 콘텐츠를 생성하려는 행위',
              '서비스의 소스코드, 프롬프트, 문제 데이터 등을 무단으로 추출·복제·재판매하는 행위',
              '서비스 운영을 방해하거나 보안을 위협하는 행위',
            ],
          },
        ],
      },
      {
        heading: '제10조 (이용 제한)',
        blocks: [
          {
            type: 'p',
            text: '운영자는 회원이 제9조를 위반한 경우 사전 통지 후 서비스 이용을 제한하거나 계정을 정지할 수 있습니다. 다만 긴급한 보안 위협이 있는 경우에는 먼저 제한한 뒤 통지할 수 있습니다. 회원은 이용 제한에 대해 고객 문의 이메일로 이의를 제기할 수 있습니다.',
          },
        ],
      },
      {
        heading: '제11조 (지식재산권)',
        blocks: [
          {
            type: 'ol',
            items: [
              '서비스와 서비스가 제공하는 커리큘럼, 문제, 디자인 등에 대한 권리는 운영자에게 있습니다.',
              '회원이 서비스에 입력한 답변과 질문의 권리는 회원에게 있습니다. 회원은 운영자가 서비스 제공(평가, 학습 기록 표시 등)에 필요한 범위에서 이를 처리하는 것을 허락합니다.',
              '회원은 서비스에서 받은 AI 생성 콘텐츠를 개인 학습 목적으로 자유롭게 이용할 수 있습니다.',
            ],
          },
        ],
      },
      {
        heading: '제12조 (책임의 제한)',
        blocks: [
          {
            type: 'ol',
            items: [
              '운영자는 천재지변, 외부 서비스 장애 등 운영자의 귀책사유 없이 발생한 서비스 중단에 대해 책임지지 않습니다.',
              '운영자는 AI 생성 콘텐츠를 회원이 활용하여 발생한 결과에 대해 운영자의 고의 또는 중대한 과실이 없는 한 책임지지 않습니다.',
              '운영자의 귀책사유로 유료 서비스를 이용하지 못한 경우, 운영자는 환불정책에 따라 이용하지 못한 기간에 해당하는 금액을 환불하거나 이용 기간을 연장합니다.',
            ],
          },
        ],
      },
      {
        heading: '제13조 (준거법 및 분쟁 해결)',
        blocks: [
          {
            type: 'p',
            text: '이 약관은 대한민국 법률에 따라 해석됩니다. 서비스 이용과 관련한 분쟁은 먼저 고객 문의를 통해 협의하며, 협의가 이루어지지 않으면 민사소송법상 관할 법원에 소를 제기할 수 있습니다. 회원은 한국소비자원 등 분쟁조정기관에 조정을 신청할 수도 있습니다.',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Purpose',
        blocks: [
          {
            type: 'p',
            text: `These Terms govern your use of ${SERVICE_NAME} (the "Service"), operated by ${SELLER.nameEn} (the "Operator"). By creating an account or using the Service, you agree to these Terms.`,
          },
        ],
      },
      {
        heading: '2. Definitions',
        blocks: [
          {
            type: 'ul',
            items: [
              '"Service" means the AI-powered developer learning platform provided through our website, including concept lessons, practice questions, mastery tracking and the Explore (free-form question) feature.',
              '"Member" means a person who has agreed to these Terms and created an account.',
              '"Paid Plan" means a subscription plan such as Pro that requires payment.',
              '"AI-generated content" means explanations, questions, evaluations and feedback generated by AI models within the Service.',
            ],
          },
        ],
      },
      {
        heading: '3. Changes to these Terms',
        blocks: [
          {
            type: 'p',
            text: 'We may update these Terms in accordance with applicable law. We will post the changes and their effective date in the Service at least 7 days in advance (30 days for changes that are unfavorable to you). If you do not agree, you may close your account; continued use after the effective date means you accept the updated Terms.',
          },
        ],
      },
      {
        heading: '4. Accounts',
        blocks: [
          {
            type: 'ul',
            items: [
              'You can sign up with email or with a Google or GitHub account. You must agree to these Terms and our Privacy Policy.',
              'You must be at least 14 years old to use the Service.',
              'You are responsible for keeping your credentials secure and must notify us promptly of any unauthorized use.',
            ],
          },
        ],
      },
      {
        heading: '5. Account deletion',
        blocks: [
          {
            type: 'ul',
            items: [
              'You may delete your account at any time from the Settings page.',
              'Your account is deactivated immediately, and your data is retained for the period stated in our Privacy Policy before being permanently deleted.',
              'To prevent abuse, an email address used for a deleted account cannot be used to sign up again.',
              'Please cancel any active subscription before deleting your account to avoid further charges.',
            ],
          },
        ],
      },
      {
        heading: '6. The Service',
        blocks: [
          {
            type: 'ul',
            items: [
              'We aim to provide the Service 24/7, but it may be interrupted for maintenance or because of outages at our providers (such as AI model or hosting providers).',
              'Usage limits for each plan (monthly sessions, tokens, explorations, etc.) are shown on our Pricing page.',
              'We may add or change features. We will give 30 days\' notice before making material changes to a Paid Plan that are unfavorable to you.',
            ],
          },
        ],
      },
      {
        heading: '7. Payments and subscriptions',
        blocks: [
          {
            type: 'p',
            text: 'Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns. Paddle\'s Buyer Terms also apply to your purchase.',
          },
          {
            type: 'ul',
            items: [
              'Paid Plans are billed monthly and renew automatically on the same day each month until you cancel.',
              'Prices are shown on the Pricing page and at checkout. Depending on your country, sales tax or VAT may be included or added at checkout.',
              'You can cancel at any time from the Billing page. After cancellation you keep access to paid features until the end of the period you have already paid for.',
              'Refunds are handled according to our Refund Policy.',
              'We will notify you at least 30 days before any price change, which will apply from your next renewal after the notice.',
            ],
          },
        ],
      },
      {
        heading: '8. AI-generated content',
        blocks: [
          {
            type: 'ul',
            items: [
              'AI-generated content is provided to support learning and may be inaccurate or out of date. Please verify important information against official documentation.',
              'Mastery scores are learning indicators based on your activity in the Service and are not a certification of skill.',
              'You can report inaccurate or inappropriate answers to our support email, and we will review them.',
            ],
          },
        ],
      },
      {
        heading: '9. Acceptable use',
        blocks: [
          {
            type: 'p',
            text: 'You must not:',
          },
          {
            type: 'ul',
            items: [
              'use another person\'s identity, or share, transfer or sell your account;',
              'send abnormal volumes of automated requests or circumvent usage limits;',
              'use the AI features to generate unlawful content or content that infringes others\' rights;',
              'extract, copy or resell the Service\'s source code, prompts or question data without permission;',
              'interfere with the operation or security of the Service.',
            ],
          },
        ],
      },
      {
        heading: '10. Suspension',
        blocks: [
          {
            type: 'p',
            text: 'If you breach Section 9, we may restrict or suspend your account after giving notice, or before notice in the case of an urgent security threat. You may appeal by contacting our support email.',
          },
        ],
      },
      {
        heading: '11. Intellectual property',
        blocks: [
          {
            type: 'ul',
            items: [
              'The Service, including its curriculum, questions and design, belongs to the Operator.',
              'You own the answers and questions you submit. You allow us to process them as needed to provide the Service (for example, evaluation and showing your learning history).',
              'You may freely use AI-generated content you receive for your personal learning.',
            ],
          },
        ],
      },
      {
        heading: '12. Limitation of liability',
        blocks: [
          {
            type: 'ul',
            items: [
              'We are not liable for interruptions caused by events beyond our reasonable control, such as natural disasters or third-party outages.',
              'Except in cases of our intentional misconduct or gross negligence, we are not liable for outcomes resulting from your use of AI-generated content.',
              'If you cannot use a Paid Plan due to our fault, we will refund or extend the affected period in accordance with our Refund Policy.',
            ],
          },
        ],
      },
      {
        heading: '13. Governing law',
        blocks: [
          {
            type: 'p',
            text: 'These Terms are governed by the laws of the Republic of Korea. We will first try to resolve any dispute through our support channel. Nothing in these Terms limits any rights you have under the consumer protection laws of your country of residence.',
          },
        ],
      },
    ],
  },
};

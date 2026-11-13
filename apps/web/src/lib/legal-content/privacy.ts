import { SELLER, SERVICE_NAME, type LegalDoc, type LegalLang } from '@/lib/legal';

/**
 * 개인정보처리방침. 개인정보보호위원회 「개인정보 처리방침 작성지침」(2026.4 개정, 생성형 AI 부록 포함)의
 * 필수 기재사항 순서를 따름. 수집 항목·처리 위탁·국외 이전은 실제 코드 기준으로 작성:
 * - DB(users, sessions, explorations 등), Vercel Analytics, Sentry, Resend, OpenAI, Paddle, Google/GitHub OAuth
 * 외부 서비스를 추가·변경하면 이 문서도 함께 수정해야 합니다.
 */

const contactKo = [
  `성명: ${SELLER.nameKo} (운영자 겸 개인정보 보호책임자)`,
  `이메일: ${SELLER.email}`,
  ...(SELLER.phone ? [`전화: ${SELLER.phone}`] : []),
];

const contactEn = [
  `Name: ${SELLER.nameEn} (Operator and Privacy Officer)`,
  `Email: ${SELLER.email}`,
  ...(SELLER.phone ? [`Phone: ${SELLER.phone}`] : []),
];

export const privacy: Record<LegalLang, LegalDoc> = {
  ko: {
    title: '개인정보처리방침',
    intro: `${SELLER.nameKo}(이하 "운영자")는 ${SERVICE_NAME} 서비스를 제공하면서 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.`,
    sections: [
      {
        heading: '1. 개인정보의 처리 목적',
        blocks: [
          {
            type: 'ul',
            items: [
              '회원 가입 및 관리: 본인 확인, 이메일 인증, 소셜 로그인 연동, 부정 이용 및 재가입 방지',
              '학습 서비스 제공: AI 기반 개념 설명·문제 출제·답변 평가, 숙련도 및 학습 기록 관리, 업적·출석 기록',
              '유료 서비스 제공: 구독 상태 확인, 이용 한도 관리, 결제·환불 처리 연동',
              '서비스 운영 및 개선: 오류 분석, 이용 통계, 보안 및 부정 이용 탐지',
              '고객 문의 대응 및 중요 안내(약관 변경, 결제 관련 안내 등)',
            ],
          },
        ],
      },
      {
        heading: '2. 처리하는 개인정보 항목',
        blocks: [
          {
            type: 'table',
            head: ['구분', '항목'],
            rows: [
              ['이메일 회원가입', '(필수) 이메일, 비밀번호(암호화 저장) / (선택) 이름'],
              ['소셜 로그인', '(필수) 이메일, 소셜 계정 고유 식별자 / (선택) 이름, 프로필 이미지 — Google 또는 GitHub에서 제공받음'],
              ['서비스 이용 과정', '선호 언어, 학습 세션 기록, 이용자가 입력한 답변·질문(프롬프트), AI가 생성한 설명·평가 결과, 숙련도 점수, 업적, 출석일, 토큰 사용량'],
              ['유료 서비스', '플랜 종류, 구독 상태, Paddle 고객·구독 식별자 (카드번호 등 결제수단 정보는 운영자가 저장하지 않으며 Paddle이 직접 처리)'],
              ['자동 수집', '접속 IP, 접속 일시, 요청 기록, 브라우저·기기 정보, 오류 정보, 페이지 방문 통계'],
            ],
          },
          {
            type: 'p',
            text: '서비스는 로그인 상태 유지와 화면 설정 저장을 위해 브라우저 저장소(localStorage)를 사용합니다. 방문 통계에는 쿠키를 사용하지 않는 Vercel Analytics를 사용합니다.',
          },
        ],
      },
      {
        heading: '3. 개인정보의 보유 및 이용 기간',
        blocks: [
          {
            type: 'ul',
            items: [
              '회원 정보 및 학습 기록: 회원 탈퇴 시까지',
              '탈퇴 회원 정보: 부정 재가입 방지 및 분쟁 대응을 위해 탈퇴일로부터 1년간 보관 후 파기',
              '접속 기록(IP, 접속 일시): 「통신비밀보호법」에 따라 3개월',
              '계약·청약철회 및 대금결제·재화 공급에 관한 기록: 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 5년',
              '소비자 불만 또는 분쟁 처리에 관한 기록: 같은 법률에 따라 3년',
            ],
          },
        ],
      },
      {
        heading: '4. 개인정보의 파기 절차 및 방법',
        blocks: [
          {
            type: 'p',
            text: '보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구할 수 없는 방법으로 삭제하며, 법령에 따라 보관해야 하는 정보는 다른 정보와 분리하여 보관합니다.',
          },
        ],
      },
      {
        heading: '5. 개인정보의 제3자 제공',
        blocks: [
          {
            type: 'p',
            text: '운영자는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있거나 수사기관이 적법한 절차에 따라 요청하는 경우에는 예외로 합니다.',
          },
        ],
      },
      {
        heading: '6. 개인정보 처리의 위탁 및 국외 이전',
        blocks: [
          {
            type: 'p',
            text: '운영자는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고 있으며, 수탁자의 서버가 해외에 있어 개인정보가 국외로 이전됩니다. 이는 「개인정보 보호법」 제28조의8 제1항 제3호에 따라 계약의 이행을 위해 필요한 위탁·보관으로서 이 방침에 공개합니다. 이전은 서비스 이용 시 네트워크를 통해 수시로 이루어집니다.',
          },
          {
            type: 'table',
            head: ['수탁자 (국가)', '위탁 업무', '이전 항목', '보유 기간'],
            rows: [
              ['OpenAI, L.L.C. (미국)', 'AI 설명 생성, 문제 출제, 답변 평가', '이용자가 입력한 답변·질문, 학습 맥락 (이름·이메일은 전송하지 않음)', 'API 처리 후 남용 감시 목적 최대 30일 보관 후 삭제'],
              ['Paddle.com Market Ltd (영국)', '결제 처리, 구독 관리, 세금 계산, 영수증 발급, 환불', '이메일, 이름, 결제 정보, 국가', 'Paddle 정책 및 관계 법령에 따름'],
              ['Railway Corp. (미국)', 'API 서버 및 데이터베이스 호스팅', '서비스 이용 과정에서 처리하는 전체 항목', '위탁 계약 종료 시까지'],
              ['Vercel Inc. (미국)', '웹사이트 호스팅, 방문 통계', '접속 기록, 브라우저·기기 정보', '위탁 계약 종료 시까지'],
              ['Resend, Inc. (미국)', '인증 메일 발송', '이메일 주소', '발송 기록 보관 기간 동안'],
              ['Functional Software, Inc. (Sentry, 미국)', '오류 모니터링', '오류 정보, 브라우저 정보, 접속 IP', 'Sentry 보관 정책에 따름'],
            ],
          },
          {
            type: 'p',
            text: '국외 이전을 원하지 않는 경우 회원 탈퇴로 이전을 중단할 수 있습니다. 다만 위 업무는 서비스 제공에 꼭 필요하므로 이전을 거부하면 서비스를 이용할 수 없습니다.',
          },
        ],
      },
      {
        heading: '7. 생성형 AI 기능에 관한 사항',
        blocks: [
          {
            type: 'ul',
            items: [
              '이용 목적: 서비스는 개발 개념 학습을 돕기 위해 AI 모델로 개념 설명, 문제, 평가와 피드백을 생성합니다.',
              '입력·생성 정보의 저장: 이용자가 입력한 답변·질문과 AI가 생성한 결과는 학습 기록 제공을 위해 회원 탈퇴 시까지 저장됩니다.',
              'AI 학습 활용: 운영자는 이용자의 입력 정보를 AI 모델 학습에 사용하지 않습니다. OpenAI 역시 API로 전달된 데이터를 기본적으로 모델 학습에 사용하지 않습니다.',
              '주의 사항: 답변이나 질문에 개인정보, 비밀번호, 회사 기밀 등 민감한 정보를 입력하지 마세요.',
              '부적절한 답변 신고: 부정확하거나 부적절한 AI 답변은 아래 고객 문의 이메일로 신고할 수 있습니다.',
            ],
          },
        ],
      },
      {
        heading: '8. 정보주체의 권리와 행사 방법',
        blocks: [
          {
            type: 'p',
            text: '이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요구하거나 동의를 철회할 수 있습니다. 이름 등은 설정 화면에서 직접 수정할 수 있고, 회원 탈퇴는 설정 화면에서 할 수 있습니다. 그 밖의 요청은 아래 연락처로 보내 주시면 지체 없이 조치합니다.',
          },
        ],
      },
      {
        heading: '9. 개인정보의 안전성 확보 조치',
        blocks: [
          {
            type: 'ul',
            items: [
              '비밀번호의 단방향 암호화(bcrypt) 저장',
              '전 구간 HTTPS 암호화 통신',
              '접근 권한 최소화 및 인증 토큰을 통한 접근 통제',
              '요청 횟수 제한 등 비정상 접근 차단',
              '비밀 키 등 중요 정보의 분리 보관',
            ],
          },
        ],
      },
      {
        heading: '10. 만 14세 미만 아동',
        blocks: [
          {
            type: 'p',
            text: '서비스는 만 14세 미만 아동의 회원가입을 받지 않으며, 아동의 개인정보를 수집하지 않습니다.',
          },
        ],
      },
      {
        heading: '11. 개인정보 보호책임자 및 고충 처리',
        blocks: [
          { type: 'ul', items: contactKo },
          {
            type: 'p',
            text: '개인정보 침해에 대한 신고나 상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번없이 118), 개인정보분쟁조정위원회(kopico.go.kr, 1833-6972), 대검찰청(spo.go.kr, 국번없이 1301), 경찰청(ecrm.police.go.kr, 국번없이 182)에도 할 수 있습니다.',
          },
        ],
      },
      {
        heading: '12. 개인정보처리방침의 변경',
        blocks: [
          {
            type: 'p',
            text: '이 방침의 내용이 변경되는 경우 시행 7일 전부터 서비스 내 공지를 통해 알립니다. 수집 항목이나 이용 목적의 중요한 변경이 있는 경우에는 30일 전에 알립니다.',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    intro: `This Privacy Policy explains how ${SELLER.nameEn} (the "Operator", "we") collects and uses personal information when you use ${SERVICE_NAME}. We process personal information in accordance with the Personal Information Protection Act of the Republic of Korea and other applicable laws.`,
    sections: [
      {
        heading: '1. Why we process your information',
        blocks: [
          {
            type: 'ul',
            items: [
              'Account management: identification, email verification, social login, and preventing abuse and re-registration of deleted accounts',
              'Learning features: AI-generated explanations, questions and evaluations, mastery and history tracking, achievements and attendance',
              'Paid plans: checking subscription status, usage limits, and payment and refund processing',
              'Operating and improving the Service: error analysis, usage statistics, security and fraud detection',
              'Responding to inquiries and sending important notices (e.g., changes to terms, billing notices)',
            ],
          },
        ],
      },
      {
        heading: '2. Information we collect',
        blocks: [
          {
            type: 'table',
            head: ['Category', 'Items'],
            rows: [
              ['Email sign-up', '(Required) email, password (stored hashed) / (Optional) name'],
              ['Social login', '(Required) email, social account identifier / (Optional) name, profile image — provided by Google or GitHub'],
              ['Using the Service', 'Preferred language, learning sessions, answers and questions you enter (prompts), AI-generated explanations and evaluations, mastery scores, achievements, attendance, token usage'],
              ['Paid plans', 'Plan type, subscription status, Paddle customer and subscription IDs (we do not store card details; Paddle processes them directly)'],
              ['Collected automatically', 'IP address, access time, request logs, browser and device information, error data, page view statistics'],
            ],
          },
          {
            type: 'p',
            text: 'We use your browser\'s local storage to keep you signed in and remember display settings. For page statistics we use Vercel Analytics, which does not use cookies.',
          },
        ],
      },
      {
        heading: '3. Retention',
        blocks: [
          {
            type: 'ul',
            items: [
              'Account information and learning history: until you delete your account',
              'Deleted accounts: kept for 1 year after deletion to prevent abuse and handle disputes, then permanently deleted',
              'Access logs (IP, access time): 3 months',
              'Records of contracts, withdrawals, payments and delivery: 5 years, as required by Korean e-commerce law',
              'Records of consumer complaints and disputes: 3 years, as required by the same law',
            ],
          },
        ],
      },
      {
        heading: '4. Deletion',
        blocks: [
          {
            type: 'p',
            text: 'When the retention period ends or the purpose is fulfilled, we delete personal information without delay in a way that cannot be recovered. Information we must keep by law is stored separately.',
          },
        ],
      },
      {
        heading: '5. Sharing with third parties',
        blocks: [
          {
            type: 'p',
            text: 'We do not sell or share your personal information with third parties, except where required by law or by a lawful request from authorities.',
          },
        ],
      },
      {
        heading: '6. Service providers and international transfers',
        blocks: [
          {
            type: 'p',
            text: 'We use the following service providers to run the Service. Because their servers are located outside Korea, your information is transferred internationally over the network whenever you use the Service. These transfers are necessary to perform our contract with you.',
          },
          {
            type: 'table',
            head: ['Provider (country)', 'Purpose', 'Data', 'Retention'],
            rows: [
              ['OpenAI, L.L.C. (USA)', 'Generating explanations, questions and evaluations', 'Answers and questions you enter, learning context (no name or email)', 'Up to 30 days for abuse monitoring, then deleted'],
              ['Paddle.com Market Ltd (UK)', 'Payments, subscriptions, tax, receipts and refunds', 'Email, name, payment details, country', 'Per Paddle\'s policy and applicable law'],
              ['Railway Corp. (USA)', 'API server and database hosting', 'All data processed by the Service', 'Until the end of the service contract'],
              ['Vercel Inc. (USA)', 'Website hosting, page statistics', 'Access logs, browser and device information', 'Until the end of the service contract'],
              ['Resend, Inc. (USA)', 'Sending verification emails', 'Email address', 'For the provider\'s log retention period'],
              ['Functional Software, Inc. (Sentry, USA)', 'Error monitoring', 'Error data, browser information, IP address', "Per Sentry's retention policy"],
            ],
          },
          {
            type: 'p',
            text: 'If you do not want your information transferred, you can stop the transfer by deleting your account. These providers are essential to the Service, so it cannot be used without them.',
          },
        ],
      },
      {
        heading: '7. Generative AI features',
        blocks: [
          {
            type: 'ul',
            items: [
              'The Service uses AI models to generate explanations, questions, evaluations and feedback to help you learn programming concepts.',
              'Your inputs and the AI outputs are stored until you delete your account so we can show your learning history.',
              'We do not use your inputs to train AI models. OpenAI does not use data sent through its API for training by default.',
              'Please do not enter personal data, passwords or confidential information in your answers or questions.',
              'You can report inaccurate or inappropriate AI answers to the support email below.',
            ],
          },
        ],
      },
      {
        heading: '8. Your rights',
        blocks: [
          {
            type: 'p',
            text: 'You may request access to, correction or deletion of your personal information, ask us to stop processing it, or withdraw consent at any time. You can edit your profile and delete your account from the Settings page. For other requests, contact us below and we will respond without delay.',
          },
        ],
      },
      {
        heading: '9. Security',
        blocks: [
          {
            type: 'ul',
            items: [
              'Passwords stored with one-way hashing (bcrypt)',
              'HTTPS encryption for all traffic',
              'Least-privilege access and token-based authentication',
              'Rate limiting to block abnormal access',
              'Secrets stored separately from application code',
            ],
          },
        ],
      },
      {
        heading: '10. Children',
        blocks: [
          {
            type: 'p',
            text: 'The Service is not intended for children under 14, and we do not knowingly collect their personal information.',
          },
        ],
      },
      {
        heading: '11. Contact',
        blocks: [{ type: 'ul', items: contactEn }],
      },
      {
        heading: '12. Changes to this policy',
        blocks: [
          {
            type: 'p',
            text: 'We will announce changes to this policy in the Service at least 7 days before they take effect, or 30 days in advance for material changes.',
          },
        ],
      },
    ],
  },
};

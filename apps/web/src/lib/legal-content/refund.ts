import { SELLER, type LegalDoc, type LegalLang } from '@/lib/legal';

/**
 * 환불정책. 전자상거래법 제17조(청약철회 7일), 제18조(3영업일 내 환급)와
 * 디지털콘텐츠 이용 개시 후 철회 제한의 사전 고지 요건을 반영.
 * 전액 환불 시 즉시 FREE 전환 + 구독 해지는 billing webhook 처리(order_refunded 등)와 일치해야 함.
 */
export const refund: Record<LegalLang, LegalDoc> = {
  ko: {
    title: '환불정책',
    intro: '유료 플랜의 결제와 환불은 판매자(Merchant of Record)인 Paddle.com을 통해 처리됩니다. 아래 기준에 따라 환불을 요청할 수 있습니다.',
    sections: [
      {
        heading: '1. 구독 해지',
        blocks: [
          {
            type: 'ul',
            items: [
              '결제 관리 화면에서 언제든지 구독을 해지할 수 있으며, 해지 절차는 가입 절차보다 복잡하지 않습니다.',
              '해지하면 다음 결제일부터 요금이 청구되지 않습니다.',
              '이미 결제한 기간이 끝날 때까지는 유료 기능을 계속 이용할 수 있습니다.',
            ],
          },
        ],
      },
      {
        heading: '2. 청약철회 (전액 환불)',
        blocks: [
          {
            type: 'ul',
            items: [
              '첫 결제: 결제일로부터 7일 이내에 요청하면 이용 여부와 관계없이 전액 환불합니다.',
              '자동 갱신 결제: 갱신 결제일로부터 7일 이내에 요청하고, 갱신 이후 유료 기능(학습 세션·탐구)을 이용하지 않은 경우 전액 환불합니다.',
            ],
          },
        ],
      },
      {
        heading: '3. 환불이 제한되는 경우',
        blocks: [
          {
            type: 'p',
            text: '유료 플랜은 결제 즉시 제공이 시작되는 디지털 서비스입니다. 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라, 다음의 경우에는 청약철회가 제한될 수 있음을 미리 알려 드립니다.',
          },
          {
            type: 'ul',
            items: [
              '자동 갱신 결제 후 유료 기능을 이미 이용한 경우',
              '결제일로부터 7일이 지난 경우',
              '해지 후 남은 이용 기간에 대한 일할 환불 (해지 시 남은 기간 동안 계속 이용할 수 있으므로 별도로 환불하지 않습니다)',
            ],
          },
          {
            type: 'p',
            text: '다만 결제 오류, 중복 결제, 서비스 장애 등 운영자의 귀책사유로 유료 기능을 이용하지 못한 경우에는 기간과 관계없이 해당 금액을 환불하거나 이용 기간을 연장합니다.',
          },
        ],
      },
      {
        heading: '4. 환불 요청 방법',
        blocks: [
          {
            type: 'ol',
            items: [
              `${SELLER.email}로 가입 이메일과 환불 사유를 보내 주세요. Paddle 결제 영수증 이메일의 안내를 통해 Paddle에 직접 요청할 수도 있습니다.`,
              '요청을 확인한 날로부터 3영업일 이내에 Paddle을 통해 환불을 진행합니다.',
              '환불 금액은 결제한 수단으로 돌아가며, 카드사·결제수단에 따라 실제 반영까지 추가로 며칠이 걸릴 수 있습니다.',
            ],
          },
        ],
      },
      {
        heading: '5. 환불 후 계정 상태',
        blocks: [
          {
            type: 'p',
            text: '전액 환불이 완료되면 구독이 해지되고 계정은 즉시 무료(Free) 플랜으로 전환됩니다. 학습 기록은 그대로 유지되며, 언제든 다시 구독할 수 있습니다.',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Refund Policy',
    intro: 'Payments and refunds for paid plans are processed by Paddle.com, our Merchant of Record. You can request a refund under the conditions below.',
    sections: [
      {
        heading: '1. Cancelling your subscription',
        blocks: [
          {
            type: 'ul',
            items: [
              'You can cancel at any time from the Billing page.',
              'Once cancelled, you will not be charged on your next billing date.',
              'You keep access to paid features until the end of the period you have already paid for.',
            ],
          },
        ],
      },
      {
        heading: '2. Full refunds',
        blocks: [
          {
            type: 'ul',
            items: [
              'First payment: request within 7 days of payment for a full refund, regardless of usage.',
              'Renewal payments: request within 7 days of the renewal date for a full refund, provided you have not used paid features (learning sessions or explorations) since the renewal.',
            ],
          },
        ],
      },
      {
        heading: '3. When refunds are not available',
        blocks: [
          {
            type: 'p',
            text: 'Paid plans are digital services that start immediately after payment. Refunds may not be available in the following cases:',
          },
          {
            type: 'ul',
            items: [
              'You have already used paid features after a renewal payment.',
              'More than 7 days have passed since the payment.',
              'Pro-rated refunds for the remaining period after cancellation (you keep access until the end of the paid period instead).',
            ],
          },
          {
            type: 'p',
            text: 'If you could not use paid features because of our fault, such as a billing error, duplicate charge or service outage, we will refund the affected amount or extend your subscription regardless of these limits. This policy does not limit any rights you have under the consumer laws of your country.',
          },
        ],
      },
      {
        heading: '4. How to request a refund',
        blocks: [
          {
            type: 'ol',
            items: [
              `Email ${SELLER.email} with your account email and the reason. You can also contact Paddle directly using the link in your Paddle receipt email.`,
              'We will process the refund through Paddle within 3 business days of confirming your request.',
              'The refund goes back to your original payment method. Depending on your bank or card issuer, it may take a few more days to appear.',
            ],
          },
        ],
      },
      {
        heading: '5. After a refund',
        blocks: [
          {
            type: 'p',
            text: 'When a full refund is completed, your subscription is cancelled and your account moves to the Free plan immediately. Your learning history is kept, and you can subscribe again at any time.',
          },
        ],
      },
    ],
  },
};

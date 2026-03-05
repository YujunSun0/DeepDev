import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private from: string;
  private siteUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.from = this.config.get<string>('EMAIL_FROM', 'DeepDev <onboarding@resend.dev>');
    this.siteUrl = this.config.get<string>('SITE_URL', 'http://localhost:3000');
  }

  get enabled(): boolean {
    return !!this.resend;
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!this.resend) return;

    const verifyUrl = `${this.siteUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: '[DeepDev] 이메일 인증을 완료해주세요',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #333;">DeepDev 이메일 인증</h2>
          <p style="color: #666; line-height: 1.6;">
            아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
          </p>
          <p style="margin: 24px 0;">
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              이메일 인증하기
            </a>
          </p>
          <p style="color: #999; font-size: 12px;">
            링크가 동작하지 않으면 아래 주소를 복사하여 브라우저에 붙여넣으세요.<br/>
            <a href="${verifyUrl}" style="color: #6366f1;">${verifyUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            이 메일을 요청하지 않으셨다면 무시해주세요.
          </p>
        </div>
      `,
    });
  }
}

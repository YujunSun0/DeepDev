import { Controller, Post, Body, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterRequestDto, LoginRequestDto, ResendVerificationDto, ConfirmOAuthLinkDto } from './dto';
import type { GoogleProfile } from './strategies/google.strategy';
import type { GithubProfile } from './strategies/github.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterRequestDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Guard가 Google 로그인 페이지로 리다이렉트
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request & { user?: GoogleProfile }, @Res() res: Response) {
    return this.handleOAuthCallback(req.user, res);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // Guard가 GitHub 로그인 페이지로 리다이렉트
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request & { user?: GithubProfile }, @Res() res: Response) {
    const profile = req.user;
    if (!profile) {
      return res.redirect(this.getFrontendUrl('/login?error=oauth_failed'));
    }
    if (!profile.email) {
      return res.redirect(
        this.getFrontendUrl('/login?error=github_email_required'),
      );
    }
    return this.handleOAuthCallback(
      {
        ...profile,
        email: profile.email,
      },
      res,
    );
  }

  @Get('oauth/link/preview')
  previewOAuthLink(@Query('token') token: string) {
    return this.authService.previewOAuthLink(token);
  }

  @Post('oauth/link')
  confirmOAuthLink(@Body() dto: ConfirmOAuthLinkDto) {
    return this.authService.confirmOAuthLink(dto.linkToken, dto.password);
  }

  private async handleOAuthCallback(
    profile: GoogleProfile | (GithubProfile & { email: string }) | undefined,
    res: Response,
  ) {
    if (!profile) {
      return res.redirect(this.getFrontendUrl('/login?error=oauth_failed'));
    }

    try {
      const result = await this.authService.processOAuthCallback(profile);
      if (result.action === 'account_deleted') {
        return res.redirect(this.getFrontendUrl('/login?error=account_deleted'));
      }
      if (result.action === 'link_required') {
        const url = `${this.getFrontendUrl('/auth/oauth/link')}?token=${encodeURIComponent(result.linkToken)}`;
        return res.redirect(url);
      }

      const url = `${this.getFrontendUrl('/auth/oauth/callback')}?token=${encodeURIComponent(result.accessToken)}`;
      return res.redirect(url);
    } catch {
      return res.redirect(this.getFrontendUrl('/login?error=oauth_failed'));
    }
  }

  private getFrontendUrl(path: string): string {
    const base =
      this.config.get<string>('FRONTEND_URL') ||
      this.config.get<string>('SITE_URL') ||
      'http://localhost:3000';
    return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

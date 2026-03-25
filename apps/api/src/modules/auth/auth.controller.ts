import { Controller, Post, Body, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterRequestDto, LoginRequestDto, ResendVerificationDto } from './dto';
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
    const profile = req.user;
    if (!profile) {
      return res.redirect(this.getFrontendUrl('/login?error=oauth_failed'));
    }
    try {
      const { accessToken, user } = await this.authService.findOrCreateOAuthUser(profile);
      const url = `${this.getFrontendUrl('/login')}?token=${encodeURIComponent(accessToken)}&oauth=1`;
      return res.redirect(url);
    } catch {
      return res.redirect(this.getFrontendUrl('/login?error=oauth_failed'));
    }
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
    try {
      const { accessToken } = await this.authService.findOrCreateOAuthUser({
        ...profile,
        email: profile.email,
      });
      const url = `${this.getFrontendUrl('/login')}?token=${encodeURIComponent(accessToken)}&oauth=1`;
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

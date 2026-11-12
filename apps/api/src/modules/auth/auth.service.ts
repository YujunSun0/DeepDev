import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterRequestDto, LoginRequestDto } from './dto';

const DELETED_ACCOUNT_MESSAGE =
  '탈퇴한 계정은 재가입할 수 없습니다. 탈퇴 후에는 복구가 불가능합니다.';

/** OAuth 일회용 교환 코드 유효 시간 */
const OAUTH_EXCHANGE_CODE_TTL_MS = 60 * 1000;

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    planType: string;
    preferredLanguage: string | null;
  };
}

@Injectable()
export class AuthService {
  /**
   * OAuth 콜백 리다이렉트 URL에 JWT를 직접 싣지 않기 위한 일회용 코드 저장소.
   * 코드는 60초 동안 한 번만 교환할 수 있습니다.
   */
  private readonly oauthExchangeCodes = new Map<
    string,
    { auth: AuthResponse; expiresAt: number }
  >();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterRequestDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('이미 등록된 이메일입니다');
    }

    const deleted = await this.usersService.findDeletedByEmail(dto.email);
    if (deleted) {
      throw new ConflictException(DELETED_ACCOUNT_MESSAGE);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash: hashedPassword,
      name: dto.name,
      emailVerified: false,
    });

    if (this.emailService.enabled) {
      const verifyToken = this.jwtService.sign(
        { sub: user.id, email: user.email, purpose: 'email-verify' },
        { expiresIn: '24h' },
      );
      await this.emailService.sendVerificationEmail(user.email, verifyToken);
      return {
        message: '이메일을 확인해주세요. 인증 링크를 보내드렸습니다.',
        requiresVerification: true,
      };
    }

    await this.usersService.setEmailVerified(user.id);
    const token = this.generateToken(user.id, user.email);
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }

  async login(dto: LoginRequestDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        `이 계정은 소셜 로그인으로 가입되었습니다. ${user.authProvider === 'google' ? 'Google' : user.authProvider === 'github' ? 'GitHub' : '소셜'}로 로그인해주세요.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    if (!user.emailVerified && this.emailService.enabled) {
      throw new UnauthorizedException(
        '이메일 인증이 필요합니다. 가입 시 발송된 메일을 확인해주세요.',
      );
    }

    const token = this.generateToken(user.id, user.email);
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    if (!this.emailService.enabled) {
      throw new BadRequestException('이메일 서비스가 설정되지 않았습니다');
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: '해당 이메일로 등록된 계정이 없습니다' };
    }
    if (user.emailVerified) {
      return { message: '이미 인증된 이메일입니다. 로그인해주세요' };
    }
    const verifyToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'email-verify' },
      { expiresIn: '24h' },
    );
    await this.emailService.sendVerificationEmail(user.email, verifyToken);
    return { message: '인증 메일을 다시 보내드렸습니다. 이메일을 확인해주세요' };
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        purpose: string;
      }>(token);
      if (payload.purpose !== 'email-verify') {
        throw new BadRequestException('유효하지 않은 토큰입니다');
      }
      await this.usersService.setEmailVerified(payload.sub);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('사용자를 찾을 수 없습니다');
      }
      const accessToken = this.generateToken(user.id, user.email);
      return {
        success: true,
        message: '이메일이 인증되었습니다.',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          planType: user.planType,
          preferredLanguage: user.preferredLanguage,
        },
      };
    } catch {
      throw new BadRequestException('만료되었거나 유효하지 않은 링크입니다.');
    }
  }

  async processOAuthCallback(profile: {
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  }) {
    const byProvider = await this.usersService.findByProvider(profile.provider, profile.providerId);
    if (byProvider) {
      return { action: 'login' as const, ...this.buildAuthResponse(byProvider) };
    }

    const deletedByEmail = await this.usersService.findDeletedByEmail(profile.email);
    if (deletedByEmail) {
      return { action: 'account_deleted' as const };
    }

    const existingByEmail = await this.usersService.findByEmail(profile.email);
    if (existingByEmail) {
      if (
        existingByEmail.authProvider === profile.provider &&
        existingByEmail.authProviderId === profile.providerId
      ) {
        return { action: 'login' as const, ...this.buildAuthResponse(existingByEmail) };
      }

      const linkToken = this.generateOAuthLinkToken(profile);
      return {
        action: 'link_required' as const,
        linkToken,
        email: profile.email,
        provider: profile.provider,
        existingAuthProvider: existingByEmail.authProvider,
        requiresPassword: !!existingByEmail.passwordHash,
      };
    }

    const user = await this.usersService.create({
      email: profile.email,
      name: profile.name ?? undefined,
      emailVerified: true,
      authProvider: profile.provider,
      authProviderId: profile.providerId,
      avatarUrl: profile.avatarUrl ?? undefined,
    });

    return { action: 'login' as const, ...this.buildAuthResponse(user) };
  }

  previewOAuthLink(linkToken: string) {
    const payload = this.parseOAuthLinkToken(linkToken);

    return this.usersService.findByEmail(payload.email).then((existing) => {
      if (!existing) {
        throw new BadRequestException('연동할 계정을 찾을 수 없습니다. 다시 소셜 로그인을 시도해주세요.');
      }
      if (
        existing.authProvider === payload.provider &&
        existing.authProviderId === payload.providerId
      ) {
        throw new BadRequestException('이미 연동된 계정입니다. 로그인해주세요.');
      }

      return {
        email: payload.email,
        provider: payload.provider,
        existingAuthProvider: existing.authProvider,
        requiresPassword: !!existing.passwordHash,
      };
    });
  }

  async confirmOAuthLink(linkToken: string, password?: string) {
    const payload = this.parseOAuthLinkToken(linkToken);
    const existing = await this.usersService.findByEmail(payload.email);
    if (!existing) {
      throw new BadRequestException('연동할 계정을 찾을 수 없습니다. 다시 소셜 로그인을 시도해주세요.');
    }

    if (
      existing.authProvider === payload.provider &&
      existing.authProviderId === payload.providerId
    ) {
      return this.buildAuthResponse(existing);
    }

    if (existing.passwordHash) {
      if (!password) {
        throw new BadRequestException('기존 계정 비밀번호를 입력해주세요.');
      }
      const isPasswordValid = await bcrypt.compare(password, existing.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
      }
    }

    await this.usersService.updateProviderInfo(existing.id, {
      authProvider: payload.provider,
      authProviderId: payload.providerId,
      avatarUrl: payload.avatarUrl,
    });

    if (!existing.emailVerified) {
      await this.usersService.setEmailVerified(existing.id);
    }

    const user = await this.usersService.findById(existing.id);
    if (!user) {
      throw new BadRequestException('계정 연동 중 오류가 발생했습니다.');
    }

    return this.buildAuthResponse(user);
  }

  /** 로그인 결과를 일회용 코드로 보관하고 코드를 돌려줍니다. */
  createOAuthExchangeCode(auth: AuthResponse): string {
    this.pruneExpiredOAuthExchangeCodes();
    const code = randomBytes(32).toString('base64url');
    this.oauthExchangeCodes.set(code, {
      auth,
      expiresAt: Date.now() + OAUTH_EXCHANGE_CODE_TTL_MS,
    });
    return code;
  }

  /** 일회용 코드를 토큰으로 교환합니다. 코드는 성공 여부와 관계없이 즉시 폐기됩니다. */
  exchangeOAuthCode(code: string): AuthResponse {
    const entry = this.oauthExchangeCodes.get(code);
    this.oauthExchangeCodes.delete(code);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException(
        '로그인 요청이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.',
      );
    }
    return entry.auth;
  }

  private pruneExpiredOAuthExchangeCodes() {
    const now = Date.now();
    for (const [code, entry] of this.oauthExchangeCodes) {
      if (entry.expiresAt < now) this.oauthExchangeCodes.delete(code);
    }
  }

  /** @deprecated processOAuthCallback / confirmOAuthLink 사용 */
  async findOrCreateOAuthUser(profile: {
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  }) {
    const result = await this.processOAuthCallback(profile);
    if (result.action === 'link_required') {
      throw new BadRequestException('이미 등록된 이메일입니다. 계정 연동이 필요합니다.');
    }
    if (result.action === 'account_deleted') {
      throw new ConflictException(DELETED_ACCOUNT_MESSAGE);
    }
    return { accessToken: result.accessToken, user: result.user };
  }

  private generateOAuthLinkToken(profile: {
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  }): string {
    return this.jwtService.sign(
      {
        purpose: 'oauth-link',
        provider: profile.provider,
        providerId: profile.providerId,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
      { expiresIn: '15m' },
    );
  }

  private parseOAuthLinkToken(linkToken: string): {
    purpose: string;
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  } {
    try {
      const payload = this.jwtService.verify<{
        purpose: string;
        provider: 'google' | 'github';
        providerId: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
      }>(linkToken);
      if (payload.purpose !== 'oauth-link') {
        throw new BadRequestException('유효하지 않은 연동 요청입니다.');
      }
      return payload;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('연동 요청이 만료되었거나 유효하지 않습니다. 다시 소셜 로그인을 시도해주세요.');
    }
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
    planType: string;
    preferredLanguage: string | null;
  }) {
    const token = this.generateToken(user.id, user.email);
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}

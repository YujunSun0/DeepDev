import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterRequestDto, LoginRequestDto } from './dto';

@Injectable()
export class AuthService {
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
      },
    };
  }

  async login(dto: LoginRequestDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
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
      },
    };
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
        },
      };
    } catch {
      throw new BadRequestException('만료되었거나 유효하지 않은 링크입니다.');
    }
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}

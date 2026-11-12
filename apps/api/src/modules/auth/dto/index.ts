import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email!: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다' })
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginRequestDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email!: string;

  @IsString()
  password!: string;
}

export class ResendVerificationDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email!: string;
}

export class ExchangeOAuthCodeDto {
  @IsString()
  code!: string;
}

export class ConfirmOAuthLinkDto {
  @IsString()
  linkToken!: string;

  @IsString()
  @IsOptional()
  password?: string;
}

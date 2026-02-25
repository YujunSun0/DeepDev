import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

import { IsOptional, IsString, IsIn, ValidateIf, MaxLength } from 'class-validator';

const ALLOWED_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'rust'] as const;

export class PatchMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '이름은 50자 이하여야 합니다' })
  name?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsString()
  @IsIn(ALLOWED_LANGUAGES, { message: '지원하는 언어를 선택해주세요' })
  preferredLanguage?: string | null;
}

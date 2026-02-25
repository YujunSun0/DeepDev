import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateSessionRequestDto {
  @IsString()
  conceptId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  level!: number;
}

export class SubmitAnswerRequestDto {
  @IsString()
  answer!: string;
}

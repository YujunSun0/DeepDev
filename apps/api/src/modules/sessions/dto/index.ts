import { IsString, IsInt, Min, Max, IsIn } from 'class-validator';

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

export class DiscussRequestDto {
  @IsString()
  @IsIn(['explanation', 'objective', 'subjective', 'application'])
  stepType!: 'explanation' | 'objective' | 'subjective' | 'application';

  @IsString()
  message!: string;
}

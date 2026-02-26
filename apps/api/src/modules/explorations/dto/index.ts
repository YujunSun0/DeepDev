import { IsString, IsOptional } from 'class-validator';

export class CreateExplorationDto {
  @IsString()
  conceptId!: string;

  @IsString()
  message!: string;
}

export class SendMessageDto {
  @IsString()
  message!: string;
}

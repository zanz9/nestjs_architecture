import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class GenerateTokensDto {
  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @IsInt()
  @IsPositive()
  userId: number;
}

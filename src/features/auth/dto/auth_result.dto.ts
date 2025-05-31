import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/core/db/entities/user.entity';

export class AuthResultDto {
  @ApiProperty({
    description: 'Новый access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Новый refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

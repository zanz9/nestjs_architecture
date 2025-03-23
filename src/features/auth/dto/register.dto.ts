import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserEntity } from '@/core/db/entities/user.entity';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto extends PartialType(UserEntity) {
  @ApiProperty({
    description: 'The email of the user',
    example: 'test@test.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  @IsNotEmpty()
  password: string;
}

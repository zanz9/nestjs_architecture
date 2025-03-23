import { PartialType } from '@nestjs/swagger';
import { UserEntity } from '@/core/db/entities/user.entity';

export class UserDto extends PartialType(UserEntity) {}

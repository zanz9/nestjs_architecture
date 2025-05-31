import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/core/services/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../enum/user_roles.enum';
import { Exclude } from 'class-transformer';

@Entity('user')
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Exclude()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.USER })
  role: UserRoles;
}

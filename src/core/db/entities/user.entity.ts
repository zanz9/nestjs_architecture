import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/core/services/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('user')
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  password: string;
}

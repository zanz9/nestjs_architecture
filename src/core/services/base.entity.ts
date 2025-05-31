import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '+5'", // set your timezone
  })
  @ApiProperty()
  createdAt: Date;
}

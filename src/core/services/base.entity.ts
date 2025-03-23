import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '@/core/db/entities/user.entity';

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt?: Date | null;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  // @ManyToOne('UserEntity', { nullable: true })
  // @JoinColumn()
  // createdBy?: UserEntity | null;

  // @ManyToOne('UserEntity', { nullable: true })
  // @JoinColumn()
  // updatedBy?: UserEntity | null;
}

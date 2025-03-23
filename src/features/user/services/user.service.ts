import { Injectable } from '@nestjs/common';

import { UserEntity } from '@/core/db/entities/user.entity';
import { Repository } from 'typeorm';
import { BaseService } from '@/core/services/base.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected userRepository: Repository<UserEntity>,
  ) {
    super(userRepository);
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}

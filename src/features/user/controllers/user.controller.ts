import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UserEntity } from '@/core/db/entities/user.entity';
import { TEntityListOptions } from '@/core/services/base.service';
import { UserDto } from '../dto/user.dto';
import { Auth } from '@/core/decorators/auth.decorator';
import {
  PayloadUser,
  SessionAccount,
} from '@/core/decorators/session-account.decorator';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiQuery({ type: TEntityListOptions<UserEntity> })
  @Get()
  async findAll(@Query() queryDto: TEntityListOptions<UserEntity>) {
    return this.userService.findAll(queryDto);
  }

  @ApiQuery({ type: TEntityListOptions<UserEntity> })
  @Get(':id')
  async findOne(
    @Query() queryDto: TEntityListOptions<UserEntity>,
    @Param('id') id: number,
  ) {
    return this.userService.findOne(id, queryDto);
  }

  @ApiQuery({ type: TEntityListOptions<UserEntity> })
  @ApiBody({ type: UserDto })
  @Auth()
  @Post()
  async createOne(
    @SessionAccount() account: UserEntity,
    @Query() queryDto: TEntityListOptions<UserEntity>,
    @Body() createDto: UserDto,
  ) {
    return this.userService.createOne(createDto, queryDto);
  }

  @ApiQuery({ type: TEntityListOptions<UserEntity> })
  @ApiBody({ type: UserDto })
  @Auth()
  @Patch(':id')
  async updateOne(
    @SessionAccount() account: UserEntity,
    @Query() queryDto: TEntityListOptions<UserEntity>,
    @Body() createDto: UserDto,
    @Param('id') id: number,
  ) {
    return this.userService.updateOne(id, createDto, queryDto);
  }

  @ApiQuery({ type: TEntityListOptions<UserEntity> })
  @Auth()
  @Delete(':id')
  async deleteOne(
    @SessionAccount() account: UserEntity,
    @Query() queryDto: TEntityListOptions<UserEntity>,
    @Param('id') id: number,
  ) {
    return this.userService.deleteOne(id, queryDto);
  }
}

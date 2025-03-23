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

import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UserEntity } from '@/core/db/entities/user.entity';
import { UserDto } from '../dto/user.dto';
import { Auth } from '@/core/decorators/auth.decorator';
import {
  PayloadUser,
  SessionAccount,
} from '@/core/decorators/session_account.decorator';
import { ListQueryDto, QueryDto } from '@/core/dto/query.dto';
import { TEntityListOptions } from '@/core/types/requests';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() queryDto: ListQueryDto<UserEntity>) {
    return this.userService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(
    @Query() queryDto: QueryDto<UserEntity>,
    @Param('id') id: number,
  ) {
    return this.userService.findOne(id, queryDto);
  }

  @ApiBody({ type: UserDto })
  @ApiResponse({ type: UserEntity })
  @Auth()
  @Post()
  async createOne(
    @SessionAccount() account: UserEntity,
    @Body() createDto: UserDto,
  ) {
    console.log(account);
    return this.userService.createOne(createDto);
  }

  @ApiBody({ type: UserDto })
  @Auth()
  @Patch(':id')
  async updateOne(
    @SessionAccount() account: UserEntity,
    @Body() createDto: UserDto,
    @Param('id') id: number,
  ) {
    return this.userService.updateOne(id, createDto);
  }

  @Auth()
  @Delete(':id')
  async deleteOne(
    @SessionAccount() account: UserEntity,
    @Param('id') id: number,
  ) {
    return this.userService.deleteOne(id);
  }
}

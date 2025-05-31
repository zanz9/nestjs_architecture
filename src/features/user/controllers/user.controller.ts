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

import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UserEntity } from '@/core/db/entities/user.entity';
import { UserDto } from '../dto/user.dto';
import { Auth } from '@/core/decorators/auth.decorator';
import {
  PayloadUser,
  SessionAccount,
} from '@/core/decorators/session_account.decorator';
import { TEntityListOptions } from '@/core/types/requests';
import { PaginatedQueryDto } from '@/core/dto/query.dto';

@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список пользователей',
  })
  async findAll(@Query() queryDto: PaginatedQueryDto) {
    return this.userService.findAll(queryDto as any);
  }

  @Get(':id')
  async findOne(@Query() queryDto: PaginatedQueryDto, @Param('id') id: number) {
    return this.userService.findOne(id, queryDto as any);
  }

  @ApiBody({ type: UserDto })
  @ApiResponse({ type: UserEntity })
  @Auth()
  @Post()
  async createOne(
    @SessionAccount() account: UserEntity,
    @Body() createDto: UserDto,
  ) {
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

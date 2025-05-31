import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '@/core/db/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { AuthResultDto } from '../dto/auth_result.dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    type: UserEntity,
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const tokens = await this.authService.register(registerDto);
    return tokens;
  }

  @ApiBody({ type: LoginDto })
  @ApiResponse({
    type: AuthResultDto,
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return tokens;
  }
}

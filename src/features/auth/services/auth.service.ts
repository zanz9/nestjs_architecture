import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '@/features/user/services/user.service';
import { LoginDto } from '../dto/login.dto';
import { TokenService } from './token.service';
import { ENV_KEYS } from '@/core/config/env_keys';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@/core/db/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.findOneByEmail(registerDto.email);
    if (user) throw new BadRequestException('User already exists');

    const hashedPassword = await this.hashPassword(registerDto.password);
    const createdUser = await this.userService.createOne({
      ...registerDto,
      password: hashedPassword,
    });
    if (!createdUser) throw new NotFoundException('User not created');

    const tokens = await this.tokenService.createTokens(createdUser);
    return tokens;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    const tokens = await this.tokenService.createTokens(user);

    await this.tokenService.setAccessTokenToWhiteList(tokens.accessToken);
    await this.tokenService.setRefreshTokenToWhiteList(tokens.refreshToken);

    return tokens;
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(
      String(password),
      Number(this.configService.getOrThrow<number>(ENV_KEYS.PASSWORD_HASH)),
    );
  }

  async generateTokensByUserId(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    const tokens = await this.tokenService.createTokens(user);
    return tokens;
  }
}

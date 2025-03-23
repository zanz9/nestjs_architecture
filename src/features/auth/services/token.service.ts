import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Redis } from 'ioredis';
import { UserEntity } from '@/core/db/entities/user.entity';

import { RedisService } from '@liaoliaots/nestjs-redis';
import { ENV_KEYS } from '@/core/config/env_keys';
import { UserService } from '@/features/user/services/user.service';
import { PayloadUser } from '@/core/decorators/session-account.decorator';
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  private readonly redis: Redis | null;

  async validate(sessionAccount: PayloadUser) {
    const user = await this.userService.findOne(sessionAccount.id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async refreshAccessToken(refreshToken: string) {
    const payload: PayloadUser = await this.validateRefreshToken(refreshToken);
    if (!payload) throw new UnauthorizedException('Invalid token');

    const isTokenWhiteListed = await this.getTokenFromWhiteList(refreshToken);
    if (!isTokenWhiteListed)
      throw new UnauthorizedException('Token is not whitelisted');

    const user = await this.userService.findOne(payload.id);
    if (!user) throw new NotFoundException('User not found');

    const { accessToken, refreshToken: newRefreshToken } =
      await this.createTokens(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async setRefreshTokenToWhiteList(refreshToken: string) {
    return await this.setTokenToWhiteList(
      refreshToken,
      this.configService.getOrThrow<string>(
        ENV_KEYS.JWT_REFRESH_TOKEN_EXPIRATION,
      ),
    );
  }

  async setAccessTokenToWhiteList(accessToken: string) {
    return await this.setTokenToWhiteList(
      accessToken,
      this.configService.getOrThrow<string>(
        ENV_KEYS.JWT_ACCESS_TOKEN_EXPIRATION,
      ),
    );
  }

  async setRefreshTokenToWhiteListInfinite(refreshToken: string) {
    return await this.setTokenToWhiteList(refreshToken, '999d');
  }

  async setAccessTokenToWhiteListInfinite(accessToken: string) {
    return await this.setTokenToWhiteList(accessToken, '999d');
  }

  async setTokenToWhiteList(token: string, expiration: string) {
    const key = `token:${token}`;
    return await this.redis?.set(
      key,
      token,
      'EX',
      this.convertToSeconds(expiration),
    );
  }

  async removeTokenFromWhiteList(token: string) {
    const key = `token:${token}`;
    return this.redis?.del(key);
  }

  async getTokenFromWhiteList(token: string) {
    const key = `token:${token}`;
    return this.redis?.get(key);
  }

  async createTokens(user: UserEntity) {
    const payloadAccessToken: PayloadUser = {
      id: user.id,
      email: user.email,
      type: 'access',
    };
    const payloadRefreshToken: PayloadUser = {
      id: user.id,
      email: user.email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(payloadAccessToken, {
      expiresIn: this.configService.getOrThrow<number>(
        ENV_KEYS.JWT_ACCESS_TOKEN_EXPIRATION,
      ),
    });
    const refreshToken = this.jwtService.sign(payloadRefreshToken, {
      expiresIn: this.configService.getOrThrow<number>(
        ENV_KEYS.JWT_REFRESH_TOKEN_EXPIRATION,
      ),
    });

    return { accessToken, refreshToken };
  }

  async validateAccessToken(token: string): Promise<PayloadUser> {
    const decoded = this.jwtService.verify(token);
    if (!decoded) throw new UnauthorizedException('Invalid token');
    if (decoded.type !== 'access')
      throw new UnauthorizedException('Invalid token type');
    return decoded;
  }

  async validateRefreshToken(token: string): Promise<PayloadUser> {
    const decoded = this.jwtService.verify(token);
    if (!decoded) throw new UnauthorizedException('Invalid token');
    if (decoded.type !== 'refresh')
      throw new UnauthorizedException('Invalid token type');
    return decoded;
  }

  convertToSeconds(timeStr: string): number {
    const timeUnits: { [key: string]: number } = {
      d: 86400,
      h: 3600,
      m: 60,
      s: 1,
    };

    const [, value, unit] = timeStr.match(/(\d+)([dhms])/) || [];
    return parseInt(value) * (timeUnits[unit] || 0);
  }
}

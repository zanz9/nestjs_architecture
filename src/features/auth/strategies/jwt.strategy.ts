import { ENV_KEYS } from '@/core/config/env_keys';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from '../services/token.service';
import { PayloadUser } from '@/core/decorators/session_account.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(ENV_KEYS.JWT_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: PayloadUser) {
    const accessToken = request.headers['authorization']?.split(' ')[1];
    if (!accessToken) throw new UnauthorizedException('No token provided');

    const isTokenWhiteListed =
      await this.tokenService.getTokenFromWhiteList(accessToken);
    if (!isTokenWhiteListed)
      throw new UnauthorizedException('Token is not whitelisted');

    return this.tokenService.validate(payload);
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ENV_KEYS } from './core/config/env_keys';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isDevelopment = process.env.NODE_ENV === 'development';
        return {
          config: {
            host: isDevelopment
              ? 'localhost'
              : configService.get<string>(ENV_KEYS.REDIS_HOST),
            port: configService.get<number>(ENV_KEYS.REDIS_PORT),
          },
        };
      },
    }),
  ],
  exports: [RedisModule],
})
export class RedisCacheModule {}

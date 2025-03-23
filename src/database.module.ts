import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ENV_KEYS } from './core/config/env_keys';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isDevelopment = process.env.NODE_ENV === 'development';
        return {
          type: 'postgres',
          host: isDevelopment
            ? 'localhost'
            : configService.get<string>(ENV_KEYS.DB_HOST),
          port: configService.get<number>(ENV_KEYS.DB_PORT),
          username: configService.get<string>(ENV_KEYS.DB_USERNAME),
          password: configService.get<string>(ENV_KEYS.DB_PASSWORD),
          database: configService.get<string>(ENV_KEYS.DB_DATABASE),
          entities: [__dirname + '/src/core/db/entities/*.entity{.ts,.js}'],
          subscribers: [
            __dirname + '/src/core/db/subscribers/*.subscriber{.ts,.js}',
          ],
          synchronize: false,
          autoLoadEntities: true,
          logging: false,
          migrations: [__dirname + '/src/core/db/migrations/*{.ts,.js}'],
          ssl: configService.get('DB_SSl', false),
        };
      },
    }),
  ],
})
export class DatabaseModule {}

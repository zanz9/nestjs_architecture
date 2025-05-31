import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheModule } from './redis.module';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { DatabaseModule } from './database.module';
import { PassportModule } from '@nestjs/passport';
import { DocsController } from './core/controllers/docs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    RedisCacheModule,
    AuthModule,
    UserModule,
  ],
  controllers: [DocsController],
})
export class AppModule {}

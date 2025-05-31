import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { ENV_KEYS } from './core/config/env_keys';
import { setupSwaggerConfig } from './core/config/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>(ENV_KEYS.PORT) ?? 3000;

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '120mb' }));
  app.use(bodyParser.urlencoded({ limit: '120mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe());
  setupSwaggerConfig(app);

  await app.listen(port);
}
bootstrap();

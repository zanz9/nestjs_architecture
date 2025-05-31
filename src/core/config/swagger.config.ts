import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export function setupSwaggerConfig(app: INestApplication) {
  const configService = app.get(ConfigService);
  const appName = configService.get<string>(
    'APP_NAME',
    'NestJS Architecture API',
  );
  const appDescription = configService.get<string>('APP_DESCRIPTION', '');
  const appVersion = configService.get<string>('APP_VERSION', '1.0');

  // Настройка документации
  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(appDescription)
    .setVersion(appVersion)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Authorization',
        name: 'Authorization',
        description: 'Введите Access токен',
        in: 'header',
      },
      'Authorization',
    )
    .addTag('Авторизация', 'Методы для работы с авторизацией и JWT токенами')
    .addTag('Пользователи', 'Методы для работы с пользователями')
    .build();

  // Настройка опций Swagger
  const swaggerOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      deepLinking: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  };

  // Создание документации
  const document = SwaggerModule.createDocument(app, config);

  // Установка префикса для Swagger
  SwaggerModule.setup(
    configService.get<string>('SWAGGER_PATH', '/docs'),
    app,
    document,
    swaggerOptions,
  );
}

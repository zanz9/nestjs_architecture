import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENV_KEYS } from './env_keys';

export const setupSwaggerConfig = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const baseUrl = configService.getOrThrow<string>(ENV_KEYS.BASE_URL);
  const swaggerTitle = configService.getOrThrow<string>(ENV_KEYS.SWAGGER_TITLE);
  const swaggerDescription = configService.getOrThrow<string>(
    ENV_KEYS.SWAGGER_DESCRIPTION,
  );
  const swaggerVersion = configService.getOrThrow<string>(
    ENV_KEYS.SWAGGER_VERSION,
  );
  const swaggerPath = configService.getOrThrow<string>(ENV_KEYS.SWAGGER_PATH);

  const options = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'Authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  document.servers = [{ url: baseUrl }];
  SwaggerModule.setup(swaggerPath, app, document);
};

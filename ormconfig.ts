import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { ENV_KEYS } from '@/core/config/env_keys';
config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host:
    process.env.NODE_ENV === 'development'
      ? 'localhost'
      : configService.get<string>(ENV_KEYS.DB_HOST),
  port: configService.get<number>(ENV_KEYS.DB_PORT),
  username: configService.get<string>(ENV_KEYS.DB_USERNAME),
  password: configService.get<string>(ENV_KEYS.DB_PASSWORD),
  database: configService.get<string>(ENV_KEYS.DB_DATABASE),
  synchronize: false,
  entities: ['src/core/db/entities/*.entity.ts'],
  migrations: ['src/core/db/migrations/*.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;

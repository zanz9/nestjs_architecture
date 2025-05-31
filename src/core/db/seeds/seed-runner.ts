import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { runSeeds } from './seed';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from '@/core/config/env_keys';

// Загружаем переменные окружения из .env
dotenv.config();

const configService = new ConfigService();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get(ENV_KEYS.DB_HOST),
  port: configService.get<number>(ENV_KEYS.DB_PORT),
  username: configService.get(ENV_KEYS.DB_USERNAME),
  password: configService.get(ENV_KEYS.DB_PASSWORD),
  database: configService.get(ENV_KEYS.DB_DATABASE),
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  subscribers: [__dirname + '/../subscribers/*.subscriber{.ts,.js}'],
  synchronize: false,
  logging: true,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  ssl: configService.get('DB_SSL', false),
};

// Создаем источник данных
const dataSource = new DataSource(dataSourceOptions);

// Инициализируем подключение и запускаем сиды
dataSource
  .initialize()
  .then(async () => {
    console.log('База данных успешно подключена');

    try {
      await runSeeds(dataSource);
      console.log('Заполнение базы данных завершено успешно');
      process.exit(0);
    } catch (error) {
      console.error('Ошибка при заполнении базы данных:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Ошибка при подключении к базе данных:', error);
    process.exit(1);
  });

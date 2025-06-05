# NestJS Architecture Project

## 📖 Описание

Это современное enterprise-приложение, построенное на NestJS framework с использованием TypeScript. Проект реализует чистую архитектуру с модульной структурой, включает систему аутентификации, управление пользователями и готовую инфраструктуру для развертывания.

## 🏗️ Архитектура

Проект следует принципам **модульной архитектуры** и **чистого кода**:

### Структура проекта:

```
src/
├── core/                    # Ядро приложения
│   ├── config/             # Конфигурации
│   ├── controllers/        # Базовые контроллеры
│   ├── db/                 # База данных
│   │   ├── entities/       # TypeORM сущности
│   │   ├── migrations/     # Миграции БД
│   │   ├── seeds/          # Сиды для БД
│   │   └── enum/           # Энумы для БД
│   ├── decorators/         # Кастомные декораторы
│   ├── docs/               # Swagger документация
│   ├── dto/                # Data Transfer Objects
│   ├── guards/             # Охранники (Guards)
│   ├── helpers/            # Вспомогательные функции
│   ├── interceptors/       # Перехватчики
│   ├── services/           # Базовые сервисы
│   ├── types/              # TypeScript типы
│   └── utils/              # Утилиты
├── features/               # Функциональные модули
│   ├── auth/               # Модуль аутентификации
│   │   ├── controllers/    # Контроллеры аутентификации
│   │   ├── dto/            # DTO для аутентификации
│   │   ├── services/       # Сервисы аутентификации
│   │   ├── strategies/     # Passport стратегии
│   │   └── auth.module.ts  # Модуль аутентификации
│   └── user/               # Модуль пользователей
│       ├── controllers/    # Контроллеры пользователей
│       ├── dto/            # DTO для пользователей
│       ├── services/       # Сервисы пользователей
│       └── user.module.ts  # Модуль пользователей
├── app.module.ts           # Корневой модуль
├── database.module.ts      # Модуль базы данных
├── redis.module.ts         # Модуль Redis
└── main.ts                 # Точка входа
```

### Основные принципы:

- **SOLID принципы** - каждый класс имеет единственную ответственность
- **Модульность** - каждый домен инкапсулирован в отдельный модуль
- **Инверсия зависимостей** - использование dependency injection
- **Чистая архитектура** - разделение бизнес-логики и инфраструктуры

## 🚀 Технологический стек

### Backend:

- **NestJS** - прогрессивный Node.js фреймворк
- **TypeScript** - типизированный JavaScript
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - реляционная база данных
- **Redis** - кеширование и сессии
- **JWT** - аутентификация
- **Passport** - стратегии аутентификации
- **bcryptjs** - хеширование паролей
- **class-validator** - валидация данных
- **Swagger** - документация API

### DevOps:

- **Docker** - контейнеризация
- **Docker Compose** - оркестрация контейнеров
- **MinIO** - S3-совместимое объектное хранилище

### Тестирование:

- **Jest** - фреймворк для тестирования
- **Supertest** - тестирование HTTP запросов

## 🛠️ Установка и настройка

### Требования:

- Node.js >= 18
- PostgreSQL >= 13
- Redis >= 6
- Docker и Docker Compose (опционально)

### 1. Клонирование репозитория:

```bash
git clone <repository-url>
cd nestjs_architecture
```

### 2. Установка зависимостей:

```bash
yarn install
```

### 3. Настройка переменных окружения:

Создайте файлы конфигурации:

- `.env` - основные настройки приложения
- `.env.db` - настройки базы данных
- `.env.minio` - настройки MinIO

### 4. Запуск с Docker:

```bash
docker-compose up -d
```

### 5. Запуск миграций:

```bash
yarn migration:run
```

## 📝 Скрипты

### Основные команды:

#### Разработка:

```bash
# Разработка с автоперезагрузкой
yarn dev

# Обычный старт в dev режиме
yarn start:dev

# Режим отладки
yarn start:debug
```

#### Продакшн:

```bash
# Сборка проекта
yarn build

# Запуск продакшн версии
yarn start:prod
```

#### База данных:

```bash
# Запуск миграций
yarn migration:run

# Генерация новой миграции
yarn migration:generate <MigrationName>

# Удаление схемы БД
yarn schema:drop

# Полная пересборка БД (удаление + миграции)
yarn migration:scratch
```

#### Тестирование:

```bash
# Запуск всех тестов
yarn test

# Тесты с отслеживанием изменений
yarn test:watch

# E2E тестирование
yarn test:e2e

# Покрытие кода тестами
yarn test:cov

# Отладка тестов
yarn test:debug
```

#### Качество кода:

```bash
# Линтинг и автоисправление
yarn lint

# Форматирование кода
yarn format
```

#### Документация:

```bash
# Генерация Swagger схемы
yarn swagger:generate
```

### Стратегии:

- JWT Strategy для защищенных роутов
- Local Strategy для аутентификации по логину/паролю

## 📚 API Документация

API документация доступна через Swagger UI:

- **Development**: `http://localhost:3000/docs`
- **Swagger JSON**: `http://localhost:3000/docs-json`

Документация автоматически генерируется из декораторов в коде.

## 🐳 Docker

### Сервисы:

- **app** - основное NestJS приложение
- **postgres** - база данных PostgreSQL
- **redis** - сервер Redis для кеширования
- **minio** - S3-совместимое объектное хранилище

### Порты:

- `3000` - NestJS приложение
- `5432` - PostgreSQL
- `6379` - Redis
- `9000` - MinIO API
- `9001` - MinIO Console

## 🧪 Тестирование

### Структура тестов:

- **Unit тесты** - тестирование отдельных компонентов
- **E2E тесты** - тестирование всего API
- **Coverage** - отчеты о покрытии кода

### Соглашения:

- Файлы тестов: `*.spec.ts`
- E2E тесты: в папке `test/`
- Arrange-Act-Assert pattern
- Naming: `inputX`, `mockX`, `actualX`, `expectedX`

## 🚀 Развертывание

### Локальная разработка:

```bash
# С Docker
docker-compose up -d

# Без Docker
yarn install
yarn migration:run
yarn dev
```

### Продакшн:

```bash
# Сборка
yarn build

# Запуск
yarn start:prod
```

## 📋 Соглашения по коду

### TypeScript:

- Строгая типизация, избегание `any`
- JSDoc для публичных методов
- PascalCase для классов
- camelCase для переменных и методов
- snake_case для файлов и папок

### NestJS:

- Модульная архитектура
- Один экспорт на файл
- Dependency Injection
- Guards для авторизации
- Interceptors для обработки запросов
- DTOs с валидацией

### База данных:

- TypeORM entities
- Миграции для изменений схемы
- Сиды для тестовых данных
- Енумы для ограниченных значений

## 🤝 Контрибьюция

1. Форкните репозиторий
2. Создайте feature ветку: `git checkout -b feature/amazing-feature`
3. Зафиксируйте изменения: `git commit -m 'Add amazing feature'`
4. Отправьте в ветку: `git push origin feature/amazing-feature`
5. Создайте Pull Request

## 📞 Поддержка

При возникновении вопросов или проблем, пожалуйста, создайте issue в репозитории.

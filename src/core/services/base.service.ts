import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import {
  Between,
  DeepPartial,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  Not,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Like,
} from 'typeorm';
import { BaseEntity } from '@/core/services/base.entity';
import {
  TEntityListOptions,
  TEntityOptions,
  TSearchOptions,
} from '../types/requests';

// Добавим новый интерфейс для опций с exclusion
interface ExtendedFindOptions {
  exclude?: string;
  skip?: number;
  take?: number;
}

export abstract class BaseService<Entity extends BaseEntity> {
  private readonly logger = new Logger(BaseService.name);

  // Конфиденциальные поля, которые никогда не должны быть включены в ответ
  protected excludeAlwaysFields: string[] = ['password'];

  constructor(protected repository: Repository<Entity>) {}

  async createOne(createDto: DeepPartial<Entity>) {
    try {
      const createdRecord = this.repository.create(createDto);
      const savedRecord = await this.repository.save(createdRecord);
      return savedRecord;
    } catch (error) {
      this.logger.error(
        `Ошибка при создании записи: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Ошибка при создании записи');
    }
  }

  async updateOne(id: number, updateDto: DeepPartial<Entity>) {
    const existRecord = await this.findOne(id);
    if (!existRecord) throw new NotFoundException('Запись не найдена');

    try {
      const mergedRecord = this.repository.merge(existRecord, updateDto);
      const savedRecord = await this.repository.save(mergedRecord);
      return savedRecord;
    } catch (error) {
      this.logger.error(
        `Ошибка при обновлении записи: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Ошибка при обновлении записи');
    }
  }

  async deleteOne(id: number) {
    const existRecord = await this.findOne(id);
    if (!existRecord) throw new NotFoundException('Запись не найдена');

    try {
      const savedRecord = await this.repository.delete(id);
      return savedRecord;
    } catch (error) {
      this.logger.error(
        `Ошибка при удалении записи: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Ошибка при удалении записи');
    }
  }

  /**
   * Получает параметры поиска для запроса
   */
  protected async getQueryOptions(
    id?: number,
    options?: TEntityOptions<Entity> | TEntityListOptions<Entity>,
  ): Promise<
    (FindOneOptions<Entity> | FindManyOptions<Entity>) & ExtendedFindOptions
  > {
    // Создаем базовые опции запроса
    let queryOptions: FindOneOptions<Entity> & ExtendedFindOptions = {
      loadEagerRelations: true,
    };

    // Если был передан ID, устанавливаем условие поиска по ID
    if (id !== undefined) {
      queryOptions.where = { id } as any;
    }

    // Если переданы какие-то опции, обрабатываем их
    if (options) {
      // Получаем все поля сущности из метаданных
      const entityColumns = this.repository.metadata.columns.map(
        (col) => col.propertyName,
      );

      // Обработка исключаемых полей
      let excludeFields: string[] = [...this.excludeAlwaysFields];
      if (options.exclude) {
        excludeFields = excludeFields.concat(
          options.exclude.split(',').map((field) => field.trim()),
        );
      }

      // Формируем select с учетом исключенных полей для основной сущности
      const mainExcludes = excludeFields.filter(
        (field) => !field.includes('.'),
      );
      const selectedFields = entityColumns.reduce(
        (acc, column) => {
          if (!mainExcludes.includes(column)) {
            acc[column] = true;
          }
          return acc;
        },
        {} as Record<string, boolean>,
      );

      // Устанавливаем select в опциях запроса
      queryOptions.select = selectedFields as any;

      // Устанавливаем отношения (relations) с учетом exclude
      if (options.relations) {
        let relationNames: string[];

        if (typeof options.relations === 'string') {
          relationNames = options.relations.split(',').map((r) => r.trim());
        } else if (Array.isArray(options.relations)) {
          relationNames = options.relations;
        } else {
          relationNames = Object.keys(options.relations);
        }

        // Обрабатываем каждую relation
        const relations: string[] = [];

        for (const relation of relationNames) {
          // Проверяем, не исключена ли вся relation целиком
          if (!excludeFields.includes(relation)) {
            relations.push(relation);
          }
        }

        if (relations.length > 0) {
          queryOptions.relations = relations;

          // Если есть исключаемые поля для relations, настраиваем select
          const relationExcludes = excludeFields.filter((field) =>
            field.includes('.'),
          );
          if (relationExcludes.length > 0) {
            const select = { ...selectedFields } as Record<string, any>;

            for (const relation of relations) {
              const relatedMetadata =
                this.repository.metadata.findRelationWithPropertyPath(relation);
              if (relatedMetadata) {
                const relationFields = relationExcludes
                  .filter((ef) => ef.startsWith(`${relation}.`))
                  .map((ef) => ef.split('.')[1]);

                const relatedColumns =
                  relatedMetadata.inverseEntityMetadata.columns
                    .map((col) => col.propertyName)
                    .filter((column) => !relationFields.includes(column))
                    .reduce(
                      (acc, column) => {
                        acc[column] = true;
                        return acc;
                      },
                      {} as Record<string, boolean>,
                    );

                select[relation] = relatedColumns;
              }
            }

            queryOptions.select = select;
          }
        }
      }

      // Обработка условий поиска (search)
      if (options.search) {
        const where = await this.getWhere(options.search);
        if (where) {
          queryOptions.where =
            id !== undefined ? ({ id, ...where } as any) : where;
        }
      }

      // Обработка сортировки (sort)
      if ('sort' in options && options.sort) {
        queryOptions.order = options.sort;
      }

      // Обработка пагинации
      if ('page' in options && 'pageSize' in options && options) {
        const { page, pageSize } = options;
        const take = pageSize || 10;
        const skip = ((page || 1) - 1) * take;

        queryOptions.skip = skip;
        queryOptions.take = take;
      }
    }

    return queryOptions;
  }

  /**
   * Находит запись по ID с учетом выбора полей
   */
  async findOne(id: number, options?: TEntityOptions<Entity>) {
    // Парсим search, если это строка
    if (options && typeof options.search === 'string') {
      try {
        options.search = JSON.parse(options.search);
      } catch {
        throw new BadRequestException('search должен быть валидным JSON');
      }
    }
    // Парсим sort, если это строка
    if (options && typeof options.sort === 'string') {
      try {
        options.sort = JSON.parse(options.sort);
      } catch {
        throw new BadRequestException('sort должен быть валидным JSON');
      }
    }
    try {
      const queryOptions = await this.getQueryOptions(id, options);
      const result = await this.repository.findOne(queryOptions);

      if (!result) return null;

      return result;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении записи по ID [${id}]: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Ошибка при получении записи: ${error.message}`,
      );
    }
  }

  /**
   * Находит все записи с учетом выбора полей и пагинации
   */
  async findAll(options?: TEntityListOptions<Entity>) {
    // Парсим search, если это строка
    if (options && typeof options.search === 'string') {
      try {
        options.search = JSON.parse(options.search);
      } catch {
        throw new BadRequestException('search должен быть валидным JSON');
      }
    }
    // Парсим sort, если это строка
    if (options && typeof options.sort === 'string') {
      try {
        options.sort = JSON.parse(options.sort);
      } catch {
        throw new BadRequestException('sort должен быть валидным JSON');
      }
    }
    try {
      const queryOptions = await this.getQueryOptions(undefined, options);
      const isPaginated = 'take' in queryOptions && queryOptions.take;
      let results, total;

      if (isPaginated) {
        [results, total] = await this.repository.findAndCount(queryOptions);
      } else {
        results = await this.repository.find(queryOptions);
        total = results.length;
      }

      if (isPaginated) {
        // Создаем мета-данные пагинации
        const page = options?.page ?? 1;
        const pageSize = options?.pageSize ?? 10;
        const meta = this.createPaginationMetaData(total, page, pageSize);

        // Возвращаем объект с данными и мета-информацией
        return {
          records: results,
          meta,
        };
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении списка записей: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Ошибка при получении списка записей: ${error.message}`,
      );
    }
  }

  /**
   * Формирует условия WHERE для запроса с поддержкой операторов (and, or, not, like, in, from, to, isNull, gt, lt, gte, lte, startsWith, endsWith)
   */
  async getWhere(
    search: TSearchOptions<Entity>,
  ): Promise<FindOptionsWhere<Entity>> {
    if (!search) return {};

    // OR
    if (
      typeof search === 'object' &&
      'or' in search &&
      Array.isArray((search as any).or)
    ) {
      // TypeORM: where: [ {...}, {...} ]
      return (await Promise.all(
        (search as any).or.map((cond: any) => this.getWhere(cond)),
      )) as any;
    }

    // AND
    if (
      typeof search === 'object' &&
      'and' in search &&
      Array.isArray((search as any).and)
    ) {
      // Объединяем все условия в один объект
      const andObjects = await Promise.all(
        (search as any).and.map((cond: any) => this.getWhere(cond)),
      );
      return Object.assign({}, ...andObjects);
    }

    // NOT
    if (typeof search === 'object' && 'not' in search) {
      return Not(await this.getWhere((search as any).not)) as any;
    }

    // Обычные поля
    const where: FindOptionsWhere<Entity> = {};
    for (const [key, value] of Object.entries(search)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // BETWEEN по gt/gte и lt/lte
        if (
          ('gt' in value || 'gte' in value) &&
          ('lt' in value || 'lte' in value)
        ) {
          const from = value.gte ?? value.gt;
          const to = value.lte ?? value.lt;
          if (from !== undefined && to !== undefined) {
            where[key] = Between(from, to) as any;
            continue;
          }
        }
        // LIKE
        if ('like' in value) {
          where[key] = ILike(`%${value.like}%`) as any;
          continue;
        }
        // STARTSWITH
        if ('startsWith' in value) {
          where[key] = ILike(`${value.startsWith}%`) as any;
          continue;
        }
        // ENDSWITH
        if ('endsWith' in value) {
          where[key] = ILike(`%${value.endsWith}`) as any;
          continue;
        }
        // IN
        if ('in' in value && Array.isArray(value.in)) {
          where[key] = In(value.in) as any;
          continue;
        }
        // IS NULL
        if ('isNull' in value) {
          where[key] = IsNull() as any;
          continue;
        }
        // BETWEEN (from/to)
        if ('from' in value && 'to' in value) {
          where[key] = Between(value.from, value.to) as any;
          continue;
        }
        // FROM (>=)
        if ('from' in value) {
          where[key] = MoreThanOrEqual(value.from) as any;
          continue;
        }
        // TO (<=)
        if ('to' in value) {
          where[key] = LessThanOrEqual(value.to) as any;
          continue;
        }
        // GT
        if ('gt' in value) {
          where[key] = MoreThan(value.gt) as any;
          continue;
        }
        // GTE
        if ('gte' in value) {
          where[key] = MoreThanOrEqual(value.gte) as any;
          continue;
        }
        // LT
        if ('lt' in value) {
          where[key] = LessThan(value.lt) as any;
          continue;
        }
        // LTE
        if ('lte' in value) {
          where[key] = LessThanOrEqual(value.lte) as any;
          continue;
        }
        // NOT
        if ('not' in value) {
          where[key] = Not(value.not) as any;
          continue;
        }
        // Рекурсивно для вложенных объектов (например, user: { id: 1 })
        where[key] = await this.getWhere(value);
        continue;
      }
      // Примитивные значения
      where[key] = value;
    }
    return where;
  }

  /**
   * Создает метаданные пагинации
   */
  protected createPaginationMetaData(
    total: number,
    page: number,
    limit: number,
  ) {
    const pageCount = Math.ceil(total / limit);

    return {
      total,
      pageCount,
      page: +page,
    };
  }

  /**
   * Находит одну запись по произвольному условию (where)
   * @param where - условия поиска
   * @param options - дополнительные опции запроса
   */
  async findOneBy(
    where: FindOptionsWhere<Entity>,
    options?: TEntityOptions<Entity>,
  ) {
    try {
      const queryOptions = await this.getQueryOptions(undefined, options);
      queryOptions.where = where;
      const result = await this.repository.findOne(queryOptions);
      if (!result) return null;
      return result;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении записи по условию: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Ошибка при получении записи: ${error.message}`,
      );
    }
  }
}

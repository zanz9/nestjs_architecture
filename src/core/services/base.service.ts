import { Logger, NotFoundException } from '@nestjs/common';
import {
  Between,
  DeepPartial,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsSelectByString,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BaseEntity } from '@/core/services/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export type TPaginationOptions = {
  page: number;
  pageSize: number;
};
export type TSearchOptions<T> = FindOptionsWhere<T> | FindOptionsWhere<T>[];
export type TFilterOptions<T> =
  | FindOptionsSelect<T>
  | FindOptionsSelectByString<T>;
export type TSortOptions<T> = FindOptionsOrder<T>;
export type TRelationsOptions = string;

export type TEntityOptions<T> = {
  search?: TSearchOptions<T>;
  filter?: TFilterOptions<T>;
  relations?: string;
};

export class TEntityListOptions<T> {
  pagination?: TPaginationOptions;
  sort?: TSortOptions<T>;
  search?: TSearchOptions<T>;
  filter?: TFilterOptions<T>;
  relations?: string;
}

export abstract class BaseService<Entity extends BaseEntity> {
  private readonly logger = new Logger(BaseService.name);

  constructor(protected repository: Repository<Entity>) {}

  async createOne(
    createDto: DeepPartial<Entity>,
    options?: TEntityOptions<Entity>,
  ) {
    try {
      const createdRecord = this.repository.create(createDto);
      const savedRecord = await this.repository.save(createdRecord);

      return this.findOne(savedRecord.id, options);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async updateOne(
    id: number,
    updateDto: DeepPartial<Entity>,
    options?: TEntityOptions<Entity>,
  ) {
    try {
      const existRecord = await this.findOne(id, options);
      if (!existRecord) {
        throw new NotFoundException('Record not found');
      }

      const mergedRecord = this.repository.merge(existRecord, updateDto);
      const updatedRecord = await this.repository.save(mergedRecord);

      return this.findOne(updatedRecord.id, options);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async deleteOne(id: number, options?: TEntityOptions<Entity>) {
    try {
      const existRecord = await this.findOne(id, options);
      if (!existRecord) {
        throw new NotFoundException('Record not found');
      }

      return this.repository.remove(existRecord);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async findOne(id: number, options?: TEntityListOptions<Entity>) {
    const relationsArray = options?.relations
      ? options.relations.split(',')
      : [];
    return this.repository.findOne({
      where: { ...options?.search, id } as any,
      select: options?.filter,
      relations: relationsArray,
      order: options?.sort,
    });
  }

  async findAll(options?: TEntityListOptions<Entity>) {
    const page = options?.pagination?.page || 1;
    const pageSize = options?.pagination?.pageSize || 10;

    const relationsArray = options?.relations
      ? options.relations.split(',')
      : [];
    const resultWhere = await this.getWhere(options?.search ?? {});
    const resultSkip = (page - 1) * pageSize;

    const [result, total] = await this.repository.findAndCount({
      where: resultWhere,
      // select: options?.filter,
      relations: relationsArray,
      order: options?.sort,
      skip: resultSkip,
      take: pageSize,
    });

    return {
      records: result,
      meta: this.createPaginationMetaData(total, page, pageSize),
    };
  }

  async findAllPaginated(options?: TEntityListOptions<Entity>) {
    const resultWhere = await this.getWhere(options?.search ?? {});

    const page = options?.pagination?.page ?? 1;
    const pageSize = options?.pagination?.pageSize ?? 10;

    const resultSkip = (page - 1) * pageSize;
    const relationsArray = options?.relations
      ? options.relations.split(',')
      : [];

    const [result, total] = await this.repository.findAndCount({
      relations: relationsArray,
      where: resultWhere,
      select: options?.filter,
      order: options?.sort,
      skip: resultSkip,
      take: pageSize,
    });

    return {
      records: result,
      meta: this.createPaginationMetaData(total, page, pageSize),
    };
  }

  async getWhere(search: TSearchOptions<Entity>) {
    let where: FindOptionsWhere<Entity> = { deletedAt: null } as any;

    if (search) {
      Object.entries(search).forEach(([key, value]) => {
        if (
          typeof value === 'object' &&
          (value.from !== undefined ||
            value.to !== undefined ||
            value.like !== undefined)
        ) {
          if (value.from !== undefined && value.to !== undefined) {
            where[key] = Between(value.from, value.to);
            return;
          } else if (value.from !== undefined) {
            where[key] = MoreThanOrEqual(value.from);
            return;
          } else if (value.to !== undefined) {
            where[key] = LessThanOrEqual(value.to);
            return;
          } else if (value.like !== undefined) {
            where[key] = ILike(`%${value.like}%`);
            return;
          }
        } else {
          where[key] = value;
        }
      });
    }

    return where;
  }

  public createPaginationMetaData(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      totalPages,
      page: +page,
    };
  }
}

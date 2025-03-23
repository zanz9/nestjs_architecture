import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import {
  Between,
  DeepPartial,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BaseEntity } from '@/core/services/base.entity';
import {
  TEntityListOptions,
  TEntityOptions,
  TSearchOptions,
} from '../types/requests';

export abstract class BaseService<Entity extends BaseEntity> {
  private readonly logger = new Logger(BaseService.name);

  constructor(protected repository: Repository<Entity>) {}

  async createOne(createDto: DeepPartial<Entity>) {
    try {
      const createdRecord = this.repository.create(createDto);
      return await this.repository.save(createdRecord);
    } catch (error) {
      throw new BadRequestException('Error creating record');
    }
  }

  async updateOne(id: number, updateDto: DeepPartial<Entity>) {
    const existRecord = await this.findOne(id);
    if (!existRecord) throw new NotFoundException('Record not found');
    try {
      const mergedRecord = this.repository.merge(existRecord, updateDto);
      return await this.repository.save(mergedRecord);
    } catch (error) {
      throw new BadRequestException('Error updating record');
    }
  }

  async deleteOne(id: number) {
    const existRecord = await this.findOne(id);
    if (!existRecord) throw new NotFoundException('Record not found');
    try {
      const mergedRecord = this.repository.merge(existRecord, {
        deletedAt: new Date(),
      } as any);
      return await this.repository.save(mergedRecord);
    } catch (error) {
      throw new BadRequestException('Error deleting record');
    }
    // try {
    // const existRecord = await this.findOne(id, options);
    // if (!existRecord) throw new NotFoundException('Record not found');
    // return this.repository.remove(existRecord);
    // } catch (error) {
    //   this.logger.error(error);
    //   throw new BadRequestException('Error deleting record');
    // }
  }

  async findOne(id: number, options?: TEntityOptions<Entity>) {
    const relationsArray = options?.relations
      ? options.relations.split(',')
      : [];
    return this.repository.findOne({
      where: { ...options?.search, id } as any,
      select: options?.filter,
      relations: relationsArray,
    });
  }

  async findAll(options?: TEntityListOptions<Entity>) {
    const page = options?.pagination?.page || 1;
    const size = options?.pagination?.pageSize || 10;

    const relationsArray = options?.relations
      ? options.relations.split(',')
      : [];
    const resultWhere = await this.getWhere(options?.search ?? {});
    const resultSkip = (page - 1) * size;

    console.log(options);
    console.log(options?.pagination?.pageSize);

    const [result, total] = await this.repository.findAndCount({
      where: resultWhere,
      // select: options?.filter,
      relations: relationsArray,
      order: options?.sort,
      skip: resultSkip,
      take: size,
    });

    return {
      records: result,
      meta: this.createPaginationMetaData(total, page, size),
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
    const pageCount = Math.ceil(total / limit);

    return {
      total,
      pageCount,
      page: +page,
    };
  }
}

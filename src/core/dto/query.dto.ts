import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { convertDeepPartial } from '@/core/helpers/convert_deep_partial';
import {
  TEntityListOptions,
  TEntityOptions,
  TFilterOptions,
  TPaginationOptions,
  TSearchOptions,
  TSortOptions,
} from '@/core/types/requests';

export class QueryDto<T> implements TEntityOptions<T> {
  relations?: string;
  @Transform(({ value }) => convertDeepPartial(value))
  search?: TSearchOptions<T>;
  @Transform(({ value }) => convertDeepPartial(value))
  filter?: TFilterOptions<T>;
}

export class QueryPaginationDto implements TPaginationOptions {
  @IsNumber()
  page: number = 1;
  @IsNumber()
  pageSize: number = 10;
}

export class ListQueryDto<T> implements TEntityListOptions<T> {
  relations?: string;
  @Transform(({ value }) => convertDeepPartial(value))
  pagination?: QueryPaginationDto;
  @Transform(({ value }) => convertDeepPartial(value))
  sort?: TSortOptions<T>;
  @Transform(({ value }) => convertDeepPartial(value))
  search?: TSearchOptions<T>;
  @Transform(({ value }) => convertDeepPartial(value))
  filter?: TFilterOptions<T>;
}

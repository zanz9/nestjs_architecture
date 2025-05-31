import {
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsSelectByString,
  FindOptionsWhere,
} from 'typeorm';

export type TSearchOptions<T> = FindOptionsWhere<T> | FindOptionsWhere<T>[];

export type TFilterOptions<T> =
  | FindOptionsSelect<T>
  | FindOptionsSelectByString<T>;

export type TSortOptions<T> = FindOptionsOrder<T>;

export type TPaginationMeta = {
  total: number;
  pageCount: number;
  page: number;
};

export type TPaginatedResponse<T> = {
  records: T[];
  meta: TPaginationMeta;
};

export type TEntityOptions<T> = {
  search?: TSearchOptions<T>;
  filter?: TFilterOptions<T>;
  relations?: string | string[] | Record<string, boolean | any>;
  exclude?: string;
  sort?: TSortOptions<T>;
};

export type TEntityListOptions<T> = TEntityOptions<T> & {
  page?: number;
  pageSize?: number;
};

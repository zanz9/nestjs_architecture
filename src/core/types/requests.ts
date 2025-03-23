import {
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsSelectByString,
  FindOptionsWhere,
} from 'typeorm';

export type TPaginationOptions = {
  page: number;
  pageSize: number;
};
export type TSearchOptions<T> = FindOptionsWhere<T> | FindOptionsWhere<T>[];
export type TFilterOptions<T> =
  | FindOptionsSelect<T>
  | FindOptionsSelectByString<T>;
export type TSortOptions<T> = FindOptionsOrder<T>;

export type TEntityOptions<T> = {
  search?: TSearchOptions<T>;
  filter?: TFilterOptions<T>;
  relations?: string;
};

export type TEntityListOptions<T> = {
  pagination?: TPaginationOptions;
  sort?: TSortOptions<T>;
  search?: TSearchOptions<T>;
  filter?: TFilterOptions<T>;
  relations?: string;
};

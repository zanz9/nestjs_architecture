import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

/**
 * DTO для базовых параметров запроса
 */
export class BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Связанные сущности через запятую (user,profile)',
  })
  @IsOptional()
  @IsString()
  relations?: string;

  @ApiPropertyOptional({
    description:
      'Поля, которые нужно исключить из результата, через запятую (orders,address).',
    type: String,
  })
  @IsOptional()
  @IsString()
  exclude?: string;

  @ApiPropertyOptional({
    description: 'Параметры поиска в формате JSON',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Сортировка, например: {"price":"ASC"} или {"category.name":"DESC"}',
    type: String,
  })
  @IsOptional()
  @IsString()
  sort?: string;
}

/**
 * DTO для запросов со списками и пагинацией
 */
export class PaginatedQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Размер страницы',
    default: 10,
    minimum: 1,
    maximum: 10000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  pageSize?: number;
}

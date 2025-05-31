import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    pageCount?: number;
    page?: number;
  };
  timestamp: string;
}

@Injectable()
export class SuccessInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response: SuccessResponse<T> = {
          timestamp: new Date().toISOString(),
          data: {} as T,
        };

        // Обработка пагинированных ответов
        if (
          data &&
          typeof data === 'object' &&
          'records' in data &&
          'meta' in data
        ) {
          response.data = data.records;
          response.meta = {
            total: data.meta.total,
            pageCount: data.meta.pageCount,
            page: data.meta.page,
          };
        } else {
          response.data = data;
        }

        return response;
      }),
    );
  }
}

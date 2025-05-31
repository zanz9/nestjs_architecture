import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  errorName: string;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      catchError((error) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Внутренняя ошибка сервера';
        let errorName = 'InternalServerError';

        if (error instanceof HttpException) {
          status = error.getStatus();
          const exceptionResponse = error.getResponse() as any;

          if (typeof exceptionResponse === 'object') {
            message = exceptionResponse.message || error.message;
            errorName = exceptionResponse.error || error.name;
          } else {
            message = exceptionResponse || error.message;
            errorName = error.name;
          }
        } else {
          this.logger.error(
            `Необработанное исключение: ${error.message}`,
            error.stack,
          );
        }

        const errorResponse: ErrorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          errorName,
          message,
        };

        this.logger.error(
          `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
        );

        return throwError(() => errorResponse);
      }),
    );
  }
}

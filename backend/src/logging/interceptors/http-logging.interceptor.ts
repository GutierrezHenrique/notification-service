import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../logger.service';
import { Request, Response } from 'express';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];
    const userId = (request as any).user?.id;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.logHttpRequest(
            method,
            url,
            statusCode,
            duration,
            userId,
            {
              ip,
              userAgent,
              query: request.query,
              params: request.params,
            },
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `HTTP ${method} ${url} failed`,
            error.stack,
            'HttpLoggingInterceptor',
            {
              method,
              url,
              statusCode,
              duration,
              userId,
              ip,
              userAgent,
              error: error.message,
            },
          );
        },
      }),
    );
  }
}

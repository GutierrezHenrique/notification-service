import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../logger.service';
import {
  LOG_ACTION_KEY,
  LogActionOptions,
} from '../decorators/log-action.decorator';
import { Request } from 'express';

@Injectable()
export class ActionLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const controller = context.getClass();

    const logOptions = this.reflector.get<LogActionOptions>(
      LOG_ACTION_KEY,
      handler,
    );

    if (!logOptions) {
      return next.handle();
    }

    const userId = (request as any).user?.id;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const resourceId = this.extractResourceId(request, data);

          // Log business action
          this.logger.logAction(
            logOptions.action,
            logOptions.resource,
            resourceId || 'unknown',
            userId || 'anonymous',
            {
              method: request.method,
              url: request.url,
              ip: request.ip,
              userAgent: request.headers['user-agent'],
              duration,
            },
          );

          // Log audit if required
          if (logOptions.audit) {
            this.logger.logAudit(
              logOptions.action,
              userId || 'anonymous',
              logOptions.resource,
              resourceId || 'unknown',
              this.extractChanges(request),
              {
                method: request.method,
                url: request.url,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
              },
            );
          }

          // Log performance if operation is slow
          if (duration > 1000) {
            this.logger.logPerformance(
              `${logOptions.action}_${logOptions.resource}`,
              duration,
              {
                userId,
                resourceId,
              },
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const resourceId = this.extractResourceId(request);

          this.logger.error(
            `Failed to ${logOptions.action} ${logOptions.resource}`,
            error.stack,
            `${controller.name}.${handler.name}`,
            {
              action: logOptions.action,
              resource: logOptions.resource,
              resourceId,
              userId: userId || 'anonymous',
              method: request.method,
              url: request.url,
              ip: request.ip,
              duration,
            },
          );
        },
      }),
    );
  }

  private extractResourceId(request: Request, data?: any): string | undefined {
    // Try to get ID from route params
    if (request.params?.id) {
      return request.params.id;
    }
    if (request.params?.albumId) {
      return request.params.albumId;
    }
    if (request.params?.photoId) {
      return request.params.photoId;
    }

    // Try to get ID from response data
    if (data?.id) {
      return data.id;
    }
    if (data?.data?.id) {
      return data.data.id;
    }

    return undefined;
  }

  private extractChanges(request: Request): any {
    const body = request.body;
    if (!body || Object.keys(body).length === 0) {
      return null;
    }

    // Remove sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...changes } = body;
    return changes;
  }
}

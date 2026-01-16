import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { validatePayloadSize } from '../utils/validation.util';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Validate request payload size (10MB max)
    if (request.body && !validatePayloadSize(request.body, 10 * 1024 * 1024)) {
      throw new PayloadTooLargeException('Request payload too large');
    }

    return next.handle().pipe(
      map((data) => {
        // Validate response payload size (50MB max)
        if (data && !validatePayloadSize(data, 50 * 1024 * 1024)) {
          // Log but don't throw - might be legitimate large responses
          console.warn('Large response payload detected');
        }

        // Remove sensitive fields and sanitize output
        if (data && typeof data === 'object') {
          return this.sanitizeObject(data);
        }
        return data;
      }),
    );
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Remove password fields
          if (key.toLowerCase().includes('password')) {
            continue;
          }
          // Remove internal fields
          if (key.startsWith('_') || key === 'internal') {
            continue;
          }
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }
}

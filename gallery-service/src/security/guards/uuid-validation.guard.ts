import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { validateUUID } from '../utils/validation.util';

@Injectable()
export class UUIDValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    // Validate all UUID parameters
    for (const key in params) {
      const value = params[key];
      // Skip non-UUID parameters (like shareToken)
      if (
        typeof value === 'string' &&
        value.length === 36 &&
        value.includes('-')
      ) {
        if (!validateUUID(value)) {
          throw new BadRequestException(`Invalid ${key} format`);
        }
      }
    }

    return true;
  }
}

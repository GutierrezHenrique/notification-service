import {
  PipeTransform,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { validatePayloadSize } from '../utils/validation.util';

@Injectable()
export class PayloadSizePipe implements PipeTransform {
  private readonly maxSizeBytes: number;

  constructor(maxSizeBytes: number = 10 * 1024 * 1024) {
    // Default 10MB
    this.maxSizeBytes = maxSizeBytes;
  }

  transform(value: any) {
    if (!validatePayloadSize(value, this.maxSizeBytes)) {
      throw new PayloadTooLargeException(
        `Payload size exceeds maximum of ${this.maxSizeBytes} bytes`,
      );
    }
    return value;
  }
}

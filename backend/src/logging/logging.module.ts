import { Module, Global } from '@nestjs/common';
import { AppLoggerService } from './logger.service';
import { ActionLoggingInterceptor } from './interceptors/action-logging.interceptor';
import { HttpLoggingInterceptor } from './interceptors/http-logging.interceptor';

@Global()
@Module({
  providers: [
    AppLoggerService,
    ActionLoggingInterceptor,
    HttpLoggingInterceptor,
  ],
  exports: [AppLoggerService, ActionLoggingInterceptor, HttpLoggingInterceptor],
})
export class LoggingModule {}

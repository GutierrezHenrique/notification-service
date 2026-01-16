import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000; // 2 seconds

  constructor(private configService: ConfigService) {
    const databaseUrl =
      configService.get<string>('DATABASE_URL') ||
      `postgresql://${configService.get<string>('DB_USERNAME')}:${configService.get<string>('DB_PASSWORD')}@${configService.get<string>('DB_HOST')}:${configService.get<string>('DB_PORT')}/${configService.get<string>('DB_DATABASE')}?schema=public`;

    // Validate database URL
    if (!databaseUrl || !databaseUrl.startsWith('postgresql://')) {
      this.logger.error(
        'Invalid DATABASE_URL. Must start with postgresql://',
      );
      throw new Error('Invalid DATABASE_URL configuration');
    }

    // Log database connection info (without password)
    const urlForLogging = databaseUrl.replace(
      /:\/\/[^:]+:[^@]+@/,
      '://***:***@',
    );
    this.logger.log(`Connecting to database: ${urlForLogging}`);

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Handle Prisma log events
    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma error: ${e.message}`, e.stack);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma warning: ${e.message}`);
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from database');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      this.logger.error(`Error disconnecting from database: ${errorMessage}`);
    }
  }

  private async connectWithRetry(retryCount = 0): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      const errorCode = error.code || 'UNKNOWN';

      this.logger.error(
        `Failed to connect to database (attempt ${retryCount + 1}/${this.maxRetries}): ${errorMessage}`,
        error.stack,
      );

      if (retryCount < this.maxRetries - 1) {
        this.logger.log(
          `Retrying connection in ${this.retryDelay}ms...`,
        );
        await this.delay(this.retryDelay);
        return this.connectWithRetry(retryCount + 1);
      }

      // Last attempt failed
      this.logger.error(
        `Failed to connect to database after ${this.maxRetries} attempts. Error code: ${errorCode}`,
      );
      this.logger.error(
        'Please check:',
        '\n  1. Database server is running',
        '\n  2. DATABASE_URL is correctly configured',
        '\n  3. Database credentials are correct',
        '\n  4. Network connectivity to database server',
      );

      // Re-throw the error so NestJS can handle it
      throw new Error(
        `Database connection failed: ${errorMessage} (Code: ${errorCode})`,
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

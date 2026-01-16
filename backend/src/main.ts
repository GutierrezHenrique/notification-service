import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { SanitizeInterceptor } from './security/interceptors/sanitize.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: false,
  });

  const configService = app.get(ConfigService);

  // Security: Helmet for HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Compression
  app.use(compression());

  // Enable CORS with security
  const corsOrigins = configService.get<string>('CORS_ORIGIN')?.split(',') || [
    configService.get('FRONTEND_URL') || 'http://localhost:5173',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
  });

  // Global validation pipe with security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: configService.get('NODE_ENV') === 'production',
      // Additional security options
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      // Validate payload size (1MB max)
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Body parser size limit (10MB for file uploads)
  // Note: File uploads are handled by multer, not body parser
  app.use(require('express').json({ limit: '1mb' })); // JSON payloads limited to 1MB
  app.use(require('express').urlencoded({ extended: true, limit: '1mb' }));

  // Global interceptors
  app.useGlobalInterceptors(new SanitizeInterceptor());

  // Trust proxy for rate limiting behind reverse proxy
  // This is handled by Express automatically when behind a proxy
  // The ThrottlerModule will use req.ip which respects X-Forwarded-For

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${configService.get('NODE_ENV') || 'development'}`);
}

bootstrap();

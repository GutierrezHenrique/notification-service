import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000'), // 1 minute
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per minute
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60'), // 60 seconds
    limit: parseInt(process.env.THROTTLE_LIMIT || '10'), // 10 requests per minute
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  },
}));

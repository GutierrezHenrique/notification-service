import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: Logger;
  private readonly logsDir = path.join(process.cwd(), 'logs');

  constructor() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        isDevelopment ? format.colorize() : format.json(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          if (isDevelopment) {
            return `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`;
          }
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
          });
        }),
      ),
      defaultMeta: {
        service: 'mygallery-backend',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        // Console transport
        new transports.Console({
          format: isDevelopment
            ? format.combine(format.colorize(), format.simple())
            : format.json(),
        }),
        // File transport for errors
        new transports.File({
          filename: path.join(this.logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File transport for all logs
        new transports.File({
          filename: path.join(this.logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File transport for audit logs
        new transports.File({
          filename: path.join(this.logsDir, 'audit.log'),
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        }),
      ],
    });
  }

  log(message: string, context?: string, meta?: LogContext) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: LogContext) {
    this.logger.error(message, {
      trace,
      context,
      ...meta,
    });
  }

  warn(message: string, context?: string, meta?: LogContext) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: LogContext) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: LogContext) {
    this.logger.verbose(message, { context, ...meta });
  }

  /**
   * Log business actions (CRUD operations, etc.)
   */
  logAction(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    metadata?: LogContext,
  ) {
    this.logger.info('Business action', {
      type: 'business_action',
      action,
      resource,
      resourceId,
      userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: LogContext,
  ) {
    this.logger.warn('Security event', {
      type: 'security_event',
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Log audit trail for sensitive operations
   */
  logAudit(
    action: string,
    userId: string,
    resource: string,
    resourceId: string,
    changes?: any,
    metadata?: LogContext,
  ) {
    this.logger.info('Audit log', {
      type: 'audit',
      action,
      userId,
      resource,
      resourceId,
      changes,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Log HTTP requests
   */
  logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    metadata?: LogContext,
  ) {
    const level =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    this.logger[level]('HTTP request', {
      type: 'http_request',
      method,
      url,
      statusCode,
      duration,
      userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, metadata?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'info';

    this.logger[level]('Performance metric', {
      type: 'performance',
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }
}

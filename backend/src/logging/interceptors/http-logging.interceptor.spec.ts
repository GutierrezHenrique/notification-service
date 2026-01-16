import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { AppLoggerService } from '../logger.service';

describe('HttpLoggingInterceptor', () => {
  let interceptor: HttpLoggingInterceptor;
  let logger: jest.Mocked<AppLoggerService>;

  const mockLogger = {
    logHttpRequest: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpLoggingInterceptor,
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    interceptor = module.get<HttpLoggingInterceptor>(HttpLoggingInterceptor);
    logger = module.get(AppLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log successful HTTP requests', (done) => {
    const request = {
      method: 'GET',
      url: '/test',
      ip: '192.168.1.1',
      headers: { 'user-agent': 'test-agent' },
      query: {},
      params: {},
      user: { id: 'user-123' },
    };

    const response = {
      statusCode: 200,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;

    const handler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe(() => {
      expect(logger.logHttpRequest).toHaveBeenCalled();
      done();
    });
  });

  it('should log errors', (done) => {
    const request = {
      method: 'GET',
      url: '/test',
      ip: '192.168.1.1',
      headers: { 'user-agent': 'test-agent' },
      query: {},
      params: {},
    };

    const response = {
      statusCode: 200,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;

    const error = new Error('Test error');
    (error as any).status = 500;

    const handler = {
      handle: () => throwError(() => error),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe({
      error: () => {
        expect(logger.error).toHaveBeenCalled();
        done();
      },
    });
  });
});

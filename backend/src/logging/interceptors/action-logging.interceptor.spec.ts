import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { ActionLoggingInterceptor } from './action-logging.interceptor';
import { AppLoggerService } from '../logger.service';

describe('ActionLoggingInterceptor', () => {
  let interceptor: ActionLoggingInterceptor;
  let logger: jest.Mocked<AppLoggerService>;

  const mockLogger = {
    logAction: jest.fn(),
    logAudit: jest.fn(),
    logPerformance: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionLoggingInterceptor,
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    interceptor = module.get<ActionLoggingInterceptor>(
      ActionLoggingInterceptor,
    );
    logger = module.get(AppLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log action when @LogAction decorator is present', (done) => {
    const request = {
      method: 'POST',
      url: '/albums',
      ip: '192.168.1.1',
      headers: { 'user-agent': 'test-agent' },
      params: {},
      body: {},
      user: { id: 'user-123' },
    };

    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    mockReflector.get.mockReturnValue({
      action: 'create',
      resource: 'album',
      audit: false,
    });

    const handler = {
      handle: () => of({ id: 'album-123' }),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe(() => {
      expect(logger.logAction).toHaveBeenCalled();
      done();
    });
  });

  it('should not log if @LogAction decorator is not present', (done) => {
    const request = {
      method: 'GET',
      url: '/albums',
      ip: '192.168.1.1',
      headers: { 'user-agent': 'test-agent' },
    };

    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    mockReflector.get.mockReturnValue(null);

    const handler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe(() => {
      expect(logger.logAction).not.toHaveBeenCalled();
      done();
    });
  });

  it('should log audit when audit is true', (done) => {
    const request = {
      method: 'PATCH',
      url: '/albums/album-123',
      ip: '192.168.1.1',
      headers: { 'user-agent': 'test-agent' },
      params: { id: 'album-123' },
      body: { title: 'Updated' },
      user: { id: 'user-123' },
    };

    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    mockReflector.get.mockReturnValue({
      action: 'update',
      resource: 'album',
      audit: true,
    });

    const handler = {
      handle: () => of({ id: 'album-123' }),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe(() => {
      expect(logger.logAudit).toHaveBeenCalled();
      done();
    });
  });
});

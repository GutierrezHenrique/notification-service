import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { SanitizeInterceptor } from './sanitize.interceptor';

describe('SanitizeInterceptor', () => {
  let interceptor: SanitizeInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SanitizeInterceptor],
    }).compile();

    interceptor = module.get<SanitizeInterceptor>(SanitizeInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should remove password fields from response', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ body: {} }),
      }),
    } as ExecutionContext;
    const handler = {
      handle: () =>
        of({ id: '123', email: 'test@example.com', password: 'secret' }),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      done();
    });
  });

  it('should remove internal fields from response', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ body: {} }),
      }),
    } as ExecutionContext;
    const handler = {
      handle: () => of({ id: '123', _internal: 'data', internal: 'data' }),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).not.toHaveProperty('_internal');
      expect(result).not.toHaveProperty('internal');
      expect(result).toHaveProperty('id');
      done();
    });
  });

  it('should sanitize arrays', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ body: {} }),
      }),
    } as ExecutionContext;
    const handler = {
      handle: () =>
        of([
          { id: '1', password: 'secret' },
          { id: '2', password: 'secret2' },
        ]),
    } as CallHandler;

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      done();
    });
  });
});

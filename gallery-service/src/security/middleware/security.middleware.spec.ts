import { Test, TestingModule } from '@nestjs/testing';
import { SecurityMiddleware } from './security.middleware';
import { Request, Response, NextFunction } from 'express';

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityMiddleware],
    }).compile();

    middleware = module.get<SecurityMiddleware>(SecurityMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should add security headers', () => {
    const req = {} as Request;
    const res = {
      removeHeader: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Response;
    const next: NextFunction = jest.fn();

    middleware.use(req, res, next);

    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-XSS-Protection',
      '1; mode=block',
    );
    expect(next).toHaveBeenCalled();
  });
});

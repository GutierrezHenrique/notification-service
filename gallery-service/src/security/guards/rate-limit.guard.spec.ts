import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { CustomThrottlerGuard } from './rate-limit.guard';
import { ThrottlerException, ThrottlerModule } from '@nestjs/throttler';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 100,
          },
        ]),
      ],
      providers: [CustomThrottlerGuard, Reflector],
    }).compile();

    guard = module.get<CustomThrottlerGuard>(CustomThrottlerGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should use user ID as tracker if user is authenticated', async () => {
    const req = {
      user: { id: 'user-123' },
      ip: '192.168.1.1',
    };

    const tracker = await guard['getTracker'](req as any);
    expect(tracker).toBe('user-user-123');
  });

  it('should use IP as tracker if user is not authenticated', async () => {
    const req = {
      ip: '192.168.1.1',
    };

    const tracker = await guard['getTracker'](req as any);
    expect(tracker).toBe('ip-192.168.1.1');
  });

  it('should throw ThrottlerException with custom message', async () => {
    await expect(guard['throwThrottlingException']()).rejects.toThrow(
      ThrottlerException,
    );
  });
});

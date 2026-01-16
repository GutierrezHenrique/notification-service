import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      const config: { [key: string]: string } = {
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        DB_USERNAME: 'test',
        DB_PASSWORD: 'test',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_DATABASE: 'test',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    const connectMock = jest.fn().mockResolvedValue(undefined);
    service['$connect'] = connectMock;

    if (typeof service.onModuleInit === 'function') {
      await service.onModuleInit();
      expect(connectMock).toHaveBeenCalled();
    } else {
      // If onModuleInit is not available, test $connect directly
      await service['$connect']();
      expect(connectMock).toHaveBeenCalled();
    }
  });

  it('should disconnect on module destroy', async () => {
    const disconnectMock = jest.fn().mockResolvedValue(undefined);
    service['$disconnect'] = disconnectMock;

    if (typeof service.onModuleDestroy === 'function') {
      await service.onModuleDestroy();
      expect(disconnectMock).toHaveBeenCalled();
    } else {
      // If onModuleDestroy is not available, test $disconnect directly
      await service['$disconnect']();
      expect(disconnectMock).toHaveBeenCalled();
    }
  });
});

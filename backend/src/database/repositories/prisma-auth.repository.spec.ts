import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaAuthRepository } from './prisma-auth.repository';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('PrismaAuthRepository', () => {
  let repository: PrismaAuthRepository;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAuthRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<PrismaAuthRepository>(PrismaAuthRepository);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const prismaUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(prismaUser as any);

      const result = await repository.findOneByEmail('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBeInstanceOf(Object);
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});

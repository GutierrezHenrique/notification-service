import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaUsersRepository } from './prisma-users.repository';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('PrismaUsersRepository', () => {
  let repository: PrismaUsersRepository;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<PrismaUsersRepository>(PrismaUsersRepository);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const prismaUser = {
        id: 'user-123',
        email: createUserDto.email,
        password: 'hashedPassword',
        name: createUserDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.create.mockResolvedValue(prismaUser as any);

      const result = await repository.create(createUserDto);

      expect(prismaService.user.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Object);
      expect(result.email).toBe(createUserDto.email);
    });
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

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const prismaUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(prismaUser as any);

      const result = await repository.findOneById('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toBeInstanceOf(Object);
      expect(result?.id).toBe('user-123');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { mockUser } from '../../../test/fixtures/user.fixture';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate user credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const userWithoutPassword = {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    };

    authService.validateUser.mockResolvedValue(userWithoutPassword as any);

    const result = await strategy.validate(email, password);

    expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    expect(result).toEqual(userWithoutPassword);
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    const email = 'test@example.com';
    const password = 'wrongpassword';

    authService.validateUser.mockResolvedValue(null);

    await expect(strategy.validate(email, password)).rejects.toThrow();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { ValidateUserUseCase } from './use-cases/validate-user.use-case';
import { mockUser } from '../../test/fixtures/user.fixture';

describe('AuthService', () => {
  let service: AuthService;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let validateUserUseCase: jest.Mocked<ValidateUserUseCase>;

  const mockLoginUseCase = {
    execute: jest.fn(),
  };

  const mockRegisterUseCase = {
    execute: jest.fn(),
  };

  const mockValidateUserUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: RegisterUseCase,
          useValue: mockRegisterUseCase,
        },
        {
          provide: ValidateUserUseCase,
          useValue: mockValidateUserUseCase,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    loginUseCase = module.get(LoginUseCase);
    registerUseCase = module.get(RegisterUseCase);
    validateUserUseCase = module.get(ValidateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
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

      validateUserUseCase.execute.mockResolvedValue(userWithoutPassword as any);

      const result = await service.validateUser(email, password);

      expect(validateUserUseCase.execute).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(userWithoutPassword);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResult = {
        access_token: 'token',
        user: { id: 'user-123', email: 'test@example.com', name: 'Test' },
      };

      loginUseCase.execute.mockResolvedValue(loginResult);

      const result = await service.login(loginDto);

      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResult);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const registerResult = {
        access_token: 'token',
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      };

      registerUseCase.execute.mockResolvedValue(registerResult);

      const result = await service.register(createUserDto);

      expect(registerUseCase.execute).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(registerResult);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        user: {
          id: 'user-123',
          email: createUserDto.email,
          name: createUserDto.name,
        },
      };

      service.register.mockResolvedValue(registerResult);

      const result = await controller.register(createUserDto);

      expect(service.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(registerResult);
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
        user: {
          id: 'user-123',
          email: loginDto.email,
          name: 'Test User',
        },
      };

      service.login.mockResolvedValue(loginResult);

      const req = { user: { id: 'user-123' } } as any;
      const result = await controller.login(req, loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResult);
    });
  });
});

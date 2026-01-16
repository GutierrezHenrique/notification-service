import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from './register.use-case';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { mockUser } from '../../../test/fixtures/user.fixture';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUsersService = {
    create: jest.fn(),
    findOneByEmail: jest.fn(),
    findOneById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user and return access token', async () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    usersService.create.mockResolvedValue(mockUser);
    jwtService.sign.mockReturnValue('mock-jwt-token');

    const result = await useCase.execute(createUserDto);

    expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('user');
    expect(result.user).not.toHaveProperty('password');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { mockUser } from '../../../test/fixtures/user.fixture';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
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
        LoginUseCase,
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

    useCase = module.get<LoginUseCase>(LoginUseCase);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return access token and user on successful login', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    usersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mock-jwt-token');

    const result = await useCase.execute(loginDto);

    expect(usersService.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.password,
    );
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('user');
  });

  it('should throw UnauthorizedException on invalid credentials - user not found', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    usersService.findOneByEmail.mockResolvedValue(null);

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException on invalid credentials - wrong password', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    usersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

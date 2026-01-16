import { Test, TestingModule } from '@nestjs/testing';
import { ValidateUserUseCase } from './validate-user.use-case';
import { AuthRepository } from '../repositories/auth.repository';
import { mockUser } from '../../../test/fixtures/user.fixture';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ValidateUserUseCase', () => {
  let useCase: ValidateUserUseCase;
  let repository: jest.Mocked<AuthRepository>;

  const mockRepository = {
    findOneByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserUseCase,
        {
          provide: AuthRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
    repository = module.get(AuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user without password if credentials are valid', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    repository.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute(email, password);

    expect(repository.findOneByEmail).toHaveBeenCalledWith(email);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    expect(result).toBeDefined();
    expect(result).not.toHaveProperty('password');
  });

  it('should return null if user not found', async () => {
    const email = 'nonexistent@example.com';
    const password = 'password123';

    repository.findOneByEmail.mockResolvedValue(null);

    const result = await useCase.execute(email, password);

    expect(result).toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should return null if password is incorrect', async () => {
    const email = 'test@example.com';
    const password = 'wrongpassword';

    repository.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await useCase.execute(email, password);

    expect(result).toBeNull();
  });
});

import { Injectable } from '@nestjs/common';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { ValidateUserUseCase } from './use-cases/validate-user.use-case';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserWithoutPassword } from './types/user-without-password.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly validateUserUseCase: ValidateUserUseCase,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    return this.validateUserUseCase.execute(email, password);
  }

  async login(loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  async register(createUserDto: CreateUserDto) {
    return this.registerUseCase.execute(createUserDto);
  }
}

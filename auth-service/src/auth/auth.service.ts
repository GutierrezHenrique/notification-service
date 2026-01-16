import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { ValidateUserUseCase } from './use-cases/validate-user.use-case';
import { GoogleLoginUseCase } from './use-cases/google-login.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserWithoutPassword } from './types/user-without-password.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly validateUserUseCase: ValidateUserUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly jwtService: JwtService,
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

  async validateToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      return { valid: true, userId: decoded.sub, email: decoded.email };
    } catch (error) {
      return { valid: false };
    }
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    profilePicture?: string;
  }) {
    return this.googleLoginUseCase.execute(googleUser);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(resetPasswordDto);
  }
}

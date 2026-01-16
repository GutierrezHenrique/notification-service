import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword } from '../types/user-without-password.interface';

@Injectable()
export class ValidateUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.authRepository.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as UserWithoutPassword;
    }

    return null;
  }
}

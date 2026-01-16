import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersRepository } from './repositories/users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    return this.usersRepository.create(createUserDto);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneByEmail(email);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOneById(id);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Verificar se o usuário está tentando alterar o email
    if (data.email !== undefined) {
      const user = await this.usersRepository.findOneById(id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verificar se o usuário fez login via OAuth
      if (user.provider === 'google' || user.googleId) {
        throw new BadRequestException(
          'Usuários que fizeram login com provedor OAuth não podem alterar o email',
        );
      }

      // Verificar se o email já está em uso por outro usuário
      if (data.email !== user.email) {
        const existingUser = await this.usersRepository.findOneByEmail(
          data.email,
        );
        if (existingUser && existingUser.id !== id) {
          throw new ConflictException('Email already registered');
        }
      }
    }

    return this.usersRepository.update(id, data);
  }

  async findOneByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOneByGoogleId(googleId);
  }

  async findOneByPasswordResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOneByPasswordResetToken(token);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verificar se o usuário fez login via OAuth (não tem senha)
    if (user.provider === 'google' || !user.password) {
      throw new BadRequestException(
        'Usuários que fizeram login com Google não podem alterar a senha',
      );
    }

    // Verificar se a senha atual está correta
    if (
      !(await bcrypt.compare(changePasswordDto.currentPassword, user.password))
    ) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Atualizar senha
    await this.usersRepository.update(userId, {
      password: hashedPassword,
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findOneById(id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.usersRepository.delete(id);
  }
}

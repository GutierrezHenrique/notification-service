import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = createUserDto.password
      ? await bcrypt.hash(createUserDto.password, 10)
      : null;

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        provider: createUserDto.password ? 'local' : 'google',
      },
    });

    return this.mapToEntity(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Buscar o usuário atual para verificar se é OAuth
    const currentUser = await this.prisma.user.findUnique({
      where: { id },
    });

    // Não permitir alteração de email para usuários OAuth
    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.password !== undefined && { password: data.password }),
      ...(data.provider !== undefined && { provider: data.provider }),
      ...(data.googleId !== undefined && { googleId: data.googleId }),
      ...(data.profilePicture !== undefined && {
        profilePicture: data.profilePicture,
      }),
      ...(data.passwordResetToken !== undefined && {
        passwordResetToken: data.passwordResetToken,
      }),
      ...(data.passwordResetExpires !== undefined && {
        passwordResetExpires: data.passwordResetExpires,
      }),
      ...(data.emailVerificationToken !== undefined && {
        emailVerificationToken: data.emailVerificationToken,
      }),
      ...(data.emailVerified !== undefined && {
        emailVerified: data.emailVerified,
      }),
    };

    // Só permitir alteração de email se o usuário não for OAuth
    if (
      data.email &&
      currentUser &&
      currentUser.provider !== 'google' &&
      !currentUser.googleId
    ) {
      updateData.email = data.email;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(user);
  }

  async findOneByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findOneByPasswordResetToken(token: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
      },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private mapToEntity(prismaUser: any): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      name: prismaUser.name,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      provider: prismaUser.provider,
      googleId: prismaUser.googleId,
      profilePicture: prismaUser.profilePicture,
      passwordResetToken: prismaUser.passwordResetToken,
      passwordResetExpires: prismaUser.passwordResetExpires,
      emailVerificationToken: prismaUser.emailVerificationToken,
      emailVerified: prismaUser.emailVerified,
    });
  }
}

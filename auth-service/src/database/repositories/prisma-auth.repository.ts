import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findOneByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    return user ? this.mapToEntity(user) : null;
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

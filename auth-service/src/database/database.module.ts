import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { AuthRepository } from '../auth/repositories/auth.repository';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    JwtService,
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: AuthRepository,
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [UsersRepository, AuthRepository, PrismaService],
})
export class DatabaseModule {}

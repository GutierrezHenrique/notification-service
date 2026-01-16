import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { AlbumsRepository } from '../albums/repositories/albums.repository';
import { PhotosRepository } from '../photos/repositories/photos.repository';
import { AuthRepository } from '../auth/repositories/auth.repository';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { PrismaAlbumsRepository } from './repositories/prisma-albums.repository';
import { PrismaPhotosRepository } from './repositories/prisma-photos.repository';
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
      provide: AlbumsRepository,
      useClass: PrismaAlbumsRepository,
    },
    {
      provide: PhotosRepository,
      useClass: PrismaPhotosRepository,
    },
    {
      provide: AuthRepository,
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [
    UsersRepository,
    AlbumsRepository,
    PhotosRepository,
    AuthRepository,
  ],
})
export class DatabaseModule {}

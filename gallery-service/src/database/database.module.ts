import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AlbumsRepository } from '../albums/repositories/albums.repository';
import { PhotosRepository } from '../photos/repositories/photos.repository';
import { PrismaAlbumsRepository } from './repositories/prisma-albums.repository';
import { PrismaPhotosRepository } from './repositories/prisma-photos.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: AlbumsRepository,
      useClass: PrismaAlbumsRepository,
    },
    {
      provide: PhotosRepository,
      useClass: PrismaPhotosRepository,
    },
  ],
  exports: [
    AlbumsRepository,
    PhotosRepository,
    PrismaService,
  ],
})
export class DatabaseModule {}

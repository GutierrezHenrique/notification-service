import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  PhotosRepository,
  CreatePhotoData,
} from '../../photos/repositories/photos.repository';
import { Photo } from '../../domain/entities/photo.entity';
import { Album } from '../../domain/entities/album.entity';
import { UpdatePhotoDto } from '../../photos/dto/update-photo.dto';

@Injectable()
export class PrismaPhotosRepository implements PhotosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    albumId: string,
    createPhotoData: CreatePhotoData,
  ): Promise<Photo> {
    const photo = await this.prisma.photo.create({
      data: {
        title: createPhotoData.title,
        description: createPhotoData.description,
        filename: createPhotoData.filename,
        originalName: createPhotoData.originalName,
        mimeType: createPhotoData.mimeType,
        size: BigInt(createPhotoData.size),
        acquisitionDate: createPhotoData.acquisitionDate,
        dominantColor: createPhotoData.dominantColor,
        albumId,
      },
      include: {
        album: true,
      },
    });

    return this.mapToEntity(photo);
  }

  async findAll(
    albumId: string,
    orderBy: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50,
  ): Promise<{ photos: Photo[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      this.prisma.photo.findMany({
        where: { albumId },
        include: {
          album: true,
        },
        orderBy: {
          acquisitionDate: orderBy,
        },
        skip,
        take: limit,
      }),
      this.prisma.photo.count({
        where: { albumId },
      }),
    ]);

    return {
      photos: photos.map((photo) => this.mapToEntity(photo)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Photo | null> {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: {
        album: true,
      },
    });

    return photo ? this.mapToEntity(photo) : null;
  }

  async update(id: string, updatePhotoDto: UpdatePhotoDto): Promise<Photo> {
    const photo = await this.prisma.photo.update({
      where: { id },
      data: {
        title: updatePhotoDto.title,
        description: updatePhotoDto.description,
      },
      include: {
        album: true,
      },
    });

    return this.mapToEntity(photo);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.photo.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.photo.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async search(
    userId: string,
    query: string,
    orderBy: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50,
  ): Promise<{ photos: Photo[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const searchQuery = query.trim();

    const where = {
      album: {
        userId,
      },
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: searchQuery,
            mode: 'insensitive' as const,
          },
        },
        {
          originalName: {
            contains: searchQuery,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [photos, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        include: {
          album: true,
        },
        orderBy: {
          acquisitionDate: orderBy,
        },
        skip,
        take: limit,
      }),
      this.prisma.photo.count({
        where,
      }),
    ]);

    return {
      photos: photos.map((photo) => this.mapToEntity(photo)),
      total,
      page,
      limit,
    };
  }

  private mapToEntity(prismaPhoto: any): Photo {
    const album = prismaPhoto.album
      ? new Album({
          id: prismaPhoto.album.id,
          title: prismaPhoto.album.title,
          description: prismaPhoto.album.description,
          userId: prismaPhoto.album.userId,
          createdAt: prismaPhoto.album.createdAt,
          updatedAt: prismaPhoto.album.updatedAt,
        })
      : undefined;

    return new Photo({
      id: prismaPhoto.id,
      title: prismaPhoto.title,
      description: prismaPhoto.description,
      filename: prismaPhoto.filename,
      originalName: prismaPhoto.originalName,
      mimeType: prismaPhoto.mimeType,
      size: Number(prismaPhoto.size),
      acquisitionDate: prismaPhoto.acquisitionDate,
      dominantColor: prismaPhoto.dominantColor,
      albumId: prismaPhoto.albumId,
      album,
      createdAt: prismaPhoto.createdAt,
      updatedAt: prismaPhoto.updatedAt,
    });
  }
}

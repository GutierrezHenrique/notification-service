import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlbumsRepository } from '../../albums/repositories/albums.repository';
import { Album } from '../../domain/entities/album.entity';
import { Photo } from '../../domain/entities/photo.entity';
import { CreateAlbumDto } from '../../albums/dto/create-album.dto';
import { UpdateAlbumDto } from '../../albums/dto/update-album.dto';

@Injectable()
export class PrismaAlbumsRepository implements AlbumsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createAlbumDto: CreateAlbumDto): Promise<Album> {
    const album = await this.prisma.album.create({
      data: {
        title: createAlbumDto.title,
        description: createAlbumDto.description,
        userId,
      },
      include: {
        photos: true,
      },
    });

    return this.mapToEntity(album);
  }

  async findAll(userId: string): Promise<Album[]> {
    const albums = await this.prisma.album.findMany({
      where: { userId },
      include: {
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return albums.map((album) => this.mapToEntity(album));
  }

  async findOne(id: string): Promise<Album | null> {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        photos: true,
      },
    });

    return album ? this.mapToEntity(album) : null;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const album = await this.prisma.album.update({
      where: { id },
      data: {
        title: updateAlbumDto.title,
        description: updateAlbumDto.description,
      },
      include: {
        photos: true,
      },
    });

    return this.mapToEntity(album);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.album.delete({
      where: { id },
    });
  }

  async findByShareToken(shareToken: string): Promise<Album | null> {
    const album = await this.prisma.album.findUnique({
      where: { shareToken },
      include: {
        photos: true,
      },
    });

    return album ? this.mapToEntity(album) : null;
  }

  async updateSharing(
    id: string,
    isPublic: boolean,
    shareToken?: string,
  ): Promise<Album> {
    const album = await this.prisma.album.update({
      where: { id },
      data: {
        isPublic,
        shareToken: isPublic ? shareToken : null,
      },
      include: {
        photos: true,
      },
    });

    return this.mapToEntity(album);
  }

  private mapToEntity(prismaAlbum: any): Album {
    const photos = prismaAlbum.photos
      ? prismaAlbum.photos.map(
          (photo: any) =>
            new Photo({
              id: photo.id,
              title: photo.title,
              description: photo.description,
              filename: photo.filename,
              originalName: photo.originalName,
              mimeType: photo.mimeType,
              size: Number(photo.size),
              acquisitionDate: photo.acquisitionDate,
              dominantColor: photo.dominantColor,
              albumId: photo.albumId,
              createdAt: photo.createdAt,
              updatedAt: photo.updatedAt,
            }),
        )
      : undefined;

    return new Album({
      id: prismaAlbum.id,
      title: prismaAlbum.title,
      description: prismaAlbum.description,
      userId: prismaAlbum.userId,
      photos,
      isPublic: prismaAlbum.isPublic,
      shareToken: prismaAlbum.shareToken,
      createdAt: prismaAlbum.createdAt,
      updatedAt: prismaAlbum.updatedAt,
    });
  }
}

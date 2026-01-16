import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { AlbumViewModel } from './view-models/album.view-model';
import { StorageRepository } from '../storage/repositories/storage.repository';

@Controller('albums')
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly storageRepository: StorageRepository,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createAlbumDto: CreateAlbumDto,
  ): Promise<AlbumViewModel> {
    const album = await this.albumsService.create(req.user.id, createAlbumDto);
    return new AlbumViewModel({
      id: album.id,
      title: album.title,
      description: album.description,
      userId: album.userId,
      isPublic: album.isPublic,
      shareToken: album.shareToken,
      photos: album.photos?.map((photo) => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        filename: photo.filename,
        originalName: photo.originalName,
        mimeType: photo.mimeType,
        size: photo.size,
        acquisitionDate: photo.acquisitionDate,
        dominantColor: photo.dominantColor,
        albumId: photo.albumId,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
      })),
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req): Promise<AlbumViewModel[]> {
    const albums = await this.albumsService.findAll(req.user.id);
    return albums.map(
      (album) =>
        new AlbumViewModel({
          id: album.id,
          title: album.title,
          description: album.description,
          userId: album.userId,
          isPublic: album.isPublic,
          shareToken: album.shareToken,
          photos: album.photos?.map((photo) => ({
            id: photo.id,
            title: photo.title,
            description: photo.description,
            filename: photo.filename,
            originalName: photo.originalName,
            mimeType: photo.mimeType,
            size: photo.size,
            acquisitionDate: photo.acquisitionDate,
            dominantColor: photo.dominantColor,
            albumId: photo.albumId,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt,
          })),
          createdAt: album.createdAt,
          updatedAt: album.updatedAt,
        }),
    );
  }

  @Get('shared/:shareToken')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute for shared albums
  async getShared(
    @Param('shareToken') shareToken: string,
  ): Promise<AlbumViewModel> {
    const album = await this.albumsService.getShared(shareToken);

    // Get URLs for photos
    const photosWithUrls = await Promise.all(
      (album.photos || []).map(async (photo) => {
        const url = await this.storageRepository.getFileUrl(
          `photos/${photo.filename}`,
        );
        return {
          ...photo,
          url,
        };
      }),
    );

    return new AlbumViewModel({
      id: album.id,
      title: album.title,
      description: album.description,
      userId: album.userId,
      isPublic: album.isPublic,
      shareToken: album.shareToken,
      photos: photosWithUrls,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<AlbumViewModel> {
    const album = await this.albumsService.findOne(id, req.user.id);
    return new AlbumViewModel({
      id: album.id,
      title: album.title,
      description: album.description,
      userId: album.userId,
      isPublic: album.isPublic,
      shareToken: album.shareToken,
      photos: album.photos?.map((photo) => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        filename: photo.filename,
        originalName: photo.originalName,
        mimeType: photo.mimeType,
        size: photo.size,
        acquisitionDate: photo.acquisitionDate,
        dominantColor: photo.dominantColor,
        albumId: photo.albumId,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
      })),
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    });
  }

  @Patch(':id/share')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 share operations per minute
  async share(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { isPublic: boolean },
  ): Promise<AlbumViewModel> {
    const album = await this.albumsService.share(
      id,
      req.user.id,
      body.isPublic,
    );
    return new AlbumViewModel({
      id: album.id,
      title: album.title,
      description: album.description,
      userId: album.userId,
      isPublic: album.isPublic,
      shareToken: album.shareToken,
      photos: album.photos?.map((photo) => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        filename: photo.filename,
        originalName: photo.originalName,
        mimeType: photo.mimeType,
        size: photo.size,
        acquisitionDate: photo.acquisitionDate,
        dominantColor: photo.dominantColor,
        albumId: photo.albumId,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
      })),
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ): Promise<AlbumViewModel> {
    const album = await this.albumsService.update(
      id,
      req.user.id,
      updateAlbumDto,
    );
    return new AlbumViewModel({
      id: album.id,
      title: album.title,
      description: album.description,
      userId: album.userId,
      isPublic: album.isPublic,
      shareToken: album.shareToken,
      photos: album.photos?.map((photo) => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        filename: photo.filename,
        originalName: photo.originalName,
        mimeType: photo.mimeType,
        size: photo.size,
        acquisitionDate: photo.acquisitionDate,
        dominantColor: photo.dominantColor,
        albumId: photo.albumId,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
      })),
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.albumsService.remove(id, req.user.id);
  }
}

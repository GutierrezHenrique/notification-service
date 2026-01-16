import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { DeletePhotosDto } from './dto/delete-photos.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { PhotoViewModel } from './view-models/photo.view-model';
import { FileValidationPipe } from '../security/pipes/file-validation.pipe';
import { StorageRepository } from '../storage/repositories/storage.repository';

@Controller('albums/:albumId/photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  private maxFileSize: number = 10485760; // 10MB default

  constructor(
    private readonly photosService: PhotosService,
    private readonly configService: ConfigService,
    private readonly storageRepository: StorageRepository,
  ) {
    const maxSizeStr = this.configService.get<string>('MAX_FILE_SIZE');
    if (maxSizeStr) {
      const parsed = parseInt(maxSizeStr, 10);
      if (!isNaN(parsed) && parsed > 0) {
        this.maxFileSize = parsed;
      }
    }
  }

  @Post()
  @Throttle({ default: { limit: 15, ttl: 60000 } }) // 15 uploads per minute
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Request() req,
    @Param('albumId') albumId: string,
    @Body() createPhotoDto: CreatePhotoDto,
    @UploadedFile(
      new FileValidationPipe(
        10485760, // Default 10MB, actual value is set in constructor
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
      ),
    )
    file: Express.Multer.File | undefined,
  ): Promise<PhotoViewModel> {
    // FileValidationPipe ensures file is not undefined, but TypeScript doesn't know that
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }
    const photo = await this.photosService.create(
      albumId,
      req.user.id,
      createPhotoDto,
      file,
    );
    return new PhotoViewModel({
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
      url: (photo as any).url,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
    });
  }

  @Get()
  async findAll(
    @Request() req,
    @Param('albumId') albumId: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    photos: PhotoViewModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Validate and parse pagination parameters
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    // Validate parsed values
    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('A página deve ser um número inteiro positivo');
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('O limite deve estar entre 1 e 100');
    }
    if (orderBy && orderBy !== 'asc' && orderBy !== 'desc') {
      throw new BadRequestException('OrderBy deve ser "asc" ou "desc"');
    }
    const result = await this.photosService.findAll(
      albumId,
      req.user.id,
      orderBy || 'desc',
      pageNum,
      limitNum,
    );
    const photos = await Promise.all(
      result.photos.map(async (photo) => {
        const url = await this.storageRepository.getFileUrl(
          `photos/${photo.filename}`,
        );
        return new PhotoViewModel({
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
          url,
          createdAt: photo.createdAt,
          updatedAt: photo.updatedAt,
        });
      }),
    );
    return {
      photos,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PhotoViewModel> {
    const photo = await this.photosService.findOne(id, req.user.id);
    const url = await this.storageRepository.getFileUrl(
      `photos/${photo.filename}`,
    );
    return new PhotoViewModel({
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
      url,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
    });
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ): Promise<PhotoViewModel> {
    const photo = await this.photosService.update(
      id,
      req.user.id,
      updatePhotoDto,
    );
    return new PhotoViewModel({
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
    });
  }

  @Delete('batch')
  removeMany(@Request() req, @Body() deletePhotosDto: DeletePhotosDto) {
    return this.photosService.removeMany(deletePhotosDto.ids, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.photosService.remove(id, req.user.id);
  }
}

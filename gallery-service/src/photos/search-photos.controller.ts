import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { PhotoViewModel } from './view-models/photo.view-model';
import { StorageRepository } from '../storage/repositories/storage.repository';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class SearchPhotosController {
  constructor(
    private readonly photosService: PhotosService,
    private readonly storageRepository: StorageRepository,
  ) {}

  @Get('search')
  async search(
    @Request() req,
    @Query('q') query: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    photos: PhotoViewModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (!query) {
      throw new BadRequestException('Consulta de busca é obrigatória');
    }

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

    const result = await this.photosService.search(
      req.user.id,
      query,
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
}

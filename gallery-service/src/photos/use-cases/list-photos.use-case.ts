import { Injectable, BadRequestException } from '@nestjs/common';
import { Photo } from '../../domain/entities/photo.entity';
import { GetAlbumUseCase } from '../../albums/use-cases/get-album.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { assertValidUUID } from '../../security/utils/validation.util';

@Injectable()
export class ListPhotosUseCase {
  constructor(
    private readonly photosRepository: PhotosRepository,
    private readonly getAlbumUseCase: GetAlbumUseCase,
  ) {}

  async execute(
    albumId: string,
    userId: string,
    orderBy: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50,
  ): Promise<{ photos: Photo[]; total: number; page: number; limit: number }> {
    // Validate UUIDs
    assertValidUUID(albumId, 'Album ID');
    assertValidUUID(userId, 'User ID');

    // Validate pagination parameters
    if (page < 1 || !Number.isInteger(page)) {
      throw new BadRequestException('A página deve ser um número inteiro positivo');
    }
    if (limit < 1 || limit > 100 || !Number.isInteger(limit)) {
      throw new BadRequestException('O limite deve estar entre 1 e 100');
    }
    if (orderBy !== 'asc' && orderBy !== 'desc') {
      throw new BadRequestException('OrderBy deve ser "asc" ou "desc"');
    }

    // Verify album belongs to user
    await this.getAlbumUseCase.execute(albumId, userId);

    return this.photosRepository.findAll(albumId, orderBy, page, limit);
  }
}

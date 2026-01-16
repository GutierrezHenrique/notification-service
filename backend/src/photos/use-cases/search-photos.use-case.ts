import { Injectable, BadRequestException } from '@nestjs/common';
import { Photo } from '../../domain/entities/photo.entity';
import { PhotosRepository } from '../repositories/photos.repository';
import { assertValidUUID } from '../../security/utils/validation.util';

@Injectable()
export class SearchPhotosUseCase {
  constructor(private readonly photosRepository: PhotosRepository) {}

  async execute(
    userId: string,
    query: string,
    orderBy: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50,
  ): Promise<{ photos: Photo[]; total: number; page: number; limit: number }> {
    // Validate UUID
    assertValidUUID(userId, 'User ID');

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new BadRequestException('Consulta de busca é obrigatória');
    }

    if (query.trim().length < 2) {
      throw new BadRequestException(
        'A consulta de busca deve ter pelo menos 2 caracteres',
      );
    }

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

    return this.photosRepository.search(
      userId,
      query.trim(),
      orderBy,
      page,
      limit,
    );
  }
}

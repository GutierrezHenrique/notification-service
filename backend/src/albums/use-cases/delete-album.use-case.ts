import { Injectable, BadRequestException } from '@nestjs/common';
import { GetAlbumUseCase } from './get-album.use-case';
import { AlbumsRepository } from '../repositories/albums.repository';

@Injectable()
export class DeleteAlbumUseCase {
  constructor(
    private readonly albumsRepository: AlbumsRepository,
    private readonly getAlbumUseCase: GetAlbumUseCase,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const album = await this.getAlbumUseCase.execute(id, userId);

    if (album.photos && album.photos.length > 0) {
      throw new BadRequestException(
        'Cannot delete album with photos. Please delete all photos first.',
      );
    }

    await this.albumsRepository.delete(id);
  }
}

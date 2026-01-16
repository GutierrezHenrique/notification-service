import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Album } from '../../domain/entities/album.entity';
import { AlbumsRepository } from '../repositories/albums.repository';
import { assertValidUUID } from '../../security/utils/validation.util';

@Injectable()
export class GetAlbumUseCase {
  constructor(private readonly albumsRepository: AlbumsRepository) {}

  async execute(id: string, userId: string): Promise<Album> {
    // Validate UUIDs to prevent injection
    assertValidUUID(id, 'Album ID');
    assertValidUUID(userId, 'User ID');

    const album = await this.albumsRepository.findOne(id);

    if (!album) {
      throw new NotFoundException('Álbum não encontrado');
    }

    if (album.userId !== userId) {
      throw new ForbiddenException('Você não tem acesso a este álbum');
    }

    return album;
  }
}

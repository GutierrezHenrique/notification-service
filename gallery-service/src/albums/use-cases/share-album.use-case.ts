import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AlbumsRepository } from '../repositories/albums.repository';
import { randomBytes } from 'crypto';
import { assertValidUUID } from '../../security/utils/validation.util';

@Injectable()
export class ShareAlbumUseCase {
  private readonly logger = new Logger(ShareAlbumUseCase.name);

  constructor(private readonly albumsRepository: AlbumsRepository) {}

  async execute(albumId: string, userId: string, isPublic: boolean) {
    // Validate UUID format to prevent injection
    assertValidUUID(albumId, 'Album ID');
    assertValidUUID(userId, 'User ID');

    // Validate boolean type
    if (typeof isPublic !== 'boolean') {
      throw new BadRequestException('isPublic deve ser um booleano');
    }

    const album = await this.albumsRepository.findOne(albumId);

    if (!album) {
      throw new NotFoundException('Álbum não encontrado');
    }

    if (album.userId !== userId) {
      throw new UnauthorizedException(
        'Você não tem permissão para compartilhar este álbum',
      );
    }

    let shareToken: string | undefined;
    if (isPublic) {
      // Generate a unique share token (64 hex characters = 32 bytes)
      shareToken = randomBytes(32).toString('hex');
      this.logger.log(
        `Album ${albumId} shared by user ${userId} with token ${shareToken.substring(0, 8)}...`,
      );
    } else {
      this.logger.log(`Album ${albumId} made private by user ${userId}`);
    }

    return this.albumsRepository.updateSharing(albumId, isPublic, shareToken);
  }
}

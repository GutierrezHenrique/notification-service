import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { AlbumsRepository } from '../repositories/albums.repository';
import { assertValidShareToken } from '../../security/utils/validation.util';

@Injectable()
export class GetSharedAlbumUseCase {
  private readonly logger = new Logger(GetSharedAlbumUseCase.name);

  constructor(private readonly albumsRepository: AlbumsRepository) {}

  async execute(shareToken: string) {
    // Validate share token format to prevent injection and enumeration
    assertValidShareToken(shareToken);

    const album = await this.albumsRepository.findByShareToken(shareToken);

    // Always return same error message to prevent token enumeration
    if (!album || !album.isPublic) {
      // Log failed access attempts for security monitoring
      this.logger.warn(
        `Failed access attempt to shared album with token ${shareToken.substring(0, 8)}...`,
      );
      throw new NotFoundException('Shared album not found');
    }

    // Log successful access
    this.logger.log(
      `Shared album ${album.id} accessed via token ${shareToken.substring(0, 8)}...`,
    );

    return album;
  }
}

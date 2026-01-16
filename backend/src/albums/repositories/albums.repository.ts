import { Album } from '../../domain/entities/album.entity';
import { CreateAlbumDto } from '../dto/create-album.dto';
import { UpdateAlbumDto } from '../dto/update-album.dto';

export abstract class AlbumsRepository {
  abstract create(
    userId: string,
    createAlbumDto: CreateAlbumDto,
  ): Promise<Album>;
  abstract findAll(userId: string): Promise<Album[]>;
  abstract findOne(id: string): Promise<Album | null>;
  abstract update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album>;
  abstract delete(id: string): Promise<void>;
  abstract findByShareToken(shareToken: string): Promise<Album | null>;
  abstract updateSharing(
    id: string,
    isPublic: boolean,
    shareToken?: string,
  ): Promise<Album>;
}

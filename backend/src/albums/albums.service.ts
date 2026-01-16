import { Injectable } from '@nestjs/common';
import { CreateAlbumUseCase } from './use-cases/create-album.use-case';
import { ListAlbumsUseCase } from './use-cases/list-albums.use-case';
import { GetAlbumUseCase } from './use-cases/get-album.use-case';
import { UpdateAlbumUseCase } from './use-cases/update-album.use-case';
import { DeleteAlbumUseCase } from './use-cases/delete-album.use-case';
import { ShareAlbumUseCase } from './use-cases/share-album.use-case';
import { GetSharedAlbumUseCase } from './use-cases/get-shared-album.use-case';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from '../domain/entities/album.entity';

@Injectable()
export class AlbumsService {
  constructor(
    private readonly createAlbumUseCase: CreateAlbumUseCase,
    private readonly listAlbumsUseCase: ListAlbumsUseCase,
    private readonly getAlbumUseCase: GetAlbumUseCase,
    private readonly updateAlbumUseCase: UpdateAlbumUseCase,
    private readonly deleteAlbumUseCase: DeleteAlbumUseCase,
    private readonly shareAlbumUseCase: ShareAlbumUseCase,
    private readonly getSharedAlbumUseCase: GetSharedAlbumUseCase,
  ) {}

  async create(userId: string, createAlbumDto: CreateAlbumDto): Promise<Album> {
    return this.createAlbumUseCase.execute(userId, createAlbumDto);
  }

  async findAll(userId: string): Promise<Album[]> {
    return this.listAlbumsUseCase.execute(userId);
  }

  async findOne(id: string, userId: string): Promise<Album> {
    return this.getAlbumUseCase.execute(id, userId);
  }

  async update(
    id: string,
    userId: string,
    updateAlbumDto: UpdateAlbumDto,
  ): Promise<Album> {
    return this.updateAlbumUseCase.execute(id, userId, updateAlbumDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    return this.deleteAlbumUseCase.execute(id, userId);
  }

  async share(albumId: string, userId: string, isPublic: boolean): Promise<Album> {
    return this.shareAlbumUseCase.execute(albumId, userId, isPublic);
  }

  async getShared(shareToken: string): Promise<Album> {
    return this.getSharedAlbumUseCase.execute(shareToken);
  }
}

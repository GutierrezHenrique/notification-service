import { Injectable } from '@nestjs/common';
import { Album } from '../../domain/entities/album.entity';
import { UpdateAlbumDto } from '../dto/update-album.dto';
import { GetAlbumUseCase } from './get-album.use-case';
import { AlbumsRepository } from '../repositories/albums.repository';

@Injectable()
export class UpdateAlbumUseCase {
  constructor(
    private readonly albumsRepository: AlbumsRepository,
    private readonly getAlbumUseCase: GetAlbumUseCase,
  ) {}

  async execute(
    id: string,
    userId: string,
    updateAlbumDto: UpdateAlbumDto,
  ): Promise<Album> {
    await this.getAlbumUseCase.execute(id, userId);
    return this.albumsRepository.update(id, updateAlbumDto);
  }
}

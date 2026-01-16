import { Injectable } from '@nestjs/common';
import { Album } from '../../domain/entities/album.entity';
import { CreateAlbumDto } from '../dto/create-album.dto';
import { AlbumsRepository } from '../repositories/albums.repository';

@Injectable()
export class CreateAlbumUseCase {
  constructor(private readonly albumsRepository: AlbumsRepository) {}

  async execute(
    userId: string,
    createAlbumDto: CreateAlbumDto,
  ): Promise<Album> {
    return this.albumsRepository.create(userId, createAlbumDto);
  }
}

import { Injectable } from '@nestjs/common';
import { Album } from '../../domain/entities/album.entity';
import { AlbumsRepository } from '../repositories/albums.repository';

@Injectable()
export class ListAlbumsUseCase {
  constructor(private readonly albumsRepository: AlbumsRepository) {}

  async execute(userId: string): Promise<Album[]> {
    return this.albumsRepository.findAll(userId);
  }
}

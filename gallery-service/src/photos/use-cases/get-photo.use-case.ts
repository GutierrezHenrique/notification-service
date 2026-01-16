import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Photo } from '../../domain/entities/photo.entity';
import { PhotosRepository } from '../repositories/photos.repository';

@Injectable()
export class GetPhotoUseCase {
  constructor(private readonly photosRepository: PhotosRepository) {}

  async execute(id: string, userId: string): Promise<Photo> {
    const photo = await this.photosRepository.findOne(id);

    if (!photo) {
      throw new NotFoundException('Foto não encontrada');
    }

    if (photo.album.userId !== userId) {
      throw new ForbiddenException('Você não tem acesso a esta foto');
    }

    return photo;
  }
}

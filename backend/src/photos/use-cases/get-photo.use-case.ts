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
      throw new NotFoundException('Photo not found');
    }

    if (photo.album.userId !== userId) {
      throw new ForbiddenException('You do not have access to this photo');
    }

    return photo;
  }
}

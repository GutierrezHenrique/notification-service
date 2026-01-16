import { Injectable } from '@nestjs/common';
import { Photo } from '../../domain/entities/photo.entity';
import { UpdatePhotoDto } from '../dto/update-photo.dto';
import { GetPhotoUseCase } from './get-photo.use-case';
import { PhotosRepository } from '../repositories/photos.repository';

@Injectable()
export class UpdatePhotoUseCase {
  constructor(
    private readonly photosRepository: PhotosRepository,
    private readonly getPhotoUseCase: GetPhotoUseCase,
  ) {}

  async execute(
    id: string,
    userId: string,
    updatePhotoDto: UpdatePhotoDto,
  ): Promise<Photo> {
    await this.getPhotoUseCase.execute(id, userId);
    return this.photosRepository.update(id, updatePhotoDto);
  }
}

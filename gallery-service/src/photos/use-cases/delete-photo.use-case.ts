import { Injectable } from '@nestjs/common';
import { GetPhotoUseCase } from './get-photo.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { StorageRepository } from '../../storage/repositories/storage.repository';

@Injectable()
export class DeletePhotoUseCase {
  constructor(
    private readonly photosRepository: PhotosRepository,
    private readonly storageRepository: StorageRepository,
    private readonly getPhotoUseCase: GetPhotoUseCase,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const photo = await this.getPhotoUseCase.execute(id, userId);

    // Delete file from R2 storage
    // The filename stored in DB is the same as the key in R2 (photos/filename)
    const storageKey = `photos/${photo.filename}`;
    try {
      await this.storageRepository.deleteFile(storageKey);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      // Continue with database deletion even if file deletion fails
    }

    await this.photosRepository.delete(id);
  }
}

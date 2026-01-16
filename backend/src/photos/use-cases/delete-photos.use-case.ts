import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetPhotoUseCase } from './get-photo.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { StorageRepository } from '../../storage/repositories/storage.repository';

@Injectable()
export class DeletePhotosUseCase {
  constructor(
    private readonly photosRepository: PhotosRepository,
    private readonly storageRepository: StorageRepository,
    private readonly getPhotoUseCase: GetPhotoUseCase,
  ) {}

  async execute(ids: string[], userId: string): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    // Validate that all photos exist and belong to the user
    const photos = await Promise.all(
      ids.map((id) => this.getPhotoUseCase.execute(id, userId)),
    );

    // Delete files from R2 storage
    const deletePromises = photos.map(async (photo) => {
      const storageKey = `photos/${photo.filename}`;
      try {
        await this.storageRepository.deleteFile(storageKey);
      } catch (error) {
        console.error(`Error deleting file ${storageKey} from R2:`, error);
        // Continue with database deletion even if file deletion fails
      }
    });

    await Promise.all(deletePromises);

    // Delete from database
    await this.photosRepository.deleteMany(ids);
  }
}

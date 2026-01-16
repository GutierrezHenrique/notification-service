import { Injectable, BadRequestException } from '@nestjs/common';
import { Photo } from '../../domain/entities/photo.entity';
import { CreatePhotoDto } from '../dto/create-photo.dto';
import { GetAlbumUseCase } from '../../albums/use-cases/get-album.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { StorageRepository } from '../../storage/repositories/storage.repository';
import { assertValidUUID } from '../../security/utils/validation.util';
import * as sharp from 'sharp';
import * as exifParser from 'exif-parser';

@Injectable()
export class CreatePhotoUseCase {
  constructor(
    private readonly photosRepository: PhotosRepository,
    private readonly storageRepository: StorageRepository,
    private readonly getAlbumUseCase: GetAlbumUseCase,
  ) {}

  async execute(
    albumId: string,
    userId: string,
    createPhotoDto: CreatePhotoDto,
    file: Express.Multer.File,
  ): Promise<Photo> {
    // Validate UUIDs to prevent injection
    assertValidUUID(albumId, 'Album ID');
    assertValidUUID(userId, 'User ID');

    // Verify album exists and belongs to user
    const album = await this.getAlbumUseCase.execute(albumId, userId);

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    // Upload file to R2
    const uploadResult = await this.storageRepository.uploadFile(
      file,
      'photos',
    );

    // Extract EXIF data
    let acquisitionDate = createPhotoDto.acquisitionDate
      ? new Date(createPhotoDto.acquisitionDate)
      : null;

    try {
      const exifData = exifParser.create(file.buffer).parse();
      if (exifData.tags && exifData.tags.DateTimeOriginal) {
        acquisitionDate = new Date(exifData.tags.DateTimeOriginal * 1000);
      } else if (exifData.tags && exifData.tags.DateTime) {
        acquisitionDate = new Date(exifData.tags.DateTime * 1000);
      }
    } catch (error) {
      // EXIF parsing failed, use provided date or current date
      if (!acquisitionDate) {
        acquisitionDate = new Date();
      }
    }

    // Detect dominant color using sharp
    let dominantColor = '#000000';
    try {
      const { channels } = await sharp(file.buffer)
        .resize(200, 200, { fit: 'inside' })
        .stats();

      if (channels && channels.length >= 3) {
        // Get average color from all channels
        const r = Math.round(channels[0].mean || 0);
        const g = Math.round(channels[1].mean || 0);
        const b = Math.round(channels[2].mean || 0);
        dominantColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('Error detecting dominant color:', error);
    }

    const photo = await this.photosRepository.create(album.id, {
      ...createPhotoDto,
      filename: uploadResult.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      acquisitionDate: acquisitionDate || new Date(),
      dominantColor,
    });

    // Add URL to photo object
    return {
      ...photo,
      url: uploadResult.url,
    } as Photo;
  }
}

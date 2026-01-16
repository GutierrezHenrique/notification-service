import { Photo } from '../../domain/entities/photo.entity';
import { CreatePhotoDto } from '../dto/create-photo.dto';
import { UpdatePhotoDto } from '../dto/update-photo.dto';

export interface CreatePhotoData extends CreatePhotoDto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  acquisitionDate?: Date;
  dominantColor?: string;
}

export interface PaginatedPhotos {
  photos: Photo[];
  total: number;
  page: number;
  limit: number;
}

export abstract class PhotosRepository {
  abstract create(
    albumId: string,
    createPhotoData: CreatePhotoData,
  ): Promise<Photo>;
  abstract findAll(
    albumId: string,
    orderBy?: 'asc' | 'desc',
    page?: number,
    limit?: number,
  ): Promise<PaginatedPhotos>;
  abstract findOne(id: string): Promise<Photo | null>;
  abstract update(id: string, updatePhotoDto: UpdatePhotoDto): Promise<Photo>;
  abstract delete(id: string): Promise<void>;
  abstract deleteMany(ids: string[]): Promise<void>;
  abstract search(
    userId: string,
    query: string,
    orderBy?: 'asc' | 'desc',
    page?: number,
    limit?: number,
  ): Promise<PaginatedPhotos>;
}

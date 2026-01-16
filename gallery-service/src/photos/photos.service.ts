import { Injectable } from '@nestjs/common';
import { CreatePhotoUseCase } from './use-cases/create-photo.use-case';
import { ListPhotosUseCase } from './use-cases/list-photos.use-case';
import { GetPhotoUseCase } from './use-cases/get-photo.use-case';
import { UpdatePhotoUseCase } from './use-cases/update-photo.use-case';
import { DeletePhotoUseCase } from './use-cases/delete-photo.use-case';
import { DeletePhotosUseCase } from './use-cases/delete-photos.use-case';
import { SearchPhotosUseCase } from './use-cases/search-photos.use-case';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { Photo } from '../domain/entities/photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    private readonly createPhotoUseCase: CreatePhotoUseCase,
    private readonly listPhotosUseCase: ListPhotosUseCase,
    private readonly getPhotoUseCase: GetPhotoUseCase,
    private readonly updatePhotoUseCase: UpdatePhotoUseCase,
    private readonly deletePhotoUseCase: DeletePhotoUseCase,
    private readonly deletePhotosUseCase: DeletePhotosUseCase,
    private readonly searchPhotosUseCase: SearchPhotosUseCase,
  ) {}

  async create(
    albumId: string,
    userId: string,
    createPhotoDto: CreatePhotoDto,
    file: Express.Multer.File,
  ): Promise<Photo> {
    return this.createPhotoUseCase.execute(
      albumId,
      userId,
      createPhotoDto,
      file,
    );
  }

  async findAll(
    albumId: string,
    userId: string,
    orderBy: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50,
  ): Promise<{ photos: Photo[]; total: number; page: number; limit: number }> {
    return this.listPhotosUseCase.execute(
      albumId,
      userId,
      orderBy,
      page,
      limit,
    );
  }

  async findOne(id: string, userId: string): Promise<Photo> {
    return this.getPhotoUseCase.execute(id, userId);
  }

  async update(
    id: string,
    userId: string,
    updatePhotoDto: UpdatePhotoDto,
  ): Promise<Photo> {
    return this.updatePhotoUseCase.execute(id, userId, updatePhotoDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    return this.deletePhotoUseCase.execute(id, userId);
  }

  async removeMany(ids: string[], userId: string): Promise<void> {
    return this.deletePhotosUseCase.execute(ids, userId);
  }

  async search(
    userId: string,
    query: string,
    orderBy: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50,
  ): Promise<{ photos: Photo[]; total: number; page: number; limit: number }> {
    return this.searchPhotosUseCase.execute(
      userId,
      query,
      orderBy,
      page,
      limit,
    );
  }
}

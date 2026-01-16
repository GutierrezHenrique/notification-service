import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { SearchPhotosController } from './search-photos.controller';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { AlbumsModule } from '../albums/albums.module';
import { AuthClientModule } from '../auth-client/auth-client.module';
import { CreatePhotoUseCase } from './use-cases/create-photo.use-case';
import { ListPhotosUseCase } from './use-cases/list-photos.use-case';
import { GetPhotoUseCase } from './use-cases/get-photo.use-case';
import { UpdatePhotoUseCase } from './use-cases/update-photo.use-case';
import { DeletePhotoUseCase } from './use-cases/delete-photo.use-case';
import { DeletePhotosUseCase } from './use-cases/delete-photos.use-case';
import { SearchPhotosUseCase } from './use-cases/search-photos.use-case';

@Module({
  imports: [DatabaseModule, StorageModule, AlbumsModule, AuthClientModule],
  controllers: [PhotosController, SearchPhotosController],
  providers: [
    PhotosService,
    CreatePhotoUseCase,
    ListPhotosUseCase,
    GetPhotoUseCase,
    UpdatePhotoUseCase,
    DeletePhotoUseCase,
    DeletePhotosUseCase,
    SearchPhotosUseCase,
  ],
})
export class PhotosModule {}

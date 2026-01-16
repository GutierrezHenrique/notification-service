import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { AuthClientModule } from '../auth-client/auth-client.module';
import { CreateAlbumUseCase } from './use-cases/create-album.use-case';
import { ListAlbumsUseCase } from './use-cases/list-albums.use-case';
import { GetAlbumUseCase } from './use-cases/get-album.use-case';
import { UpdateAlbumUseCase } from './use-cases/update-album.use-case';
import { DeleteAlbumUseCase } from './use-cases/delete-album.use-case';
import { ShareAlbumUseCase } from './use-cases/share-album.use-case';
import { GetSharedAlbumUseCase } from './use-cases/get-shared-album.use-case';

@Module({
  imports: [DatabaseModule, StorageModule, AuthClientModule],
  controllers: [AlbumsController],
  providers: [
    AlbumsService,
    CreateAlbumUseCase,
    ListAlbumsUseCase,
    GetAlbumUseCase,
    UpdateAlbumUseCase,
    DeleteAlbumUseCase,
    ShareAlbumUseCase,
    GetSharedAlbumUseCase,
  ],
  exports: [AlbumsService, GetAlbumUseCase],
})
export class AlbumsModule {}

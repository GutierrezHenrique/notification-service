import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageRepository } from './repositories/storage.repository';
import { R2StorageRepository } from './repositories/r2-storage.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: StorageRepository,
      useClass: R2StorageRepository,
    },
  ],
  exports: [StorageRepository],
})
export class StorageModule {}

import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { FcmTokenService } from './fcm-token.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushNotificationService, FcmTokenService],
  exports: [NotificationsService, PushNotificationService, FcmTokenService],
})
export class NotificationsModule {}

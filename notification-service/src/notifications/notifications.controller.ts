import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FcmTokenService } from './fcm-token.service';
import { PushNotificationService } from './push-notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly fcmTokenService: FcmTokenService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Get()
  async getNotifications() {
    return this.notificationsService.getNotifications();
  }

  @Get('unread')
  async getUnreadCount() {
    return this.notificationsService.getUnreadCount();
  }

  @Post('fcm/register')
  async registerFcmToken(
    @Body() body: { token: string; deviceId?: string; platform?: string },
    @Request() req: any,
  ) {
    // O userId deve vir do token JWT validado pelo guard
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.fcmTokenService.registerToken(
      userId,
      body.token,
      body.deviceId,
      body.platform,
    );
  }

  @Delete('fcm/token')
  async removeFcmToken(@Body() body: { token: string }) {
    return this.fcmTokenService.removeToken(body.token);
  }

  @Post('fcm/test')
  async testPushNotification(
    @Body() body: { token: string; title?: string; body?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    const title = body.title || 'Test Notification';
    const message = body.body || 'This is a test push notification';

    return this.pushNotificationService.sendPushNotification(
      body.token,
      title,
      message,
    );
  }
}

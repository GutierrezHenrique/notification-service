import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async getNotifications() {
    // TODO: Implement notification retrieval
    return {
      notifications: [],
      total: 0,
    };
  }

  async getUnreadCount() {
    // TODO: Implement unread count
    return {
      count: 0,
    };
  }
}

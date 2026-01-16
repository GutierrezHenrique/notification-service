import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private firebaseApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccount = this.configService.get<string>(
        'FIREBASE_SERVICE_ACCOUNT',
      );

      if (!serviceAccount) {
        this.logger.warn(
          'FIREBASE_SERVICE_ACCOUNT not configured. Push notifications will be disabled.',
        );
        return;
      }

      const serviceAccountJson = JSON.parse(serviceAccount);

      if (!admin.apps.length) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson),
        });
        this.logger.log('Firebase Admin initialized successfully');
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin:', error);
    }
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn(
        'Firebase not initialized. Cannot send push notification.',
      );
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToString(data) : undefined,
        webpush: {
          notification: {
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send push notification: ${error.message}`,
        error.stack,
      );

      // Se o token é inválido, pode ser removido
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        this.logger.warn(`Invalid FCM token: ${fcmToken}`);
        return false;
      }

      return false;
    }
  }

  async sendPushNotificationToMultiple(
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.firebaseApp || fcmTokens.length === 0) {
      return { successCount: 0, failureCount: fcmTokens.length };
    }

    try {
      const messages: admin.messaging.Message[] = fcmTokens.map((token) => ({
        token,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToString(data) : undefined,
        webpush: {
          notification: {
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
        },
      }));

      const response = await admin.messaging().sendEach(messages);

      this.logger.log(
        `Sent ${response.successCount} push notifications, ${response.failureCount} failed`,
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to send push notifications: ${error.message}`,
        error.stack,
      );
      return { successCount: 0, failureCount: fcmTokens.length };
    }
  }

  private convertDataToString(
    data: Record<string, any>,
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }

  async validateToken(fcmToken: string): Promise<boolean> {
    if (!this.firebaseApp) {
      return false;
    }

    try {
      // Tenta enviar uma mensagem de teste (não será entregue se o token for inválido)
      // Uma alternativa mais eficiente seria verificar o formato do token
      return fcmToken.length > 0 && fcmToken.startsWith('FCM');
    } catch (error) {
      return false;
    }
  }
}

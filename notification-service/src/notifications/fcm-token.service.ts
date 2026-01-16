import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FcmTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async registerToken(
    userId: string,
    token: string,
    deviceId?: string,
    platform?: string,
  ) {
    // Verificar se o token já existe
    const existingToken = await this.prisma.fcmToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      // Atualizar token existente
      return this.prisma.fcmToken.update({
        where: { token },
        data: {
          userId,
          deviceId,
          platform,
        },
      });
    }

    // Criar novo token
    return this.prisma.fcmToken.create({
      data: {
        userId,
        token,
        deviceId,
        platform,
      },
    });
  }

  async getTokensByUserId(userId: string): Promise<string[]> {
    const tokens = await this.prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    return tokens.map((t) => t.token);
  }

  async removeToken(token: string) {
    return this.prisma.fcmToken.delete({
      where: { token },
    });
  }

  async removeTokensByUserId(userId: string) {
    return this.prisma.fcmToken.deleteMany({
      where: { userId },
    });
  }

  async removeTokenByDeviceId(userId: string, deviceId: string) {
    return this.prisma.fcmToken.deleteMany({
      where: {
        userId,
        deviceId,
      },
    });
  }
}

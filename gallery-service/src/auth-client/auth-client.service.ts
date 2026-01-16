import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthClientService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:3001';
  }

  async validateToken(
    token: string,
  ): Promise<{ userId: string; email: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/validate`,
          { token },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        ),
      );

      if (response.data?.valid && response.data?.user) {
        return {
          userId: response.data.user.id,
          email: response.data.user.email,
        };
      }

      throw new UnauthorizedException('Token inválido');
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new UnauthorizedException('Token inválido');
      }
      
      // Log para debug
      console.error('Token validation error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: `${this.authServiceUrl}/auth/validate`,
      });
      
      throw new UnauthorizedException('Falha ao validar token');
    }
  }
}

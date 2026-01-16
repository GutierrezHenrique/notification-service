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

  async validateToken(token: string): Promise<{ userId: string; email: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/validate`,
          { token },
        ),
      );

      if (response.data.valid) {
        return {
          userId: response.data.userId,
          email: response.data.email,
        };
      }

      throw new UnauthorizedException('Invalid token');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Failed to validate token');
    }
  }
}

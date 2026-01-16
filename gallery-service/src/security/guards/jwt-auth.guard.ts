import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthClientService } from '../../auth-client/auth-client.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authClientService: AuthClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Cabeçalho de autorização ausente ou inválido',
      );
    }

    const token = authHeader.substring(7);

    try {
      const { userId, email } =
        await this.authClientService.validateToken(token);
      request.user = { id: userId, email };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

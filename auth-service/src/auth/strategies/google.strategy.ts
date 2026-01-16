import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    // O callback URL deve apontar para o API Gateway (porta 3000)
    // O middleware do gateway redireciona para o auth-service
    const apiGatewayUrl = configService.get<string>('API_GATEWAY_URL') || 'http://localhost:3000';
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || `${apiGatewayUrl}/auth/google/callback`;
    
    console.log('🔐 Google OAuth Config:');
    console.log('  - Client ID:', configService.get<string>('GOOGLE_CLIENT_ID') ? '✓ Configurado' : '✗ Não configurado');
    console.log('  - Client Secret:', configService.get<string>('GOOGLE_CLIENT_SECRET') ? '✓ Configurado' : '✗ Não configurado');
    console.log('  - Callback URL:', callbackURL);
    console.log('  ⚠️  IMPORTANTE: Configure esta URL no Google Console como callback autorizado!');
    
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      profilePicture: photos[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}

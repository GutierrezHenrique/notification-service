import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(googleUser: {
    googleId: string;
    email: string;
    name: string;
    profilePicture?: string;
  }) {
    // Verificar se o usuário já existe pelo Google ID
    let user = await this.usersService.findOneByGoogleId(googleUser.googleId);

    if (!user) {
      // Verificar se existe um usuário com o mesmo email
      const existingUser = await this.usersService.findOneByEmail(
        googleUser.email,
      );

      if (existingUser) {
        // Atualizar usuário existente com Google ID
        user = await this.usersService.update(existingUser.id, {
          googleId: googleUser.googleId,
          provider: 'google',
          profilePicture: googleUser.profilePicture,
        });
      } else {
        // Criar novo usuário
        user = await this.usersService.create({
          email: googleUser.email,
          name: googleUser.name,
          password: undefined,
        });

        // Atualizar com Google ID e foto
        user = await this.usersService.update(user.id, {
          googleId: googleUser.googleId,
          provider: 'google',
          profilePicture: googleUser.profilePicture,
        });
      }
    } else {
      // Atualizar foto de perfil se necessário
      if (
        googleUser.profilePicture &&
        user.profilePicture !== googleUser.profilePicture
      ) {
        user = await this.usersService.update(user.id, {
          profilePicture: googleUser.profilePicture,
        });
      }
    }

    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        profilePicture: user.profilePicture,
      },
    };
  }
}

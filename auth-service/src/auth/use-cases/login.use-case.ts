import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    // Verificar se o usuário existe e tem senha (não é OAuth)
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar se a senha está correta
    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
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

import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    // Buscar usuário pelo token
    const user = await this.usersService.findOneByPasswordResetToken(
      resetPasswordDto.token,
    );

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Verificar se o token não expirou
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException(
        'Token expirado. Solicite um novo link de recuperação.',
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    // Atualizar senha e limpar token
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return {
      message: 'Senha redefinida com sucesso!',
    };
  }
}

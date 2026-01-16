import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../email/email.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );

    // Por segurança, sempre retornamos sucesso mesmo se o email não existir
    // Isso previne enumeração de emails
    if (!user) {
      return {
        message:
          'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
      };
    }

    // Verificar se o usuário fez login via OAuth (não tem senha)
    if (user.provider === 'google' || !user.password) {
      return {
        message:
          'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
      };
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expira em 1 hora

    // Salvar token no banco
    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Enviar email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken,
      );
    } catch (error) {
      // Se falhar ao enviar email, limpar o token
      await this.usersService.update(user.id, {
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      throw new BadRequestException(
        'Erro ao enviar email. Tente novamente mais tarde.',
      );
    }

    return {
      message:
        'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
    };
  }
}

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(maxSize?: number, allowedMimeTypes?: string[]) {
    this.maxSize = maxSize || 10 * 1024 * 1024; // 10MB default
    this.allowedMimeTypes = allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
  }

  transform(value: Express.Multer.File | undefined): Express.Multer.File {
    if (!value) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    // Validate file size
    if (value.size > this.maxSize) {
      throw new BadRequestException(
        `Tamanho do arquivo excede o máximo permitido de ${this.maxSize / 1024 / 1024}MB`,
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(value.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo ${value.mimetype} não é permitido. Tipos permitidos: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Validate file extension
    const extension = value.originalname.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `Extensão de arquivo .${extension} não é permitida. Extensões permitidas: ${allowedExtensions.join(', ')}`,
      );
    }

    // Additional security: Check file signature (magic numbers)
    this.validateFileSignature(value);

    return value;
  }

  private validateFileSignature(file: Express.Multer.File): void {
    const buffer = file.buffer;
    if (!buffer || buffer.length < 4) {
      throw new BadRequestException(
        'Arquivo inválido: arquivo muito pequeno ou corrompido',
      );
    }

    // Check magic numbers for common image formats
    const signatures: { [key: string]: number[][] } = {
      'image/jpeg': [[0xff, 0xd8, 0xff]],
      'image/png': [[0x89, 0x50, 0x4e, 0x47]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    };

    const expectedSignature = signatures[file.mimetype];
    if (expectedSignature) {
      const matches = expectedSignature.some((sig) => {
        return sig.every((byte, index) => buffer[index] === byte);
      });

      if (!matches) {
        // For WebP, check more bytes
        if (file.mimetype === 'image/webp') {
          const webpHeader = buffer.toString('ascii', 0, 4);
          const webpFormat = buffer.toString('ascii', 8, 12);
          if (webpHeader !== 'RIFF' || webpFormat !== 'WEBP') {
            throw new BadRequestException(
              'Arquivo inválido: assinatura do arquivo não corresponde ao tipo MIME',
            );
          }
        } else {
          throw new BadRequestException(
            'Arquivo inválido: assinatura do arquivo não corresponde ao tipo MIME',
          );
        }
      }
    }
  }
}

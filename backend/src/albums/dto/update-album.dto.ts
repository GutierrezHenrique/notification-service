import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateAlbumDto {
  @IsString({ message: 'Título deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Título não pode estar vazio' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title?: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  description?: string;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreatePhotoDto {
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(1, { message: 'Título não pode estar vazio' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  description?: string;

  @IsDateString(
    {},
    { message: 'Data de aquisição deve ser uma data válida (ISO 8601)' },
  )
  @IsOptional()
  acquisitionDate?: Date;
}

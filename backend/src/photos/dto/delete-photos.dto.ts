import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class DeletePhotosDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];
}

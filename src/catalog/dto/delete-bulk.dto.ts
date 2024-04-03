import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class DeleteBulkDto {
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids: string[];
}

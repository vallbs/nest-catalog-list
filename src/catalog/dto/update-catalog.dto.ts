import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogDto } from './create-catalog.dto';
import { Exclude } from 'class-transformer';

export class UpdateCatalogDto extends PartialType(CreateCatalogDto) {
  @Exclude()
  name: string;

  @Exclude()
  vertical: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCatalogDto } from './create-catalog.dto';
import { Exclude } from 'class-transformer';

export class UpdateCatalogDto extends PartialType(CreateCatalogDto) {
  @ApiProperty({
    description: 'Name cannot be updated',
    readOnly: true,
  })
  @Exclude()
  name: string;

  @ApiProperty({
    description: 'Vertical cannot be updated',
    readOnly: true,
  })
  @Exclude()
  vertical: string;

  @ApiProperty({
    description: 'Whether this is a primary catalog',
    example: true,
    required: false,
  })
  primary?: boolean;
}

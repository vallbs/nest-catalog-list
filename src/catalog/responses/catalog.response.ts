import { Catalog } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CatalogResponse {
  @ApiProperty({
    description: 'The unique identifier of the catalog',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The user ID who owns this catalog',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  @Exclude()
  userId: string;

  @ApiProperty({
    description: 'The name of the catalog',
    example: 'Electronics',
  })
  name: string;

  @ApiProperty({
    description: 'The vertical category of the catalog',
    example: 'RETAIL',
  })
  vertical: string;

  @ApiProperty({
    description: 'Whether this is a primary catalog',
    example: false,
  })
  primary: boolean;
  constructor(catalog: Catalog) {
    Object.assign(this, catalog);
  }
}

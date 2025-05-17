import { ApiProperty } from '@nestjs/swagger';

export class CatalogResponse {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the catalog item',
  })
  id: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

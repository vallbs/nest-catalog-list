import { ApiProperty } from '@nestjs/swagger';

export class CatalogErrorResponse {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid input data',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Error code',
    example: 'CATALOG_INVALID_INPUT',
    type: String,
  })
  code: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2023-01-01T00:00:00.000Z',
    type: String,
  })
  timestamp: string;

  @ApiProperty({
    description: 'Path where the error occurred',
    example: '/catalog',
    type: String,
  })
  path: string;
}

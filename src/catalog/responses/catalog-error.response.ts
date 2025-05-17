import { ApiProperty } from '@nestjs/swagger';

export enum CatalogErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class CatalogErrorResponse {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error code identifier',
    enum: CatalogErrorCode,
    example: CatalogErrorCode.INVALID_INPUT,
  })
  code: CatalogErrorCode;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid catalog data provided',
  })
  message: string;

  @ApiProperty({
    description: 'Detailed error information',
    example: ['name must contain only letters'],
    required: false,
  })
  details?: string[];

  constructor(statusCode: number, code: CatalogErrorCode, message: string, details?: string[]) {
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

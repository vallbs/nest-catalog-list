import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function SwaggerAuth() {
  return applyDecorators(
    ApiOperation({ summary: 'Authenticate user' }),
    ApiResponse({
      status: 200,
      description: 'User successfully authenticated',
      schema: { $ref: '#/components/schemas/AuthResponse' },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

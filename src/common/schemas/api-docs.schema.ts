import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const UserResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'uuid-here' },
    email: { type: 'string', example: 'user@example.com' },
    userName: { type: 'string', example: 'johnDoe' },
  },
};

export const AuthResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
    user: { $ref: '#/components/schemas/UserResponse' },
  },
};

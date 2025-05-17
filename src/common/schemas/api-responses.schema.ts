import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const TokenResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'string',
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
    },
  },
};

export const UserResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    email: {
      type: 'string',
      example: 'user@example.com',
    },
    userName: {
      type: 'string',
      example: 'john_doe',
    },
  },
};

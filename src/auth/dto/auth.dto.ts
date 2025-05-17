import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseAuthDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}

export abstract class SignInDto extends BaseAuthDto {
  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  password: string;
}

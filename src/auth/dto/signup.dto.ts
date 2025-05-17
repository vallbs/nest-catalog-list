import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { IsPasswordsMatching } from 'src/common/validators';
import { isEmailUnique, isUserNameUnique } from '../common/validators';

export class SignUpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    format: 'email',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @isEmailUnique()
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @isUserNameUnique()
  userName: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password',
    minLength: 6,
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Repeat password for confirmation',
    minLength: 6,
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Validate(IsPasswordsMatching)
  repeatPassword: string;
}

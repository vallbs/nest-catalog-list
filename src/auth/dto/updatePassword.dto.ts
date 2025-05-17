import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { IsNewPasswordsMatching } from 'src/common/validators';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address or username',
    examples: ['user@example.com', 'johndoe'],
  })
  @IsNotEmpty()
  @IsString()
  emailOrUserName: string;

  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password',
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password',
    minLength: 6,
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Repeat new password for confirmation',
    minLength: 6,
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Validate(IsNewPasswordsMatching)
  repeatNewPassword: string;
}

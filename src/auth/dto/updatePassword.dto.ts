import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { IsNewPasswordsMatching } from 'src/common/validators';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  emailOrUserName: string;

  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Validate(IsNewPasswordsMatching)
  repeatNewPassword: string;
}

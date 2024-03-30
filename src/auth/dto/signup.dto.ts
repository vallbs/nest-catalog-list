import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { IsPasswordsMatching } from 'src/common/validators';
import { isEmailUnique, isUserNameUnique } from '../common/validators';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @isEmailUnique()
  email: string;

  @IsNotEmpty()
  @IsString()
  @isUserNameUnique()
  userName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Validate(IsPasswordsMatching)
  repeatPassword: string;
}

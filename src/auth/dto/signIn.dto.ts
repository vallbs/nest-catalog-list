import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { isEmailUnique } from 'src/auth/common/validators/is-unique-emails.validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

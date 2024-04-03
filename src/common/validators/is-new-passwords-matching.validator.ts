import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UpdatePasswordDto } from 'src/auth/dto';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsNewPasswordsMatching implements ValidatorConstraintInterface {
  validate(passwordRepeat: string, args: ValidationArguments) {
    const obj = args.object as UpdatePasswordDto;
    return obj.newPassword === passwordRepeat;
  }

  defaultMessage(): string {
    return 'passwords do not match';
  }
}

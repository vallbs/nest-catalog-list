import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { SignUpDto } from 'src/auth/dto';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatching implements ValidatorConstraintInterface {
  validate(passwordRepeat: string, args: ValidationArguments) {
    const obj = args.object as SignUpDto;
    return obj.password === passwordRepeat;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}

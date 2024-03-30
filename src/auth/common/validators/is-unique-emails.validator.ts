import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { UserService } from 'src/user/user.service';

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class IsEmailUnique implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(value: string): Promise<boolean> {
    const user = await this.userService.findOne(value);

    if (user) {
      throw new ConflictException('User with entered email already exists');
    }

    return true;
  }
}

export function isEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEmailUnique,
    });
  };
}

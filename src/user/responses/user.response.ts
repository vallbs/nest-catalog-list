import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  id: string;
  email: string;
  userName: string;
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  createdAt: Date;

  constructor(user: User) {
    Object.assign(this, user);
  }
}

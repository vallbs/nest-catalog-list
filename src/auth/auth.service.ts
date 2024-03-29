import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  signup(user: Partial<User>) {
    const { email, userName, password } = user;

    return this.prismaService.user.create({
      data: {
        email,
        userName,
        password: this.hashPassword(password),
      },
    });
  }

  private hashPassword(password: string): string {
    return hashSync(password, genSaltSync(10));
  }
}

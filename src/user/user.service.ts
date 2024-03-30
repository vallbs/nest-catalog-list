import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(user: Partial<User>) {
    const { email, userName, password } = user;

    return this.prismaService.user.create({
      data: {
        email,
        userName,
        password: this.hashPassword(password),
      },
    });
  }

  findOne(idOrEmail: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });
  }

  private hashPassword(password: string): string {
    return hashSync(password, genSaltSync(10));
  }
}

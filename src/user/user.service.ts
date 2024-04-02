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

  findOne(idOrEmailOrUserName: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrEmailOrUserName }, { email: idOrEmailOrUserName }, { userName: idOrEmailOrUserName }],
      },
    });
  }

  update(userId: string, user: Partial<User>) {
    const { password, ...payloadWithoutPassword } = user;
    const newPayload = { ...payloadWithoutPassword } as Partial<User>;

    if (password) {
      newPayload.password = this.hashPassword(password);
    }

    return this.prismaService.user.update({
      where: { id: userId },
      data: newPayload,
    });
  }

  private hashPassword(password: string): string {
    return hashSync(password, genSaltSync(10));
  }
}

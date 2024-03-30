import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto';
import { SignInDto } from './dto/signIn.dto';
import { Tokens } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  signUp(dto: SignUpDto) {
    return this.userService.create(dto);
  }

  async signIn(dto: SignInDto): Promise<Tokens> {
    const { email, password } = dto;

    const existingUser = await this.userService.findOne(email);

    if (!existingUser) {
      throw new UnauthorizedException(`Incorrect email or password`);
    }

    const doPasswordsMatch = compareSync(password, existingUser.password);

    if (!doPasswordsMatch) {
      throw new UnauthorizedException(`Incorrect email or password`);
    }

    const accessToken = this.getAccessToken(existingUser.id, email);
    const refreshToken = await this.getRefreshToken(existingUser.id);

    return { accessToken, refreshToken };
  }

  private getAccessToken(userId, email) {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }

  private async getRefreshToken(userId: string) {
    return this.prismaService.auth.create({
      data: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
        userAgent: 'user-agent',
      },
    });
  }
}

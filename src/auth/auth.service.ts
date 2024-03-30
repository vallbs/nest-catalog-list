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

    return this.generateTokens(existingUser.id, email);
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    const token = await this.prismaService.auth.delete({ where: { token: refreshToken } });

    if (!token) {
      throw new UnauthorizedException();
    }

    const existingUser = await this.userService.findOne(token.userId);

    if (!existingUser) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(existingUser.id, existingUser.email);
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

  private async generateTokens(userId, email): Promise<Tokens> {
    const accessToken = this.getAccessToken(userId, email);
    const refreshToken = await this.getRefreshToken(userId);

    return { accessToken, refreshToken };
  }
}

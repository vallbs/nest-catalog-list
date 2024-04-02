import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { SignUpDto, UpdatePasswordDto } from './dto';
import { SignInDto } from './dto/signIn.dto';
import { Tokens } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { Auth } from '@prisma/client';

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

  async signIn(dto: SignInDto, userAgent: string): Promise<Tokens> {
    const { email, password } = dto;

    const existingUser = await this.userService.findOne(email);

    if (!existingUser) {
      throw new UnauthorizedException(`Incorrect email or password`);
    }

    const doPasswordsMatch = compareSync(password, existingUser.password);

    if (!doPasswordsMatch) {
      throw new UnauthorizedException(`Incorrect email or password`);
    }

    return this.generateTokens(existingUser.id, email, userAgent);
  }

  async refreshTokens(refreshToken: string, userAgent: string): Promise<Tokens> {
    const token: Auth = await this.prismaService.auth.findUnique({ where: { token: refreshToken } });

    if (!token) {
      throw new UnauthorizedException();
    }

    await this.prismaService.auth.delete({ where: { token: refreshToken } });

    this.checkRefreshTokenExpiration(token);

    const existingUser = await this.userService.findOne(token.userId);

    if (!existingUser) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(existingUser.id, existingUser.email, userAgent);
  }

  signOut(token: string) {
    return this.deleteRefreshToken(token);
  }

  async updatePassword(refreshToken: string, updatePasswordDto: UpdatePasswordDto, userIdFromToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const { email, userName, password } = (await this.userService.findOne(userIdFromToken)) || {};

    // checking that user who is triyng to update the password is using token generated for him (not compromised)
    if (email !== updatePasswordDto.emailOrUserName && userName !== updatePasswordDto.emailOrUserName) {
      throw new UnauthorizedException(`Incorrect email or userName or password`);
    }

    const doPasswordsMatch = compareSync(updatePasswordDto.oldPassword, password);

    if (!doPasswordsMatch) {
      throw new UnauthorizedException(`Incorrect email or userName or password`);
    }

    const payloadToUpdate = {
      password: updatePasswordDto.newPassword,
    };

    try {
      // should perform actions not in parrallel in order not to delete tokens when possible error on update happens
      await this.userService.update(userIdFromToken, payloadToUpdate);
      await this.deleteAllRefreshTokensForUser(userIdFromToken);

      return;
    } catch (err: any) {
      throw new InternalServerErrorException();
    }
  }

  private getAccessToken(userId, email) {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }

  private async createRefreshToken(userId: string, userAgent: string) {
    const { token = '' } =
      (await this.prismaService.auth.findFirst({
        where: { userId, userAgent },
      })) || {};

    return this.prismaService.auth.upsert({
      where: { token },
      update: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
      },
      create: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
        userAgent,
      },
    });
  }

  private async generateTokens(userId: string, email: string, userAgent: string): Promise<Tokens> {
    const accessToken = this.getAccessToken(userId, email);
    const refreshToken = await this.createRefreshToken(userId, userAgent);

    return { accessToken, refreshToken };
  }

  private checkRefreshTokenExpiration(refreshToken: Auth) {
    const isExpiredToken = new Date(refreshToken.exp) < new Date();

    if (isExpiredToken) {
      throw new UnauthorizedException();
    }
  }

  private deleteRefreshToken(token: string) {
    return this.prismaService.auth.delete({ where: { token } });
  }

  private deleteAllRefreshTokensForUser(userId: string) {
    return this.prismaService.auth.deleteMany({ where: { userId: { equals: userId } } });
  }
}

import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Post,
  Put,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth } from '@prisma/client';
import { Response } from 'express';
import { REFRESH_TOKEN } from 'src/common/consts';
import { Cookie, CurrentUser, UserAgent } from 'src/common/decorators';
import { UserResponse } from 'src/user/responses';
import { AuthService } from './auth.service';
import { SignUpDto, UpdatePasswordDto } from './dto';
import { SignInDto } from './dto/signIn.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    const newUser = await this.authService.signUp(dto);

    if (!newUser) {
      throw new BadRequestException('Could not create user');
    }

    return new UserResponse(newUser);
  }

  @ApiOperation({ summary: 'Sign in user' })
  @Post('signin')
  async signIn(@Body() dto: SignInDto, @Res() res: Response, @UserAgent() agent: string = 'e2e-test') {
    const { accessToken, refreshToken } = await this.authService.signIn(dto, agent);

    if (!accessToken || !refreshToken) {
      throw new BadRequestException('Could not login');
    }

    this.setRefreshTokenToCookies(refreshToken, res);

    res.status(HttpStatus.OK).json({ accessToken });
  }

  @ApiOperation({ summary: 'Sign out user' })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post('signout')
  async logOut(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }

    await this.authService.signOut(refreshToken);

    const noRefreshToken: Auth = {
      token: '',
      exp: new Date(),
      userId: '',
      userAgent: '',
    };

    this.setRefreshTokenToCookies(noRefreshToken, res);
    res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-tokens')
  async refreshToken(
    @Cookie(REFRESH_TOKEN) refreshTokenFromCookies: string,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    if (!refreshTokenFromCookies) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } = await this.authService.refreshTokens(refreshTokenFromCookies, agent);
    this.setRefreshTokenToCookies(refreshToken, res);

    res.status(HttpStatus.OK).json({ accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async updatePassword(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Body() dto: UpdatePasswordDto,
    @CurrentUser('sub') userIdFromToken: string,
    @Res() res: Response,
  ) {
    await this.authService.updatePassword(refreshToken, dto, userIdFromToken);

    const noRefreshToken: Auth = {
      token: '',
      exp: new Date(),
      userId: '',
      userAgent: '',
    };

    this.setRefreshTokenToCookies(noRefreshToken, res);
    res.sendStatus(HttpStatus.OK);
  }

  private setRefreshTokenToCookies(refreshToken: Auth, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    res.cookie(REFRESH_TOKEN, refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(refreshToken.exp),
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
  }
}

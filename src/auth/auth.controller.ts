import { BadRequestException, Body, Controller, HttpStatus, Post, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto';
import { SignInDto } from './dto/signIn.dto';
import { Auth } from '@prisma/client';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, Public, UserAgent } from 'src/common/decorators';

const REFRESH_TOKEN = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    const newUser = await this.authService.signUp(dto);

    if (!newUser) {
      throw new BadRequestException('Could not create user');
    }
  }

  @Public()
  @Post('signin')
  async signIn(@Body() dto: SignInDto, @Res() res: Response, @UserAgent() agent: string) {
    const { accessToken, refreshToken } = await this.authService.signIn(dto, agent);

    if (!accessToken || !refreshToken) {
      throw new BadRequestException('Could not login');
    }

    this.setRefreshTokenToCookies(refreshToken, res);

    res.status(HttpStatus.OK).json({ accessToken });
  }

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

import { Auth } from '@prisma/client';

export interface Tokens {
  accessToken: string;
  refreshToken: Auth;
}

export interface JwtPayload {
  sub: string;
  email: string;
  userName: string;
}

import { Auth } from '@prisma/client';

export interface Tokens {
  accessToken: string;
  refreshToken: Auth;
}

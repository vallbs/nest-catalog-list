import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/auth/interfaces';

export const CurrentUser = createParamDecorator((key: keyof JwtPayload, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return key ? request.user[key] : request.user;
});

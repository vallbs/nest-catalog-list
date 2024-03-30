import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookie = createParamDecorator((key: string, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  if (!key) {
    return request.cookies;
  }

  if (key in request.cookies) {
    return request.cookies[key];
  }

  return null;
});

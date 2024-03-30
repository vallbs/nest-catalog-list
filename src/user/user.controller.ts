import { ClassSerializerInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';
import { JwtPayload } from 'src/auth/interfaces';

@Controller('user')
export class UserController {
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  me(user: JwtPayload) {}
}

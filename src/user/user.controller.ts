import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Cookie, CurrentUser } from 'src/common/decorators';
import { UserResponse } from './responses';
import { UserService } from './user.service';
import { REFRESH_TOKEN } from 'src/common/consts';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Cookie(REFRESH_TOKEN) refreshToken: string, @CurrentUser('sub') userId: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const existingUser = await this.userService.findOne(userId);

    if (!existingUser) {
      throw new NotFoundException();
    }

    return new UserResponse(existingUser);
  }
}

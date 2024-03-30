import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';
import { UserService } from 'src/user/user.service';
import { IsEmailUnique } from './common/validators';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, IsEmailUnique],
  imports: [PassportModule, JwtModule.registerAsync(options())],
})
export class AuthModule {}

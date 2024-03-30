import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VALIDATORS } from './common/validators';
import { options } from './config';
import { GUARDS } from './guards';
import { STRATEGIES } from './strategies';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, ...VALIDATORS, ...STRATEGIES, ...GUARDS],
  imports: [PassportModule, JwtModule.registerAsync(options())],
})
export class AuthModule {}

import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { APP_PIPE } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    // ConfigModule.forRoot({ isGlobal: true, envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' }),
    ConfigModule.forRoot({ isGlobal: true }),
    CatalogModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}

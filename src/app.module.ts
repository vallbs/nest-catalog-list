import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [UserModule, PrismaModule, AuthModule, ConfigModule.forRoot({ isGlobal: true }), CatalogModule],
})
export class AppModule {}

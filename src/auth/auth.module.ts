import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PrismaModule } from '../prisma/prisma.module'
import { GoogleStrategy } from './google.strategy'
import { PassportModule } from '@nestjs/passport'

@Module({ 
  imports: [PrismaModule, PassportModule.register({ session: false })], 
  controllers: [AuthController], 
  providers: [AuthService, GoogleStrategy], 
  exports: [AuthService] 
})
export class AuthModule {}

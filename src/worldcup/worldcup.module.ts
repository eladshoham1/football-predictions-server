import { Module } from '@nestjs/common'
import { WorldcupController } from './worldcup.controller'
import { WorldcupService } from './worldcup.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WorldcupController],
  providers: [WorldcupService],
  exports: [WorldcupService],
})
export class WorldcupModule {}

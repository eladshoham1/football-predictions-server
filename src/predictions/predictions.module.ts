import { Module } from '@nestjs/common'
import { PredictionsController } from './predictions.controller'
import { PredictionsService } from './predictions.service'
import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../prisma/prisma.module'
import { MatchLockGuard } from '../guards/match-lock.guard'

@Module({ 
  imports: [AuthModule, PrismaModule], 
  controllers: [PredictionsController], 
  providers: [PredictionsService, MatchLockGuard] 
})
export class PredictionsModule {}

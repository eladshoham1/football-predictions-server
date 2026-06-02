import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { ScoringModule } from '../scoring/scoring.module'
import { EmailModule } from '../email/email.module'
import { AdminGuard } from '../guards/admin.guard'
import { MatchNotificationCron } from '../cron/match-notification.cron'

@Module({
  imports: [PrismaModule, AuthModule, ScoringModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard, MatchNotificationCron],
})
export class AdminModule {}

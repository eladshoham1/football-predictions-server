import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { MatchesModule } from './matches/matches.module'
import { LeaderboardModule } from './leaderboard/leaderboard.module'
import { AuthModule } from './auth/auth.module'
import { PredictionsModule } from './predictions/predictions.module'
import { ScoringModule } from './scoring/scoring.module'
import { AdminModule } from './admin/admin.module'
import { ExternalApiModule } from './external-api/external-api.module'
import { EmailModule } from './email/email.module'
import { MatchSyncCron } from './cron/match-sync.cron'
import { MatchNotificationCron } from './cron/match-notification.cron'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    ScheduleModule.forRoot(),
    PrismaModule, 
    AuthModule,
    ExternalApiModule,
    EmailModule,
    ScoringModule,
    AdminModule,
    MatchesModule, 
    LeaderboardModule, 
    PredictionsModule
  ],
  providers: [MatchSyncCron, MatchNotificationCron],
})
export class AppModule {}

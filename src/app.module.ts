import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { MatchesModule } from './matches/matches.module'
import { LeaderboardModule } from './leaderboard/leaderboard.module'
import { AuthModule } from './auth/auth.module'
import { PredictionsModule } from './predictions/predictions.module'
import { WorldcupModule } from './worldcup/worldcup.module'
import { ScoringModule } from './scoring/scoring.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule, 
    AuthModule,
    WorldcupModule,
    ScoringModule,
    AdminModule,
    MatchesModule, 
    LeaderboardModule, 
    PredictionsModule
  ],
})
export class AppModule {}

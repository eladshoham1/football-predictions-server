import { Module } from '@nestjs/common'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'
import { TeamsController } from './teams.controller'
import { MatchSyncController } from './match-sync.controller'
import { MatchSyncService } from './match-sync.service'
import { ExternalApiModule } from '../external-api/external-api.module'
import { ScoringModule } from '../scoring/scoring.module'
import { AuthModule } from '../auth/auth.module'

@Module({ 
  imports: [ExternalApiModule, ScoringModule, AuthModule],
  controllers: [MatchesController, TeamsController, MatchSyncController], 
  providers: [MatchesService, MatchSyncService],
  exports: [MatchSyncService]
})
export class MatchesModule {}

import { Module } from '@nestjs/common'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'
import { TeamsController } from './teams.controller'

@Module({ controllers: [MatchesController, TeamsController], providers: [MatchesService] })
export class MatchesModule {}

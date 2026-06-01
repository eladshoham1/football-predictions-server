import { Controller, Get } from '@nestjs/common'
import { MatchesService } from './matches.service'

@Controller()
export class MatchesController {
  constructor(private readonly svc: MatchesService) {}

  @Get('matches')
  async getMatches() {
    return this.svc.list()
  }

  @Get('wc-matches')
  async getWcMatches() {
    return this.svc.listEnriched()
  }
}

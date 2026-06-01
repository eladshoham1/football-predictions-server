import { Controller, Get } from '@nestjs/common'
import { LeaderboardService } from './leaderboard.service'

@Controller()
export class LeaderboardController {
  constructor(private readonly svc: LeaderboardService) {}

  @Get('leaderboard')
  async getLeaderboard() {
    return this.svc.get()
  }
}

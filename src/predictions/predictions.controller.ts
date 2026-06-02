import { Body, Controller, Post, Req, Get, UnauthorizedException, UseGuards, Query } from '@nestjs/common'
import { PredictionsService } from './predictions.service'
import { AuthService } from '../auth/auth.service'
import { MatchLockGuard } from '../guards/match-lock.guard'

@Controller('predictions')
export class PredictionsController {
  constructor(private svc: PredictionsService, private authService: AuthService) {}

  @Post('match')
  @UseGuards(MatchLockGuard)
  async upsertMatch(@Req() req: any, @Body() body: { matchId: string; homeScore: number; awayScore: number; firstGoalScorerId?: string }) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.upsertForUser(user.id, body)
  }

  @Get('match')
  async myMatches(@Req() req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.forUserId(user.id)
  }

  @Get('match/all')
  async allMatchPredictions(@Req() req: any, @Query('matchId') matchId: string) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    if (!matchId) throw new UnauthorizedException('Match ID is required')
    return this.svc.forMatchId(matchId)
  }

  @Post('group')
  async upsertGroup(@Req() req: any, @Body() body: { groupName: string; firstPlaceTeamId: string; secondPlaceTeamId: string; thirdPlaceTeamId?: string; fourthPlaceTeamId?: string }) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.upsertGroupPrediction(user.id, body)
  }

  @Get('group')
  async myGroups(@Req() req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.getUserGroupPredictions(user.id)
  }

  @Post('bracket')
  async upsertBracket(@Req() req: any, @Body() body: { matchId: string; predictedWinnerTeamId: string }) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.upsertBracketPrediction(user.id, body)
  }

  @Get('bracket')
  async myBrackets(@Req() req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.getUserBracketPredictions(user.id)
  }

  @Post('brackets')
  async upsertBrackets(
    @Req() req: any,
    @Body() body: {
      bracketPredictions: Array<{ matchId: string; predictedWinnerTeamId: string }>
      tournamentWinnerId: string
      thirdPlaceWinnerId: string
    }
  ) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.upsertBracketPredictions(user.id, body)
  }

  @Post('tournament')
  async upsertTournament(@Req() req: any, @Body() body: { winnerTeamId: string; goldenBootPlayerId?: string }) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.upsertTournamentPrediction(user.id, body)
  }

  @Get('tournament')
  async myTournament(@Req() req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.getUserTournamentPrediction(user.id)
  }

  @Post('groups')
  async upsertGroups(
    @Req() req: any,
    @Body() body: { predictions: Array<{ groupName: string; firstPlaceTeamId: string; secondPlaceTeamId: string; thirdPlaceTeamId?: string; fourthPlaceTeamId?: string }> }
  ) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return this.svc.upsertGroupPredictions(user.id, body.predictions)
  }

  @Get('group-lock-status')
  async getGroupsLockStatus() {
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    const statusPromises = groups.map(async (groupName) => {
      const status = await this.svc.getGroupLockStatus(groupName)
      return { groupName, ...status }
    })
    return Promise.all(statusPromises)
  }
}

import { Controller, Post, Get, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common'
import { MatchSyncService } from './match-sync.service'
import { ExternalApiService } from '../external-api/external-api.service'
import { ScoringService } from '../scoring/scoring.service'
import { AuthService } from '../auth/auth.service'

@Controller('admin/match-sync')
export class MatchSyncController {
  constructor(
    private matchSync: MatchSyncService,
    private externalApi: ExternalApiService,
    private scoring: ScoringService,
    private authService: AuthService
  ) {}

  /**
   * Manual sync for a single match
   */
  @Post(':matchId')
  async syncSingleMatch(@Req() req: any, @Param('matchId') matchId: string) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required')
    }

    return this.matchSync.syncMatch(matchId)
  }

  /**
   * Sync all finished matches
   */
  @Post()
  async syncAllMatches(@Req() req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required')
    }

    return this.matchSync.syncAllFinishedMatches()
  }

  /**
   * Get sync status
   */
  @Get('status')
  async getSyncStatus(@Req() req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required')
    }

    return this.matchSync.getSyncStatus()
  }

  /**
   * Test API connection
   */
  @Get('test-api')
  async testApiConnection(@Req() req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required')
    }

    const isConnected = await this.externalApi.testConnection()
    const remaining = await this.externalApi.getRemainingRequests()

    return {
      connected: isConnected,
      remainingRequests: remaining,
    }
  }

  /**
   * Recalculate points for a match
   */
  @Post(':matchId/recalculate')
  async recalculateMatchPoints(@Req() req: any, @Param('matchId') matchId: string) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required')
    }

    const predictionsUpdated = await this.scoring.calculateMatchPoints(matchId)
    
    return {
      success: true,
      message: `Recalculated points for ${predictionsUpdated} predictions`,
    }
  }
}

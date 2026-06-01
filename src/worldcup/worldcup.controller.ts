import { Controller, Post, Get, UseGuards, UnauthorizedException, Req } from '@nestjs/common'
import { WorldcupService } from './worldcup.service'
import { AuthService } from '../auth/auth.service'

@Controller('worldcup')
export class WorldcupController {
  constructor(
    private worldcupService: WorldcupService,
    private authService: AuthService,
  ) {}

  @Post('sync')
  async syncMatches(@Req() req: any) {
    const user = await this.getUserFromRequest(req)
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required')
    }
    return await this.worldcupService.syncMatches()
  }

  // Development endpoint - remove in production
  @Post('sync-dev')
  async syncMatchesDev() {
    return await this.worldcupService.syncMatches()
  }

  @Get('sync-logs')
  async getSyncLogs(@Req() req: any) {
    const user = await this.getUserFromRequest(req)
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required')
    }
    return await this.worldcupService.getSyncLogs()
  }

  private async getUserFromRequest(req: any) {
    const auth = req.headers.authorization
    if (!auth) return null
    const token = auth.replace(/^Bearer\s+/, '')
    return await this.authService.verifyToken(token)
  }
}

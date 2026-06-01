import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminGuard } from '../guards/admin.guard'
import { AuthService } from '../auth/auth.service'

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  private async authenticateAdmin(req: any) {
    const auth = req.headers.authorization
    const token = auth ? auth.replace(/^Bearer\s+/, '') : null
    const user = await this.authService.verifyToken(token || '')
    if (!user) throw new UnauthorizedException()
    return user
  }

  @Get('users')
  @UseGuards(AdminGuard)
  async getAllUsers(@Req() req: any) {
    await this.authenticateAdmin(req)
    return this.adminService.getAllUsers()
  }

  @Patch('users/:userId/role')
  @UseGuards(AdminGuard)
  async updateUserRole(@Req() req: any, @Param('userId') userId: string, @Body() body: { role: 'USER' | 'ADMIN' }) {
    await this.authenticateAdmin(req)
    return this.adminService.updateUserRole(userId, body.role)
  }

  @Delete('users/:userId')
  @UseGuards(AdminGuard)
  async deleteUser(@Req() req: any, @Param('userId') userId: string) {
    await this.authenticateAdmin(req)
    return this.adminService.deleteUser(userId)
  }

  @Get('scoring-config')
  @UseGuards(AdminGuard)
  async getScoringConfig(@Req() req: any) {
    await this.authenticateAdmin(req)
    return this.adminService.getScoringConfig()
  }

  @Patch('scoring-config')
  @UseGuards(AdminGuard)
  async updateScoringConfig(@Req() req: any, @Body() body: any) {
    await this.authenticateAdmin(req)
    return this.adminService.updateScoringConfig(body)
  }

  @Post('scoring/calculate-match/:matchId')
  @UseGuards(AdminGuard)
  async calculateMatchPoints(@Req() req: any, @Param('matchId') matchId: string) {
    await this.authenticateAdmin(req)
    return this.adminService.calculateMatchPoints(matchId)
  }

  @Post('scoring/calculate-group/:groupName')
  @UseGuards(AdminGuard)
  async calculateGroupPoints(@Req() req: any, @Param('groupName') groupName: string) {
    await this.authenticateAdmin(req)
    return this.adminService.calculateGroupPoints(groupName)
  }

  @Post('scoring/calculate-bracket/:matchId')
  @UseGuards(AdminGuard)
  async calculateBracketPoints(@Req() req: any, @Param('matchId') matchId: string) {
    await this.authenticateAdmin(req)
    return this.adminService.calculateBracketPoints(matchId)
  }

  @Post('scoring/calculate-tournament')
  @UseGuards(AdminGuard)
  async calculateTournamentPoints(@Req() req: any) {
    await this.authenticateAdmin(req)
    return this.adminService.calculateTournamentPoints()
  }

  @Post('scoring/recalculate-user/:userId')
  @UseGuards(AdminGuard)
  async recalculateUserPoints(@Req() req: any, @Param('userId') userId: string) {
    await this.authenticateAdmin(req)
    return this.adminService.recalculateUserPoints(userId)
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  async getStats(@Req() req: any) {
    await this.authenticateAdmin(req)
    return this.adminService.getStats()
  }
}

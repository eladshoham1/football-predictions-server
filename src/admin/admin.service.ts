import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ScoringService } from '../scoring/scoring.service'
import { EmailService } from '../email/email.service'
import { MatchNotificationCron } from '../cron/match-notification.cron'
import { UserRole } from '@prisma/client'

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
    private emailService: EmailService,
    private notificationCron: MatchNotificationCron,
  ) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            matchPredictions: true,
            groupPredictions: true,
            bracketPredictions: true,
            tournamentPredictions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    })
  }

  async deleteUser(userId: string) {
    // Cascade delete will handle all predictions
    return this.prisma.user.delete({
      where: { id: userId },
    })
  }

  async getScoringConfig() {
    return this.prisma.scoringConfig.findUnique({
      where: { id: 'default' },
    })
  }

  async updateScoringConfig(data: any) {
    return this.prisma.scoringConfig.update({
      where: { id: 'default' },
      data,
    })
  }

  async calculateMatchPoints(matchId: string) {
    const count = await this.scoringService.calculateMatchPoints(matchId)
    return { success: true, updatedPredictions: count }
  }

  async calculateGroupPoints(groupName: string) {
    const count = await this.scoringService.calculateGroupPoints(groupName)
    return { success: true, updatedPredictions: count }
  }

  async calculateBracketPoints(matchId: string) {
    const count = await this.scoringService.calculateBracketPoints(matchId)
    return { success: true, updatedPredictions: count }
  }

  async calculateTournamentPoints() {
    const count = await this.scoringService.calculateTournamentPoints()
    return { success: true, updatedPredictions: count }
  }

  async recalculateUserPoints(userId: string) {
    await this.scoringService.recalculateUserPoints(userId)
    return { success: true }
  }

  async getStats() {
    const [totalUsers, totalMatches, totalPredictions, finishedMatches] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.match.count(),
      this.prisma.matchPrediction.count(),
      this.prisma.match.count({ where: { status: 'FINISHED' } }),
    ])

    return {
      totalUsers,
      totalMatches,
      totalPredictions,
      finishedMatches,
      upcomingMatches: totalMatches - finishedMatches,
    }
  }

  async triggerNotificationCheck() {
    await this.notificationCron.triggerNotificationCheck()
    return { success: true, message: 'Notification check triggered' }
  }

  async testEmailService(email: string) {
    const testResult = await this.emailService.sendEmail({
      to: email,
      subject: 'Test Email from World Cup 2026 Predictions',
      html: '<h1>Test Email</h1><p>If you received this email, your email service is configured correctly!</p>',
    })

    if (testResult) {
      return { success: true, message: 'Test email sent successfully' }
    } else {
      return { success: false, message: 'Failed to send test email' }
    }
  }
}

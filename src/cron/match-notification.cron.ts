import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'

@Injectable()
export class MatchNotificationCron {
  private readonly logger = new Logger(MatchNotificationCron.name)

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Runs every 15 minutes to check for upcoming matches
   * Sends reminder emails to users who haven't predicted yet
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkUpcomingMatches() {
    this.logger.log('Checking for upcoming matches requiring notifications...')

    try {
      const now = new Date()
      // Check for matches starting between 1:45 and 2:15 hours from now
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      const twoHoursMinusFifteen = new Date(twoHoursFromNow.getTime() - 15 * 60 * 1000)
      const twoHoursPlusFifteen = new Date(twoHoursFromNow.getTime() + 15 * 60 * 1000)

      // Find matches starting in ~2 hours that are scheduled
      const upcomingMatches = await this.prisma.match.findMany({
        where: {
          kickoffTime: {
            gte: twoHoursMinusFifteen,
            lte: twoHoursPlusFifteen,
          },
          status: 'SCHEDULED',
        },
        include: {
          homeTeam: {
            select: {
              name: true,
              hebrewName: true,
            },
          },
          awayTeam: {
            select: {
              name: true,
              hebrewName: true,
            },
          },
          predictions: {
            select: {
              userId: true,
            },
          },
          notifications: {
            select: {
              userId: true,
            },
          },
        },
      })

      if (upcomingMatches.length === 0) {
        this.logger.log('No matches found in the notification window')
        return
      }

      this.logger.log(`Found ${upcomingMatches.length} upcoming matches`)

      // Get all users
      const allUsers = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      let totalSent = 0
      let totalSkipped = 0
      let totalFailed = 0

      for (const match of upcomingMatches) {
        const usersWhoPredicted = new Set(match.predictions.map(p => p.userId))
        const usersNotified = new Set(match.notifications.map(n => n.userId))

        // Find users who haven't predicted and haven't been notified
        const usersToNotify = allUsers.filter(
          user => !usersWhoPredicted.has(user.id) && !usersNotified.has(user.id)
        )

        this.logger.log(
          `Match ${match.homeTeam.hebrewName} vs ${match.awayTeam.hebrewName}: ` +
          `${usersToNotify.length} users to notify`
        )

        for (const user of usersToNotify) {
          try {
            const sent = await this.emailService.sendMatchReminderEmail(
              user.email,
              user.name,
              {
                homeTeam: match.homeTeam.hebrewName || match.homeTeam.name,
                awayTeam: match.awayTeam.hebrewName || match.awayTeam.name,
                kickoffTime: match.kickoffTime,
                matchId: match.id,
              }
            )

            if (sent) {
              // Record the notification in the database
              await this.prisma.matchNotification.create({
                data: {
                  userId: user.id,
                  matchId: match.id,
                },
              })
              totalSent++
            } else {
              totalSkipped++
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (error: any) {
            this.logger.error(
              `Failed to send notification to ${user.email} for match ${match.id}: ${error?.message || String(error)}`
            )
            totalFailed++
          }
        }
      }

      this.logger.log(
        `Notification check complete: ${totalSent} sent, ${totalSkipped} skipped, ${totalFailed} failed`
      )
    } catch (error: any) {
      this.logger.error(`Failed to check upcoming matches: ${error?.message || String(error)}`)
    }
  }

  /**
   * Manual trigger for testing purposes
   */
  async triggerNotificationCheck() {
    this.logger.log('Manually triggering notification check...')
    await this.checkUpcomingMatches()
  }
}

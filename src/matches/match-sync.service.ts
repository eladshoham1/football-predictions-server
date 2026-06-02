import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ExternalApiService } from '../external-api/external-api.service'
import { ScoringService } from '../scoring/scoring.service'

@Injectable()
export class MatchSyncService {
  private readonly logger = new Logger(MatchSyncService.name)

  constructor(
    private prisma: PrismaService,
    private externalApi: ExternalApiService,
    private scoring: ScoringService
  ) {}

  /**
   * Sync a single match result from external API
   */
  async syncMatch(matchId: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Syncing match ${matchId}`)

      // Get match from database
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
      })

      if (!match) {
        return { success: false, message: 'Match not found' }
      }

      if (!match.externalApiId) {
        return { success: false, message: 'Match has no external API ID' }
      }

      // Fetch result from API
      const result = await this.externalApi.getMatchResult(parseInt(match.externalApiId))

      if (!result) {
        return { success: false, message: 'Failed to fetch match result from API' }
      }

      // Only sync finished matches
      if (result.status !== 'FT') {
        return { success: false, message: `Match not finished (status: ${result.status})` }
      }

      // Find actual first goal scorer in our database
      let actualFirstGoalScorerId: string | null = null
      
      if (result.firstGoalScorer) {
        // Try to find player by external API ID
        const player = await this.prisma.player.findFirst({
          where: {
            externalApiId: result.firstGoalScorer.playerId.toString(),
          },
        })

        if (player) {
          actualFirstGoalScorerId = player.id
          this.logger.log(`Found first goal scorer: ${result.firstGoalScorer.playerName} (${player.id})`)
        } else {
          // Try to find by name and team
          const teamId = result.firstGoalScorer.team === 'home' ? match.homeTeamId : match.awayTeamId
          const playerByName = await this.prisma.player.findFirst({
            where: {
              teamId,
              name: { contains: result.firstGoalScorer.playerName, mode: 'insensitive' },
            },
          })

          if (playerByName) {
            actualFirstGoalScorerId = playerByName.id
            this.logger.log(`Found first goal scorer by name: ${result.firstGoalScorer.playerName}`)
          } else {
            this.logger.warn(`Could not find player: ${result.firstGoalScorer.playerName}`)
          }
        }
      }

      // Update match in database
      await this.prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          status: 'FINISHED',
          actualFirstGoalScorerId,
          isSynced: true,
          syncedAt: new Date(),
        },
      })

      this.logger.log(`Match ${matchId} synced: ${result.homeScore}-${result.awayScore}`)

      // Calculate and award points
      const predictionsUpdated = await this.scoring.calculateMatchPoints(matchId)
      
      this.logger.log(`Scored ${predictionsUpdated} predictions for match ${matchId}`)

      return { 
        success: true, 
        message: `Match synced successfully. ${predictionsUpdated} predictions scored.` 
      }

    } catch (error: any) {
      this.logger.error(`Failed to sync match ${matchId}`, error?.message || String(error))
      return { success: false, message: error?.message || String(error) }
    }
  }

  /**
   * Sync all finished but unsynced matches
   */
  async syncAllFinishedMatches(): Promise<{ synced: number; failed: number; skipped: number }> {
    try {
      this.logger.log('Starting auto-sync of all finished matches')

      // Find matches that are marked as FINISHED but not synced
      const unsyncedMatches = await this.prisma.match.findMany({
        where: {
          status: 'FINISHED',
          isSynced: false,
          externalApiId: { not: null },
        },
      })

      this.logger.log(`Found ${unsyncedMatches.length} unsynced finished matches`)

      let synced = 0
      let failed = 0
      let skipped = 0

      for (const match of unsyncedMatches) {
        const result = await this.syncMatch(match.id)
        
        if (result.success) {
          synced++
        } else if (result.message.includes('not finished')) {
          skipped++
        } else {
          failed++
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      this.logger.log(`Sync complete: ${synced} synced, ${failed} failed, ${skipped} skipped`)

      return { synced, failed, skipped }

    } catch (error: any) {
      this.logger.error('Failed to sync all matches', error?.message || String(error))
      throw error
    }
  }

  /**
   * Get sync status for all matches
   */
  async getSyncStatus() {
    const total = await this.prisma.match.count()
    const synced = await this.prisma.match.count({ where: { isSynced: true } })
    const finished = await this.prisma.match.count({ where: { status: 'FINISHED' } })
    const pendingSync = await this.prisma.match.count({ 
      where: { status: 'FINISHED', isSynced: false } 
    })

    return {
      total,
      synced,
      finished,
      pendingSync,
      syncPercentage: total > 0 ? Math.round((synced / total) * 100) : 0,
    }
  }
}

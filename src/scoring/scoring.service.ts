import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MatchStatus } from '@prisma/client'

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate points for a single match prediction after match finishes
   */
  async calculateMatchPoints(matchId: string): Promise<number> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { predictions: true },
    })

    if (!match || match.status !== MatchStatus.FINISHED) {
      this.logger.warn(`Match ${matchId} not finished, skipping scoring`)
      return 0
    }

    if (match.homeScore === null || match.awayScore === null) {
      this.logger.warn(`Match ${matchId} has no scores, skipping`)
      return 0
    }

    const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } })
    if (!config) {
      throw new Error('Scoring configuration not found')
    }

    let updated = 0
    for (const pred of match.predictions) {
      const points = this.computeMatchPoints(
        pred.predictedHomeScore,
        pred.predictedAwayScore,
        match.homeScore,
        match.awayScore,
        config
      )

      await this.prisma.matchPrediction.update({
        where: { id: pred.id },
        data: { pointsAwarded: points },
      })
      updated++
    }

    this.logger.log(`Scored ${updated} predictions for match ${matchId}`)
    return updated
  }

  /**
   * Core logic to compute points for a match prediction
   */
  private computeMatchPoints(
    predHome: number,
    predAway: number,
    actualHome: number,
    actualAway: number,
    config: { correctWinner: number; correctGoalDifference: number; exactScore: number }
  ): number {
    // Exact score = highest points
    if (predHome === actualHome && predAway === actualAway) {
      return config.exactScore
    }

    const predDiff = predHome - predAway
    const actualDiff = actualHome - actualAway

    // Correct goal difference
    if (predDiff === actualDiff) {
      return config.correctGoalDifference
    }

    // Correct winner (or both predicted draw)
    const predWinner = predDiff > 0 ? 'home' : predDiff < 0 ? 'away' : 'draw'
    const actualWinner = actualDiff > 0 ? 'home' : actualDiff < 0 ? 'away' : 'draw'

    if (predWinner === actualWinner) {
      return config.correctWinner
    }

    return 0
  }

  /**
   * Calculate points for group stage predictions after groups conclude
   */
  async calculateGroupPoints(groupName: string): Promise<number> {
    const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } })
    if (!config) {
      throw new Error('Scoring configuration not found')
    }

    // Get all teams in the group with their match results
    const teams = await this.prisma.team.findMany({
      where: { groupName },
      include: {
        homeMatches: {
          where: { status: MatchStatus.FINISHED },
        },
        awayMatches: {
          where: { status: MatchStatus.FINISHED },
        },
      },
    })

    // Calculate actual standings
    const standings = teams.map((team) => {
      let points = 0
      let gd = 0

      for (const match of team.homeMatches) {
        if (match.homeScore === null || match.awayScore === null) continue
        if (match.homeScore > match.awayScore) points += 3
        else if (match.homeScore === match.awayScore) points += 1
        gd += match.homeScore - match.awayScore
      }

      for (const match of team.awayMatches) {
        if (match.homeScore === null || match.awayScore === null) continue
        if (match.awayScore > match.homeScore) points += 3
        else if (match.homeScore === match.awayScore) points += 1
        gd += match.awayScore - match.homeScore
      }

      return { teamId: team.id, points, gd }
    })

    // Sort by points desc, then goal difference desc
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.gd - a.gd
    })

    const advancingTeams = standings.slice(0, 2).map((s) => s.teamId)

    // Score all group predictions for this group
    const predictions = await this.prisma.groupPrediction.findMany({
      where: { groupName },
    })

    let updated = 0
    for (const pred of predictions) {
      let points = 0

      // Check if predicted teams advanced (any position)
      const firstAdvanced = advancingTeams.includes(pred.firstPlaceTeamId)
      const secondAdvanced = advancingTeams.includes(pred.secondPlaceTeamId)

      if (firstAdvanced) points += config.groupAdvancingTeam
      if (secondAdvanced) points += config.groupAdvancingTeam

      // Check exact positions
      if (pred.firstPlaceTeamId === advancingTeams[0]) {
        points += config.groupCorrectPosition
      }
      if (pred.secondPlaceTeamId === advancingTeams[1]) {
        points += config.groupCorrectPosition
      }

      await this.prisma.groupPrediction.update({
        where: { id: pred.id },
        data: { pointsAwarded: points },
      })
      updated++
    }

    this.logger.log(`Scored ${updated} group predictions for ${groupName}`)
    return updated
  }

  /**
   * Calculate points for bracket predictions after a knockout match finishes
   */
  async calculateBracketPoints(matchId: string): Promise<number> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (!match || match.status !== MatchStatus.FINISHED) {
      return 0
    }

    const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } })
    if (!config) {
      throw new Error('Scoring configuration not found')
    }

    // Determine winning team
    let winnerTeamId: string | null = null
    if (match.homeScore !== null && match.awayScore !== null) {
      if (match.homeScore > match.awayScore) {
        winnerTeamId = match.homeTeamId
      } else if (match.awayScore > match.homeScore) {
        winnerTeamId = match.awayTeamId
      } else if (match.penaltyWinnerId) {
        winnerTeamId = match.penaltyWinnerId
      }
    }

    if (!winnerTeamId) {
      this.logger.warn(`No winner determined for match ${matchId}`)
      return 0
    }

    // Get stage-specific points
    const stagePoints: Record<string, number> = {
      ROUND_OF_32: config.roundOf32,
      ROUND_OF_16: config.roundOf16,
      QUARTER_FINAL: config.quarterFinal,
      SEMI_FINAL: config.semiFinal,
      FINAL: config.final,
    }

    const points = stagePoints[match.stage] || 0

    // Find and update bracket predictions for this match
    const predictions = await this.prisma.bracketPrediction.findMany({
      where: { matchId },
    })

    let updated = 0
    for (const pred of predictions) {
      const awarded = pred.predictedTeamId === winnerTeamId ? points : 0
      await this.prisma.bracketPrediction.update({
        where: { id: pred.id },
        data: { pointsAwarded: awarded },
      })
      updated++
    }

    this.logger.log(`Scored ${updated} bracket predictions for match ${matchId}`)
    return updated
  }

  /**
   * Calculate tournament winner and golden boot predictions after tournament ends
   */
  async calculateTournamentPoints(): Promise<number> {
    const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } })
    if (!config) {
      throw new Error('Scoring configuration not found')
    }

    // Find the final match
    const finalMatch = await this.prisma.match.findFirst({
      where: { stage: 'FINAL', status: MatchStatus.FINISHED },
    })

    if (!finalMatch) {
      this.logger.warn('Final match not finished yet')
      return 0
    }

    let winnerTeamId: string | null = null
    if (finalMatch.homeScore !== null && finalMatch.awayScore !== null) {
      if (finalMatch.homeScore > finalMatch.awayScore) {
        winnerTeamId = finalMatch.homeTeamId
      } else if (finalMatch.awayScore > finalMatch.homeScore) {
        winnerTeamId = finalMatch.awayTeamId
      } else if (finalMatch.penaltyWinnerId) {
        winnerTeamId = finalMatch.penaltyWinnerId
      }
    }

    if (!winnerTeamId) {
      this.logger.warn('No tournament winner determined')
      return 0
    }

    // Get golden boot winner (for now, we'll need to track this manually or via another sync)
    // This is a placeholder - in production you'd sync this from the API
    const goldenBootPlayerId: string | null = null // TODO: Implement player stats tracking

    const predictions = await this.prisma.tournamentPrediction.findMany()

    let updated = 0
    for (const pred of predictions) {
      let winnerPoints = 0
      let goldenBootPoints = 0

      if (pred.winnerTeamId === winnerTeamId) {
        winnerPoints = config.tournamentWinner
      }

      if (goldenBootPlayerId && pred.goldenBootPlayerId === goldenBootPlayerId) {
        goldenBootPoints = config.goldenBoot
      }

      await this.prisma.tournamentPrediction.update({
        where: { id: pred.id },
        data: { winnerPointsAwarded: winnerPoints, goldenBootPointsAwarded: goldenBootPoints },
      })
      updated++
    }

    this.logger.log(`Scored ${updated} tournament predictions`)
    return updated
  }

  /**
   * Recalculate all points for a user (useful for admin corrections)
   */
  async recalculateUserPoints(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        matchPredictions: { include: { match: true } },
        groupPredictions: true,
        bracketPredictions: true,
        tournamentPredictions: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } })
    if (!config) {
      throw new Error('Scoring configuration not found')
    }

    // Recalculate match predictions
    for (const pred of user.matchPredictions) {
      if (pred.match.status === MatchStatus.FINISHED && pred.match.homeScore !== null && pred.match.awayScore !== null) {
        const points = this.computeMatchPoints(
          pred.predictedHomeScore,
          pred.predictedAwayScore,
          pred.match.homeScore,
          pred.match.awayScore,
          config
        )
        await this.prisma.matchPrediction.update({
          where: { id: pred.id },
          data: { pointsAwarded: points },
        })
      }
    }

    this.logger.log(`Recalculated points for user ${userId}`)
  }
}

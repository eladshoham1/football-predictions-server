import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PredictionsService {
  constructor(private prisma: PrismaService) {}

  async upsertForUser(userId: string, payload: { matchId: string; homeScore: number; awayScore: number }) {
    const existing = await this.prisma.matchPrediction.findFirst({ where: { userId, matchId: payload.matchId } })
    if (existing) {
      return this.prisma.matchPrediction.update({ where: { id: existing.id }, data: { predictedHomeScore: payload.homeScore, predictedAwayScore: payload.awayScore } })
    }
    return this.prisma.matchPrediction.create({ data: { userId, matchId: payload.matchId, predictedHomeScore: payload.homeScore, predictedAwayScore: payload.awayScore } })
  }

  async forUserId(userId: string) {
    return this.prisma.matchPrediction.findMany({ where: { userId }, include: { match: { include: { homeTeam: true, awayTeam: true } } } })
  }

  async upsertGroupPrediction(userId: string, payload: { groupName: string; firstPlaceTeamId: string; secondPlaceTeamId: string; thirdPlaceTeamId?: string; fourthPlaceTeamId?: string }) {
    // Check if all group predictions are locked (30 minutes before first tournament match)
    const firstTournamentMatch = await this.prisma.match.findFirst({
      where: { 
        stage: 'GROUP_STAGE'
      },
      orderBy: { kickoffTime: 'asc' }
    })

    if (firstTournamentMatch) {
      const lockTime = new Date(firstTournamentMatch.kickoffTime.getTime() - 30 * 60 * 1000) // 30 minutes before
      if (new Date() >= lockTime) {
        throw new UnauthorizedException('ניחושי שלב הקבוצות נעולים 30 דקות לפני תחילת הטורניר')
      }
    }

    const existing = await this.prisma.groupPrediction.findFirst({ where: { userId, groupName: payload.groupName } })
    if (existing) {
      return this.prisma.groupPrediction.update({
        where: { id: existing.id },
        data: { 
          firstPlaceTeamId: payload.firstPlaceTeamId, 
          secondPlaceTeamId: payload.secondPlaceTeamId,
          thirdPlaceTeamId: payload.thirdPlaceTeamId || null,
          fourthPlaceTeamId: payload.fourthPlaceTeamId || null
        },
      })
    }
    return this.prisma.groupPrediction.create({
      data: {
        userId,
        groupName: payload.groupName,
        firstPlaceTeamId: payload.firstPlaceTeamId,
        secondPlaceTeamId: payload.secondPlaceTeamId,
        thirdPlaceTeamId: payload.thirdPlaceTeamId || null,
        fourthPlaceTeamId: payload.fourthPlaceTeamId || null
      },
    })
  }

  async getUserGroupPredictions(userId: string) {
    return this.prisma.groupPrediction.findMany({
      where: { userId },
      include: { 
        firstPlaceTeam: true, 
        secondPlaceTeam: true,
        thirdPlaceTeam: true,
        fourthPlaceTeam: true
      },
    })
  }

  async upsertGroupPredictions(
    userId: string,
    predictions: Array<{
      groupName: string
      firstPlaceTeamId: string
      secondPlaceTeamId: string
      thirdPlaceTeamId?: string
      fourthPlaceTeamId?: string
    }>
  ) {
    // Check if all group predictions are locked (30 minutes before first tournament match)
    const firstTournamentMatch = await this.prisma.match.findFirst({
      where: { 
        stage: 'GROUP_STAGE'
      },
      orderBy: { kickoffTime: 'asc' }
    })

    if (firstTournamentMatch) {
      const lockTime = new Date(firstTournamentMatch.kickoffTime.getTime() - 30 * 60 * 1000)
      const isLocked = new Date() >= lockTime
      if (isLocked) {
        throw new UnauthorizedException('ניחושי שלב הקבוצות נעולים 30 דקות לפני תחילת הטורניר')
      }
    }

    // Use transaction to ensure all predictions are saved atomically
    return this.prisma.$transaction(
      predictions.map((pred) =>
        this.prisma.groupPrediction.upsert({
          where: {
            userId_groupName: {
              userId,
              groupName: pred.groupName
            }
          },
          create: {
            userId,
            groupName: pred.groupName,
            firstPlaceTeamId: pred.firstPlaceTeamId,
            secondPlaceTeamId: pred.secondPlaceTeamId,
            thirdPlaceTeamId: pred.thirdPlaceTeamId || null,
            fourthPlaceTeamId: pred.fourthPlaceTeamId || null
          },
          update: {
            firstPlaceTeamId: pred.firstPlaceTeamId,
            secondPlaceTeamId: pred.secondPlaceTeamId,
            thirdPlaceTeamId: pred.thirdPlaceTeamId || null,
            fourthPlaceTeamId: pred.fourthPlaceTeamId || null
          }
        })
      )
    )
  }

  async upsertBracketPrediction(userId: string, payload: { matchId: string; predictedWinnerTeamId: string }) {
    const existing = await this.prisma.bracketPrediction.findFirst({ where: { userId, matchId: payload.matchId } })
    if (existing) {
      return this.prisma.bracketPrediction.update({
        where: { id: existing.id },
        data: { predictedTeamId: payload.predictedWinnerTeamId },
      })
    }
    return this.prisma.bracketPrediction.create({
      data: { userId, matchId: payload.matchId, predictedTeamId: payload.predictedWinnerTeamId },
    })
  }

  async getUserBracketPredictions(userId: string) {
    return this.prisma.bracketPrediction.findMany({
      where: { userId },
      include: { predictedTeam: true },
    })
  }

  async upsertBracketPredictions(
    userId: string,
    payload: {
      bracketPredictions: Array<{ matchId: string; predictedWinnerTeamId: string }>
      tournamentWinnerId: string
      thirdPlaceWinnerId: string
    }
  ) {
    // Validation: Check all required stages are complete
    const requiredStages = {
      R32: 16, // 16 matches in Round of 32
      R16: 8,  // 8 matches in Round of 16
      QF: 4,   // 4 Quarter Finals
      SF: 2,   // 2 Semi Finals
    }

    // Count predictions by stage
    const stageCounts: Record<string, number> = {}
    payload.bracketPredictions.forEach(pred => {
      const stage = pred.matchId.split('_')[0]
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
    })

    // Validate each stage
    const missingStages: string[] = []
    Object.entries(requiredStages).forEach(([stage, required]) => {
      const count = stageCounts[stage] || 0
      if (count < required) {
        const stageNames: Record<string, string> = {
          R32: 'שלב 32',
          R16: 'שמינית גמר',
          QF: 'רבע גמר',
          SF: 'חצי גמר'
        }
        missingStages.push(`${stageNames[stage]} (${count}/${required})`)
      }
    })

    // Check tournament winner
    if (!payload.tournamentWinnerId) {
      missingStages.push('זוכה הטורניר (גמר)')
    }

    // Check third place
    if (!payload.thirdPlaceWinnerId) {
      missingStages.push('מקום 3')
    }

    if (missingStages.length > 0) {
      throw new UnauthorizedException(
        `יש להשלים את כל השלבים לפני השמירה:\n${missingStages.join('\n')}`
      )
    }

    // Use transaction to save all predictions atomically
    return this.prisma.$transaction(async (tx) => {
      // Save bracket predictions
      const bracketPromises = payload.bracketPredictions.map(pred =>
        tx.bracketPrediction.upsert({
          where: {
            userId_matchId: {
              userId,
              matchId: pred.matchId
            }
          },
          create: {
            userId,
            matchId: pred.matchId,
            predictedTeamId: pred.predictedWinnerTeamId
          },
          update: {
            predictedTeamId: pred.predictedWinnerTeamId
          }
        })
      )

      // Save third place winner
      const thirdPlacePromise = tx.bracketPrediction.upsert({
        where: {
          userId_matchId: {
            userId,
            matchId: 'THIRD_PLACE'
          }
        },
        create: {
          userId,
          matchId: 'THIRD_PLACE',
          predictedTeamId: payload.thirdPlaceWinnerId
        },
        update: {
          predictedTeamId: payload.thirdPlaceWinnerId
        }
      })

      // Save tournament winner
      const tournamentPromise = tx.tournamentPrediction.upsert({
        where: {
          userId
        },
        create: {
          userId,
          winnerTeamId: payload.tournamentWinnerId
        },
        update: {
          winnerTeamId: payload.tournamentWinnerId
        }
      })

      await Promise.all([...bracketPromises, thirdPlacePromise, tournamentPromise])

      return { success: true, message: 'ניחושי הפלייאוף נשמרו בהצלחה!' }
    })
  }

  async upsertTournamentPrediction(userId: string, payload: { winnerTeamId: string; goldenBootPlayerId?: string }) {
    const existing = await this.prisma.tournamentPrediction.findFirst({ where: { userId } })
    if (existing) {
      return this.prisma.tournamentPrediction.update({
        where: { id: existing.id },
        data: { winnerTeamId: payload.winnerTeamId, goldenBootPlayerId: payload.goldenBootPlayerId || undefined },
      })
    }
    return this.prisma.tournamentPrediction.create({
      data: { userId, winnerTeamId: payload.winnerTeamId, goldenBootPlayerId: payload.goldenBootPlayerId },
    })
  }

  async getUserTournamentPrediction(userId: string) {
    return this.prisma.tournamentPrediction.findFirst({
      where: { userId },
      include: { winnerTeam: true, goldenBootPlayer: true },
    })
  }

  async getGroupLockStatus(groupName: string): Promise<{ isLocked: boolean; lockTime: Date | null; firstMatchTime: Date | null }> {
    // All groups lock at the same time - 30 minutes before the first tournament match
    const firstTournamentMatch = await this.prisma.match.findFirst({
      where: { 
        stage: 'GROUP_STAGE'
      },
      orderBy: { kickoffTime: 'asc' }
    })

    if (!firstTournamentMatch) {
      return { isLocked: false, lockTime: null, firstMatchTime: null }
    }

    const lockTime = new Date(firstTournamentMatch.kickoffTime.getTime() - 30 * 60 * 1000)
    const isLocked = new Date() >= lockTime

    return { isLocked, lockTime, firstMatchTime: firstTournamentMatch.kickoffTime }
  }
}

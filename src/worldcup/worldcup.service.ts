import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import axios from 'axios'

const API_BASE_URL = 'https://worldcup26.ir/get'

interface TeamData {
  id: string
  name_en: string
  name_fa: string
  flag: string
  fifa_code: string
  iso2: string
  groups: string
}

interface GameData {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  group: string
  matchday: string
  local_date: string // Format: "MM/DD/YYYY HH:MM"
  finished: string // "TRUE" or "FALSE"
  time_elapsed: string // "notstarted", "HT", "FT", or minute number
  type: string
  home_team_name_en: string
  away_team_name_en: string
}

@Injectable()
export class WorldcupService {
  private readonly logger = new Logger(WorldcupService.name)

  constructor(private prisma: PrismaService) {}

  async syncMatches(): Promise<{ synced: number; errors: number }> {
    const startTime = Date.now()
    let syncedCount = 0
    let errorCount = 0

    try {
      this.logger.log('Starting World Cup data sync...')
      
      // Step 1: Sync teams first
      this.logger.log('Fetching teams data...')
      const teamsResponse = await axios.get<{ teams: TeamData[] }>(`${API_BASE_URL}/teams`, { timeout: 30000 })
      const teams = teamsResponse.data.teams

      if (!Array.isArray(teams) || teams.length === 0) {
        throw new Error('No teams data received from API')
      }

      this.logger.log(`Syncing ${teams.length} teams...`)
      for (const team of teams) {
        try {
          await this.upsertTeam(team)
        } catch (error: any) {
          this.logger.error(`Failed to sync team ${team.name_en}: ${error?.message}`)
        }
      }

      // Step 2: Sync matches
      this.logger.log('Fetching games data...')
      const gamesResponse = await axios.get<{ games: GameData[] }>(`${API_BASE_URL}/games`, { timeout: 30000 })
      const games = gamesResponse.data.games

      if (!Array.isArray(games) || games.length === 0) {
        throw new Error('No games data received from API')
      }

      this.logger.log(`Syncing ${games.length} matches...`)
      for (const game of games) {
        try {
          await this.upsertMatch(game)
          syncedCount++
        } catch (error: any) {
          this.logger.error(`Failed to sync match ${game.id}: ${error?.message}`)
          errorCount++
        }
      }

      const duration = Date.now() - startTime
      await this.logSync('SUCCESS', `Synced ${syncedCount} matches in ${duration}ms`, syncedCount, errorCount)
      
      this.logger.log(`Sync completed: ${syncedCount} synced, ${errorCount} errors`)
      return { synced: syncedCount, errors: errorCount }
    } catch (error: any) {
      const message = error?.message || String(error)
      this.logger.error(`Sync failed: ${message}`)
      await this.logSync('ERROR', message, syncedCount, errorCount)
      throw error
    }
  }

  private async upsertTeam(teamData: TeamData): Promise<void> {
    await this.prisma.team.upsert({
      where: { externalApiId: teamData.id },
      update: {
        name: teamData.name_en,
        code: teamData.fifa_code,
        groupName: teamData.groups || null,
        flagUrl: teamData.flag,
      },
      create: {
        externalApiId: teamData.id,
        name: teamData.name_en,
        code: teamData.fifa_code,
        groupName: teamData.groups || null,
        flagUrl: teamData.flag,
      },
    })
  }

  private async upsertMatch(gameData: GameData): Promise<void> {
    // Find teams by their external API IDs
    const homeTeam = await this.prisma.team.findUnique({
      where: { externalApiId: gameData.home_team_id },
    })
    const awayTeam = await this.prisma.team.findUnique({
      where: { externalApiId: gameData.away_team_id },
    })

    if (!homeTeam || !awayTeam) {
      throw new Error(`Teams not found for match ${gameData.id}: home=${gameData.home_team_id}, away=${gameData.away_team_id}`)
    }

    // Parse date from MM/DD/YYYY HH:MM format
    const kickoffTime = this.parseDate(gameData.local_date)
    
    // Determine status and stage
    const status = this.mapStatus(gameData.finished, gameData.time_elapsed)
    const stage = this.determineStage(gameData.type, gameData.group)

    // Parse scores
    const homeScore = gameData.home_score !== '0' || gameData.finished === 'TRUE' 
      ? parseInt(gameData.home_score) 
      : null
    const awayScore = gameData.away_score !== '0' || gameData.finished === 'TRUE'
      ? parseInt(gameData.away_score)
      : null

    await this.prisma.match.upsert({
      where: { externalApiId: gameData.id },
      update: {
        homeScore,
        awayScore,
        status,
      },
      create: {
        externalApiId: gameData.id,
        stage,
        groupName: gameData.group || null,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoffTime,
        homeScore,
        awayScore,
        status,
      },
    })
  }

  private parseDate(dateStr: string): Date {
    // Input format: "MM/DD/YYYY HH:MM"
    // Parse as: Month/Day/Year Hour:Minute
    const [datePart, timePart] = dateStr.split(' ')
    const [month, day, year] = datePart.split('/').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    
    // Create UTC date
    return new Date(Date.UTC(year, month - 1, day, hours, minutes))
  }

  private determineStage(type: string, group?: string): any {
    if (type === 'group' || group) {
      return 'GROUP_STAGE'
    }
    // Add more stage types if needed for knockout rounds
    return 'GROUP_STAGE'
  }

  private mapStatus(finished: string, timeElapsed: string): any {
    if (finished === 'TRUE' || timeElapsed === 'FT') {
      return 'FINISHED'
    }
    if (timeElapsed === 'notstarted') {
      return 'SCHEDULED'
    }
    if (timeElapsed === 'HT' || (timeElapsed !== 'notstarted' && timeElapsed !== 'FT')) {
      return 'LIVE'
    }
    return 'SCHEDULED'
  }

  private async logSync(status: string, message: string, syncedCount: number, errorCount: number): Promise<void> {
    try {
      await this.prisma.syncLog.create({
        data: {
          status,
          message,
          syncedCount,
          errorCount,
        },
      })
    } catch (error: any) {
      this.logger.error(`Failed to log sync: ${error?.message || String(error)}`)
    }
  }

  async getSyncLogs(limit: number = 20) {
    return await this.prisma.syncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}

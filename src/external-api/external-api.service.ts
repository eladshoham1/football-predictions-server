import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

export interface MatchResult {
  fixtureId: number
  homeScore: number
  awayScore: number
  status: string
  firstGoalScorer?: {
    playerId: number
    playerName: string
    team: 'home' | 'away'
    minute: number
  }
}

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name)
  private readonly API_KEY = process.env.API_FOOTBALL_KEY
  private readonly API_HOST = process.env.API_FOOTBALL_HOST || 'api-football-v1.p.rapidapi.com'
  private readonly BASE_URL = `https://${this.API_HOST}/v3`

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch match result from API-Football
   */
  async getMatchResult(fixtureId: number): Promise<MatchResult | null> {
    try {
      this.logger.log(`Fetching match result for fixture ${fixtureId}`)
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.BASE_URL}/fixtures`, {
          params: { id: fixtureId },
          headers: {
            'X-RapidAPI-Key': this.API_KEY,
            'X-RapidAPI-Host': this.API_HOST,
          },
        })
      )

      const data = response.data.response[0]
      
      if (!data) {
        this.logger.warn(`No data found for fixture ${fixtureId}`)
        return null
      }

      // Extract match result
      const result: MatchResult = {
        fixtureId: data.fixture.id,
        homeScore: data.goals.home ?? 0,
        awayScore: data.goals.away ?? 0,
        status: data.fixture.status.short,
      }

      // Find first goal scorer
      if (data.events && data.events.length > 0) {
        const firstGoal = data.events.find((event: any) => 
          event.type === 'Goal' && 
          event.detail !== 'Own Goal' &&
          event.detail !== 'Penalty' // You can include penalty if you want
        )

        if (firstGoal) {
          result.firstGoalScorer = {
            playerId: firstGoal.player.id,
            playerName: firstGoal.player.name,
            team: firstGoal.team.id === data.teams.home.id ? 'home' : 'away',
            minute: firstGoal.time.elapsed,
          }
        }
      }

      this.logger.log(`Successfully fetched result for fixture ${fixtureId}: ${result.homeScore}-${result.awayScore}`)
      return result

    } catch (error: any) {
      this.logger.error(`Failed to fetch match result for fixture ${fixtureId}`, error?.message || String(error))
      return null
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.BASE_URL}/status`, {
          headers: {
            'X-RapidAPI-Key': this.API_KEY,
            'X-RapidAPI-Host': this.API_HOST,
          },
        })
      )
      return response.status === 200
    } catch (error: any) {
      this.logger.error('API connection test failed', error?.message || String(error))
      return false
    }
  }

  /**
   * Get remaining API requests for today
   */
  async getRemainingRequests(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.BASE_URL}/status`, {
          headers: {
            'X-RapidAPI-Key': this.API_KEY,
            'X-RapidAPI-Host': this.API_HOST,
          },
        })
      )
      
      const remaining = response.headers['x-ratelimit-requests-remaining']
      return remaining ? parseInt(remaining) : 100
    } catch (error: any) {
      this.logger.warn('Failed to get remaining requests', error?.message || String(error))
      return 0
    }
  }
}

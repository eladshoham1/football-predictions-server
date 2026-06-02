import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { MatchSyncService } from '../matches/match-sync.service'

@Injectable()
export class MatchSyncCron {
  private readonly logger = new Logger(MatchSyncCron.name)
  private isEnabled = true // Can be controlled via admin panel

  constructor(private matchSync: MatchSyncService) {}

  /**
   * Auto-sync finished matches every 15 minutes
   */
  @Cron('*/15 * * * *') // Every 15 minutes
  async handleMatchSync() {
    if (!this.isEnabled) {
      this.logger.log('Auto-sync is disabled')
      return
    }

    this.logger.log('Starting scheduled match sync')
    
    try {
      const result = await this.matchSync.syncAllFinishedMatches()
      
      this.logger.log(
        `Scheduled sync completed: ${result.synced} synced, ${result.failed} failed, ${result.skipped} skipped`
      )
    } catch (error: any) {
      this.logger.error('Scheduled sync failed', error?.message || String(error))
    }
  }

  /**
   * Enable auto-sync
   */
  enable() {
    this.isEnabled = true
    this.logger.log('Auto-sync enabled')
  }

  /**
   * Disable auto-sync
   */
  disable() {
    this.isEnabled = false
    this.logger.log('Auto-sync disabled')
  }

  /**
   * Check if auto-sync is enabled
   */
  isAutoSyncEnabled(): boolean {
    return this.isEnabled
  }
}

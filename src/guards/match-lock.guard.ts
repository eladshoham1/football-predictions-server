import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Guard to prevent predictions after match kickoff
 * Use on prediction endpoints with @UseGuards(MatchLockGuard)
 */
@Injectable()
export class MatchLockGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const matchId = request.body?.matchId || request.params?.matchId

    if (!matchId) {
      throw new ForbiddenException('Match ID is required')
    }

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { kickoffTime: true, status: true },
    })

    if (!match) {
      throw new ForbiddenException('Match not found')
    }

    const now = new Date()
    const kickoff = new Date(match.kickoffTime)

    // Check if match has started
    if (now >= kickoff) {
      throw new ForbiddenException('Predictions are locked after match kickoff')
    }

    // Check if match is not scheduled anymore
    if (match.status !== 'SCHEDULED') {
      throw new ForbiddenException('Predictions are locked for non-scheduled matches')
    }

    return true
  }
}

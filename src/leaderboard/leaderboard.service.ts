import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const users = await this.prisma.user.findMany({ include: { matchPredictions: true } })
    const rows: Array<{ userId: string; name: string; avatarUrl: string | null; points: number; exactCount: number; scoringCount: number; rank?: number }> = users.map((u) => {
      const points = u.matchPredictions.reduce((s: number, p) => s + (p.pointsAwarded || 0), 0)
      const exactCount = u.matchPredictions.filter((p) => p.pointsAwarded >= 5).length
      const scoringCount = u.matchPredictions.filter((p) => p.pointsAwarded >= 2).length
      return { userId: u.id, name: u.name, avatarUrl: u.avatarUrl, points, exactCount, scoringCount }
    })
    rows.sort((a, b) => b.points - a.points)
    let rank = 0
    let last: number | null = null
    for (let i = 0; i < rows.length; i++) {
      if (last === null || rows[i].points < last) { rank = i + 1; last = rows[i].points }
      rows[i].rank = rank
    }
    return rows
  }
}

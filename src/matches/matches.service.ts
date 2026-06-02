import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.match.findMany({ include: { homeTeam: true, awayTeam: true } })
  }

  async listEnriched() {
    const matches = await this.prisma.match.findMany({ include: { homeTeam: true, awayTeam: true } })
    return matches.map((m) => ({
      id: m.id,
      kickoffTime: m.kickoffTime,
      stage: m.stage,
      status: m.status,
      homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, hebrewName: m.homeTeam.hebrewName, code: m.homeTeam.code, flagUrl: m.homeTeam.flagUrl },
      awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, hebrewName: m.awayTeam.hebrewName, code: m.awayTeam.code, flagUrl: m.awayTeam.flagUrl },
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    }))
  }
}

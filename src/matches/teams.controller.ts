import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Controller('teams')
export class TeamsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const teams = await this.prisma.team.findMany()
    return teams.map((t) => ({ id: t.id, name: t.name, code: t.code, flagUrl: t.flagUrl, groupName: t.groupName }))
  }

  @Get('players')
  async listPlayers() {
    const players = await this.prisma.player.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true,
            code: true,
            flagUrl: true
          }
        }
      },
      orderBy: [
        { team: { name: 'asc' } },
        { name: 'asc' }
      ]
    })
    return players
  }
}


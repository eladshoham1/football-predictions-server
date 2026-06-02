import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface TeamSeed {
  id: number
  externalApiId: string | null
  name: string
  hebrewName: string | null
  code: string
  flagUrl: string | null
  groupName: string | null
}

interface PlayerSeed {
  id: number
  externalApiId: string | null
  name: string
  position: string | null
  teamCode: string
}

interface MatchSeed {
  id: number
  externalApiId: string | null
  stage: string
  round: number | null
  groupName: string | null
  homeTeamCode: string
  awayTeamCode: string
  kickoffTime: string
  status: string
  venue: string | null
}

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Read seed data
  const teamsData: TeamSeed[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seeds/teams.json'), 'utf-8')
  )
  const playersData: PlayerSeed[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seeds/players.json'), 'utf-8')
  )
  const matchesData: MatchSeed[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seeds/matches.json'), 'utf-8')
  )

  // 1. Seed Teams
  console.log('📦 Seeding teams...')
  const teamMap = new Map<string, string>() // code -> id mapping
  
  for (const team of teamsData) {
    const created = await prisma.team.upsert({
      where: { code: team.code },
      update: {
        name: team.name,
        hebrewName: team.hebrewName,
        flagUrl: team.flagUrl,
        groupName: team.groupName,
        externalApiId: team.externalApiId
      },
      create: {
        externalApiId: team.externalApiId,
        name: team.name,
        hebrewName: team.hebrewName,
        code: team.code,
        flagUrl: team.flagUrl,
        groupName: team.groupName
      }
    })
    teamMap.set(team.code, created.id)
  }
  console.log(`✅ Seeded ${teamsData.length} teams\n`)

  // 2. Seed Players
  console.log('👥 Seeding players...')
  let playersCreated = 0
  let playersSkipped = 0

  for (const player of playersData) {
    const teamId = teamMap.get(player.teamCode)
    if (!teamId) {
      console.log(`⚠️  Team ${player.teamCode} not found for player ${player.name}`)
      playersSkipped++
      continue
    }

    // Check if player already exists
    const existing = await prisma.player.findFirst({
      where: {
        name: player.name,
        teamId: teamId
      }
    })

    if (existing) {
      playersSkipped++
      continue
    }

    await prisma.player.create({
      data: {
        externalApiId: player.externalApiId,
        name: player.name,
        position: player.position,
        teamId: teamId
      }
    })
    playersCreated++
  }
  console.log(`✅ Seeded ${playersCreated} players (${playersSkipped} skipped)\n`)

  // 3. Seed Matches
  console.log('⚽ Seeding matches...')
  let matchesCreated = 0
  let matchesSkipped = 0

  for (const match of matchesData) {
    const homeTeamId = teamMap.get(match.homeTeamCode)
    const awayTeamId = teamMap.get(match.awayTeamCode)

    if (!homeTeamId || !awayTeamId) {
      console.log(`⚠️  Teams not found for match ${match.homeTeamCode} vs ${match.awayTeamCode}`)
      matchesSkipped++
      continue
    }

    // Check if match already exists
    const existing = await prisma.match.findFirst({
      where: {
        externalApiId: match.externalApiId
      }
    })

    if (existing) {
      matchesSkipped++
      continue
    }

    await prisma.match.create({
      data: {
        externalApiId: match.externalApiId,
        stage: match.stage as any,
        round: match.round,
        groupName: match.groupName,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        kickoffTime: new Date(match.kickoffTime),
        status: match.status as any,
        venue: match.venue
      }
    })
    matchesCreated++
  }
  console.log(`✅ Seeded ${matchesCreated} matches (${matchesSkipped} skipped)\n`)

  // 4. Create default scoring config
  console.log('⚙️  Creating default scoring configuration...')
  await prisma.scoringConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      correctWinner: 3,
      correctGoalDifference: 2,
      exactScore: 5,
      groupAdvancingTeam: 5,
      groupCorrectPosition: 10,
      roundOf32: 2,
      roundOf16: 4,
      quarterFinal: 8,
      semiFinal: 12,
      final: 20,
      tournamentWinner: 30,
      goldenBoot: 25
    }
  })
  console.log('✅ Scoring configuration created\n')

  console.log('🎉 Database seeding completed successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - Teams: ${teamsData.length}`)
  console.log(`   - Players: ${playersCreated}`)
  console.log(`   - Matches: ${matchesCreated}`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

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
      goldenBoot: 25,
    },
  })

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

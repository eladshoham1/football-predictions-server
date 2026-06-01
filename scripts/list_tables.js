const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;`
  for (const t of tables) {
    const name = t.table_name || t.table_name
    try {
      const cnt = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS cnt FROM public."${name}"`)
      console.log(name.padEnd(30), cnt[0].cnt)
    } catch (e) {
      console.log(name.padEnd(30), '<error>')
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

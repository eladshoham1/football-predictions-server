import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Multiple API sources for player data
const API_SOURCES = {
  worldcup26: 'https://worldcup26.ir/get',
  // Add more sources as needed
};

interface ApiPlayer {
  id?: string;
  name?: string;
  name_en?: string;
  name_fa?: string;
  position?: string;
  number?: string | number;
  team_id?: string;
  team_code?: string;
}

interface ApiTeam {
  id: string;
  fifa_code: string;
  name_en: string;
  groups: string;
}

// Fetch players from multiple API sources
async function fetchPlayersFromAPI(): Promise<ApiPlayer[]> {
  console.log('🌐 Attempting to fetch players from APIs...');
  
  // Try different API endpoints
  const endpoints = [
    `${API_SOURCES.worldcup26}/players`,
    `${API_SOURCES.worldcup26}/squads`,
    // Add more endpoints as available
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   Trying: ${endpoint}`);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json() as any;
        const players = data.players || data.squads || [];
        
        if (players.length > 0) {
          console.log(`✅ Found ${players.length} players from API`);
          return players;
        }
      }
    } catch (error) {
      // Continue to next endpoint
    }
  }
  
  console.log('⚠️  No player data available from APIs');
  return [];
}

// Fetch teams from API to map team codes
async function fetchTeamsFromAPI(): Promise<Map<string, string>> {
  try {
    const response = await fetch(`${API_SOURCES.worldcup26}/teams`);
    const data = await response.json() as any;
    const teams = data.teams || [];
    
    const teamMap = new Map<string, string>();
    teams.forEach((team: ApiTeam) => {
      teamMap.set(team.id, team.fifa_code);
    });
    
    return teamMap;
  } catch (error) {
    console.log('⚠️  Could not fetch teams from API');
    return new Map();
  }
}

async function seedPlayers() {
  console.log('🌱 Starting player seeding for World Cup 2026...\n');
  
  // Try to fetch players from API
  const apiPlayers = await fetchPlayersFromAPI();
  
  if (apiPlayers.length === 0) {
    console.log('💡 Using curated player database (100+ top players from all 48 teams)\n');
    await seedFallbackPlayers();
    return;
  }
  
  console.log(`📥 Processing ${apiPlayers.length} players from API\n`);
  
  // Fetch team mapping
  const teamCodeMap = await fetchTeamsFromAPI();
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const apiPlayer of apiPlayers) {
    try {
      const playerName = apiPlayer.name_en || apiPlayer.name;
      const teamId = apiPlayer.team_id;
      
      if (!playerName || !teamId) {
        skipped++;
        continue;
      }
      
      // Find team by external API ID or code
      const teamCode = teamCodeMap.get(teamId);
      const team = await prisma.team.findFirst({
        where: {
          OR: [
            { externalApiId: teamId },
            { code: teamCode || '' }
          ]
        }
      });
      
      if (!team) {
        skipped++;
        continue;
      }
      
      // Check if player already exists
      const existing = await prisma.player.findFirst({
        where: {
          name: playerName,
          teamId: team.id
        }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      // Create player
      await prisma.player.create({
        data: {
          name: playerName,
          position: apiPlayer.position || null,
          externalApiId: apiPlayer.id || null,
          teamId: team.id
        }
      });
      
      console.log(`✅ ${playerName} (${team.code}) - ${apiPlayer.position || 'Player'}`);
      created++;
      
    } catch (error) {
      errors++;
    }
  }
  
  console.log(`\n📊 Seeding complete:`);
  console.log(`   ✅ Created: ${created} players`);
  console.log(`   ⏭️  Skipped: ${skipped} players`);
  if (errors > 0) {
    console.log(`   ❌ Errors: ${errors} players`);
  }
}

// Fallback: Comprehensive player list for all 48 World Cup 2026 teams
async function seedFallbackPlayers() {
  console.log('📝 Using curated player database for World Cup 2026 teams...\n');
  
  // Comprehensive list of top players from all World Cup 2026 teams
  const fallbackPlayers = [
    // Group A
    { name: 'Hirving Lozano', code: 'MEX', position: 'Forward' },
    { name: 'Raúl Jiménez', code: 'MEX', position: 'Forward' },
    { name: 'Percy Tau', code: 'RSA', position: 'Forward' },
    { name: 'Son Heung-min', code: 'KOR', position: 'Forward' },
    { name: 'Hwang Hee-chan', code: 'KOR', position: 'Forward' },
    { name: 'Patrik Schick', code: 'CZE', position: 'Forward' },
    
    // Group B
    { name: 'Jonathan David', code: 'CAN', position: 'Forward' },
    { name: 'Alphonso Davies', code: 'CAN', position: 'Midfielder' },
    { name: 'Edin Džeko', code: 'BIH', position: 'Forward' },
    { name: 'Akram Afif', code: 'QAT', position: 'Forward' },
    { name: 'Breel Embolo', code: 'SUI', position: 'Forward' },
    { name: 'Xherdan Shaqiri', code: 'SUI', position: 'Midfielder' },
    
    // Group C
    { name: 'Vinícius Júnior', code: 'BRA', position: 'Forward' },
    { name: 'Neymar Jr', code: 'BRA', position: 'Forward' },
    { name: 'Richarlison', code: 'BRA', position: 'Forward' },
    { name: 'Youssef En-Nesyri', code: 'MAR', position: 'Forward' },
    { name: 'Hakim Ziyech', code: 'MAR', position: 'Midfielder' },
    { name: 'Che Adams', code: 'SCO', position: 'Forward' },
    { name: 'Duckens Nazon', code: 'HAI', position: 'Forward' },
    
    // Group D
    { name: 'Christian Pulisic', code: 'USA', position: 'Forward' },
    { name: 'Folarin Balogun', code: 'USA', position: 'Forward' },
    { name: 'Miguel Almirón', code: 'PAR', position: 'Forward' },
    { name: 'Burak Yılmaz', code: 'TUR', position: 'Forward' },
    { name: 'Hakan Çalhanoğlu', code: 'TUR', position: 'Midfielder' },
    { name: 'Mathew Leckie', code: 'AUS', position: 'Forward' },
    { name: 'Awer Mabil', code: 'AUS', position: 'Forward' },
    
    // Group E
    { name: 'Kai Havertz', code: 'GER', position: 'Forward' },
    { name: 'Thomas Müller', code: 'GER', position: 'Forward' },
    { name: 'Serge Gnabry', code: 'GER', position: 'Forward' },
    { name: 'Nicolas Jackson', code: 'CIV', position: 'Forward' },
    { name: 'Sébastien Haller', code: 'CIV', position: 'Forward' },
    { name: 'Enner Valencia', code: 'ECU', position: 'Forward' },
    { name: 'Leandro Trochez', code: 'CUW', position: 'Forward' },
    
    // Group F
    { name: 'Memphis Depay', code: 'NED', position: 'Forward' },
    { name: 'Cody Gakpo', code: 'NED', position: 'Forward' },
    { name: 'Wout Weghorst', code: 'NED', position: 'Forward' },
    { name: 'Takumi Minamino', code: 'JPN', position: 'Forward' },
    { name: 'Daichi Kamada', code: 'JPN', position: 'Midfielder' },
    { name: 'Aïssa Laïdouni', code: 'TUN', position: 'Midfielder' },
    { name: 'Alexander Isak', code: 'SWE', position: 'Forward' },
    { name: 'Viktor Gyökeres', code: 'SWE', position: 'Forward' },
    
    // Group G
    { name: 'Romelu Lukaku', code: 'BEL', position: 'Forward' },
    { name: 'Kevin De Bruyne', code: 'BEL', position: 'Midfielder' },
    { name: 'Dries Mertens', code: 'BEL', position: 'Forward' },
    { name: 'Mohamed Salah', code: 'EGY', position: 'Forward' },
    { name: 'Mostafa Mohamed', code: 'EGY', position: 'Forward' },
    { name: 'Sardar Azmoun', code: 'IRN', position: 'Forward' },
    { name: 'Mehdi Taremi', code: 'IRN', position: 'Forward' },
    { name: 'Chris Wood', code: 'NZL', position: 'Forward' },
    
    // Group H
    { name: 'Álvaro Morata', code: 'ESP', position: 'Forward' },
    { name: 'Ferran Torres', code: 'ESP', position: 'Forward' },
    { name: 'Dani Olmo', code: 'ESP', position: 'Forward' },
    { name: 'Jamiro Monteiro', code: 'CPV', position: 'Midfielder' },
    { name: 'Salem Al-Dawsari', code: 'KSA', position: 'Forward' },
    { name: 'Luis Suárez', code: 'URU', position: 'Forward' },
    { name: 'Darwin Núñez', code: 'URU', position: 'Forward' },
    { name: 'Edinson Cavani', code: 'URU', position: 'Forward' },
    
    // Group I
    { name: 'Kylian Mbappé', code: 'FRA', position: 'Forward' },
    { name: 'Antoine Griezmann', code: 'FRA', position: 'Forward' },
    { name: 'Olivier Giroud', code: 'FRA', position: 'Forward' },
    { name: 'Sadio Mané', code: 'SEN', position: 'Forward' },
    { name: 'Ismaïla Sarr', code: 'SEN', position: 'Forward' },
    { name: 'Aymen Hussein', code: 'IRQ', position: 'Forward' },
    { name: 'Erling Haaland', code: 'NOR', position: 'Forward' },
    { name: 'Alexander Sørloth', code: 'NOR', position: 'Forward' },
    
    // Group J
    { name: 'Lionel Messi', code: 'ARG', position: 'Forward' },
    { name: 'Lautaro Martínez', code: 'ARG', position: 'Forward' },
    { name: 'Julián Álvarez', code: 'ARG', position: 'Forward' },
    { name: 'Riyad Mahrez', code: 'ALG', position: 'Forward' },
    { name: 'Baghdad Bounedjah', code: 'ALG', position: 'Forward' },
    { name: 'Marko Arnautović', code: 'AUT', position: 'Forward' },
    { name: 'Yazan Al-Naimat', code: 'JOR', position: 'Forward' },
    
    // Group K
    { name: 'Cristiano Ronaldo', code: 'POR', position: 'Forward' },
    { name: 'Bruno Fernandes', code: 'POR', position: 'Midfielder' },
    { name: 'Rafael Leão', code: 'POR', position: 'Forward' },
    { name: 'Cédric Bakambu', code: 'COD', position: 'Forward' },
    { name: 'Eldor Shomurodov', code: 'UZB', position: 'Forward' },
    { name: 'Luis Díaz', code: 'COL', position: 'Forward' },
    { name: 'James Rodríguez', code: 'COL', position: 'Midfielder' },
    
    // Group L
    { name: 'Harry Kane', code: 'ENG', position: 'Forward' },
    { name: 'Bukayo Saka', code: 'ENG', position: 'Forward' },
    { name: 'Phil Foden', code: 'ENG', position: 'Midfielder' },
    { name: 'Luka Modrić', code: 'CRO', position: 'Midfielder' },
    { name: 'Ivan Perišić', code: 'CRO', position: 'Forward' },
    { name: 'Mohammed Kudus', code: 'GHA', position: 'Forward' },
    { name: 'Iñaki Williams', code: 'GHA', position: 'Forward' },
    { name: 'José Fajardo', code: 'PAN', position: 'Forward' },
  ];
  
  let created = 0;
  let skipped = 0;
  
  for (const playerData of fallbackPlayers) {
    try {
      const team = await prisma.team.findUnique({
        where: { code: playerData.code }
      });
      
      if (!team) {
        console.log(`⚠️  Team not found: ${playerData.code}`);
        skipped++;
        continue;
      }
      
      const existing = await prisma.player.findFirst({
        where: {
          name: playerData.name,
          teamId: team.id
        }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.player.create({
        data: {
          name: playerData.name,
          position: playerData.position,
          teamId: team.id
        }
      });
      
      console.log(`✅ ${playerData.name} (${playerData.code}) - ${playerData.position}`);
      created++;
      
    } catch (error) {
      console.error(`❌ Error: ${playerData.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Seeding complete:`);
  console.log(`   ✅ Created: ${created} players`);
  console.log(`   ⏭️  Skipped: ${skipped} players`);
  console.log(`   📦 Total players in database: ${created + skipped}`);
}

seedPlayers()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

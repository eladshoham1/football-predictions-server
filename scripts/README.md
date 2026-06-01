# Player Database Management

## Overview
The player seeding script automatically populates the database with 100+ top players from all 48 World Cup 2026 teams.

## Current Status
- ✅ **88 players** in database
- ✅ **48 teams** covered
- ✅ All major forwards, midfielders, and key players included

## Running the Seed Script

### Seed Players
```bash
cd server
npx tsx scripts/seed-players.ts
```

This will:
1. Attempt to fetch players from external APIs (worldcup26.ir)
2. If API is unavailable, use curated player database
3. Skip existing players (safe to run multiple times)
4. Add new players with team associations

### Clear and Re-seed
To start fresh:
```bash
# Clear all players
npx prisma studio
# Navigate to Player model, select all, delete

# Then re-seed
npx tsx scripts/seed-players.ts
```

## Adding More Players

Edit `/server/scripts/seed-players.ts` and add entries to the `fallbackPlayers` array:

```typescript
{ name: 'Player Name', code: 'TEAM_CODE', position: 'Forward' },
```

### Team Codes Reference
Some common team codes:
- `ARG` - Argentina
- `BRA` - Brazil  
- `FRA` - France
- `ENG` - England
- `ESP` - Spain
- `GER` - Germany
- `POR` - Portugal
- `NED` - Netherlands
- `BEL` - Belgium
- `URU` - Uruguay
- `MEX` - Mexico
- `USA` - United States
- `JPN` - Japan
- `KOR` - South Korea

Full list available at: `GET http://localhost:4000/teams`

## Position Types
- `Forward` - Strikers, wingers
- `Midfielder` - Central, attacking, defensive midfielders
- `Defender` - Center backs, full backs
- `Goalkeeper` - Keepers

## API Integration

### Current API Sources
1. **worldcup26.ir** - Primary source (teams, matches, groups)
   - `/get/teams` ✅ Working
   - `/get/games` ✅ Working
   - `/get/groups` ✅ Working
   - `/get/players` ❌ Not available (using curated data)

### Future API Integration
To add a new API source for players:

1. Add to `API_SOURCES` object:
```typescript
const API_SOURCES = {
  worldcup26: 'https://worldcup26.ir/get',
  newSource: 'https://api.example.com'
};
```

2. Add endpoint to `fetchPlayersFromAPI()`:
```typescript
`${API_SOURCES.newSource}/players`,
```

3. Map API response to our schema in `seedPlayers()` function

## Database Schema

```prisma
model Player {
  id             String   @id @default(cuid())
  externalApiId  String?  // Optional API reference
  teamId         String   // Required: links to Team
  name           String   // Required: player name
  position       String?  // Optional: Forward, Midfielder, etc.
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  team           Team     @relation(fields: [teamId], references: [id])
}
```

## Testing

### Check Player Count
```bash
curl http://localhost:4000/teams/players | jq '. | length'
```

### View Sample Players
```bash
curl http://localhost:4000/teams/players | jq '.[0:5]'
```

### View Players by Team
```bash
curl http://localhost:4000/teams/players | jq '.[] | select(.team.code == "ARG")'
```

## Maintenance

### Regular Updates
- Run seed script when new players are added
- Update positions if player roles change
- Add externalApiId when API becomes available

### Data Quality
- Ensure player names are accurate and consistent
- Use English names for international recognition
- Include key players who are likely to score goals
- Update before major tournaments

## Golden Boot Feature
Players are used in the Golden Boot (top scorer) prediction:
- Users can search and filter players
- Select one player as their prediction
- Earn 25 points if correct

## Production Deployment
Before deploying to production:
1. Review and verify all player names
2. Ensure all 48 teams have representative players
3. Run seed script in production environment
4. Backup database before making changes

## Support
For questions or issues with player data:
1. Check logs from seed script
2. Verify team codes match database
3. Ensure PostgreSQL connection is active
4. Check Prisma Client is regenerated after schema changes

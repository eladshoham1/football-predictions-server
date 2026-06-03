#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Check if database is empty (no teams), then seed
TEAM_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM teams;" 2>/dev/null | tail -1 || echo "0")
if [ "$TEAM_COUNT" = "0" ] || [ -z "$TEAM_COUNT" ]; then
  echo "🌱 Database empty, running seed..."
  npx prisma db seed
else
  echo "✅ Database already seeded (found teams)"
fi

# Start the application
echo "🎯 Starting application..."
exec node dist/main

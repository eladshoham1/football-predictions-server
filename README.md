# World Cup 2026 Predictions - Backend

NestJS backend API for World Cup 2026 predictions platform with automated scoring, email notifications, and real-time match sync.

## 🚀 Features

- **Authentication**: Google OAuth integration
- **Match Predictions**: Users predict scores and first goal scorers
- **Group Stage**: Predict team standings in groups
- **Knockout Stage**: Bracket predictions
- **Tournament**: Winner and Golden Boot predictions
- **Automated Scoring**: Points calculation with configurable rules
- **Match Sync**: Auto-sync match results from API-Football
- **Email Notifications**: Remind users 2 hours before matches
- **Leaderboard**: Real-time rankings
- **Admin Panel**: Manage users, scoring, and triggers

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- API-Football account (optional, for live results)
- Gmail account (for email notifications)

## 🔧 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env file (see below)

# Run Prisma migrations
npm run prisma:migrate:deploy

# Seed the database
npm run prisma:seed

# Start development server
npm run start:dev
```

## 🌍 Environment Variables

### Required

```env
# Database - Use FREE Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/database

# Server
PORT=4000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# CORS
FRONTEND_URL=http://localhost:5173
```

### Optional (Recommended)

```env
# API-Football for live match results (https://rapidapi.com)
API_FOOTBALL_KEY=your-rapidapi-key
API_FOOTBALL_HOST=api-football-v1.p.rapidapi.com

# Email notifications (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=World Cup 2026 <noreply@worldcup2026.com>
APP_URL=http://localhost:5173
```

## 🗄️ Database Setup

### Neon PostgreSQL (Recommended - FREE Forever)

1. Go to [neon.tech](https://neon.tech)
2. Sign up (free, no credit card required)
3. Create a new project
4. Copy the connection string
5. Update `DATABASE_URL` in `.env`

**Free Tier:**
- ✅ 3 GB storage
- ✅ Unlimited compute hours
- ✅ No credit card required
- ✅ No time limit
- ✅ Auto-suspend when idle (wakes instantly)

**Connection String Format:**
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
```

### For Local Development

You can also use Docker:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

## 🎯 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:4000/auth/google/callback`
   - Production: `https://your-api.onrender.com/auth/google/callback`
6. Copy Client ID and Secret to `.env`

## 📧 Email Setup (Optional)

### Gmail App Password

1. Enable 2-Factor Authentication on Gmail
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate password for "Mail"
4. Copy 16-character password to `EMAIL_PASSWORD`

## 📜 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npm run prisma:migrate:dev # Create and apply migration
npm run prisma:migrate:deploy # Apply migrations (production)
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio

# Testing
npm run test               # Run tests
npm run test:e2e          # Run e2e tests
```

## 🚀 Deployment

### Render.com + Neon (Recommended - 100% FREE)

This is the recommended deployment stack for production:

**1. Database: Neon PostgreSQL**
- FREE forever (3GB storage)
- No credit card required
- Follow Step 1 in [DEPLOYMENT.md](./DEPLOYMENT.md)

**2. Server: Render.com**
- FREE tier (750 hours/month)
- Auto-deploys from GitHub
- Follow Steps 2-5 in [DEPLOYMENT.md](./DEPLOYMENT.md)

**📖 For complete deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

**Quick Deploy:**
1. Create Neon database → Get connection string
2. Push code to GitHub
3. Create Render web service → Add environment variables
4. Run migrations in Render Shell
5. Update Google OAuth with production URLs

**Your API will be live at:** `https://YOUR-APP.onrender.com`

**Total Cost: $0/month** 🎉

## 📊 Database Schema

- **Users**: Google OAuth profiles
- **Teams**: 112 teams (48 real + 64 knockout placeholders)
- **Players**: 88 players for Golden Boot predictions
- **Matches**: 104 matches (72 group + 32 knockout)
- **Predictions**: Match, group, bracket, tournament predictions
- **Notifications**: Email notification tracking
- **ScoringConfig**: Configurable point system

## 🔐 Admin Endpoints

All admin endpoints require authentication and admin role:

```bash
# Users Management
GET    /admin/users
PATCH  /admin/users/:userId/role
DELETE /admin/users/:userId

# Scoring
GET    /admin/scoring-config
PATCH  /admin/scoring-config
POST   /admin/scoring/calculate-match/:matchId
POST   /admin/scoring/calculate-group/:groupName
POST   /admin/scoring/recalculate-user/:userId

# Match Sync
POST   /admin/match-sync/:matchId
POST   /admin/match-sync
GET    /admin/match-sync/status
GET    /admin/match-sync/test-api

# Notifications
POST   /admin/notifications/trigger
POST   /admin/email/test

# Stats
GET    /admin/stats
```

## 🎮 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user

### Matches
- `GET /matches` - Get all matches
- `GET /teams` - Get all teams
- `GET /teams/players` - Get all players

### Predictions
- `POST /predictions/match` - Create match prediction
- `GET /predictions/match` - Get user's match predictions
- `GET /predictions/match/all` - Get all predictions for match
- `POST /predictions/group` - Create group prediction
- `GET /predictions/group` - Get user's group predictions
- `POST /predictions/bracket` - Create bracket prediction
- `POST /predictions/tournament` - Create tournament prediction

### Leaderboard
- `GET /leaderboard` - Get rankings

## 🔄 Automated Features

### Match Sync Cron (Every 15 minutes)
- Syncs finished matches from API-Football
- Updates match scores and first goal scorers
- Triggers automatic points calculation

### Email Notifications (Every 10 minutes)
- Checks for matches starting in 2 hours
- Sends Hebrew email reminders to users without predictions
- Tracks sent notifications to prevent duplicates

## 🏗️ Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Passport.js + Google OAuth
- **Scheduling**: @nestjs/schedule
- **Email**: Nodemailer
- **Validation**: class-validator
- **HTTP Client**: Axios

## 📝 Seed Data

Database includes:
- **48 real teams** with Hebrew names and flags
- **64 placeholder teams** for knockout progression
- **88 players** (top players from all teams)
- **104 matches** (complete tournament structure)

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
→ Check `DATABASE_URL` is correct and database is running

### OAuth Error
```
Error: redirect_uri_mismatch
```
→ Add exact callback URL to Google Console

### Email Not Sending
```
[EmailService] Email transporter not initialized
```
→ Check `EMAIL_USER` and `EMAIL_PASSWORD` are set

### Migration Error
```
P3009: Failed to create database
```
→ Database URL should include `?schema=public`

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions, open an issue on GitHub.

---

**Built with ❤️ for World Cup 2026**

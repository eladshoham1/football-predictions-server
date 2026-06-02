# 🚀 Server Deployment Guide
## Neon PostgreSQL + Render.com (100% FREE)

This guide will help you deploy the World Cup 2026 backend to production using:
- **Neon** - Free PostgreSQL database (3GB forever)
- **Render.com** - Free Node.js hosting

**Total Cost: $0/month** 🎉

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ GitHub account
- ✅ Server code pushed to GitHub repository
- ✅ Google OAuth credentials (Client ID & Secret)
- ✅ Gmail app password for email notifications

---

## Step 1: Create Neon Database (5 minutes)

### 1.1 Sign Up
1. Go to **[neon.tech](https://neon.tech)**
2. Click "Sign Up" - use GitHub account (easiest)
3. **No credit card required!**

### 1.2 Create Project
1. Click "Create Project" or "New Project"
2. **Project Name**: `worldcup-2026`
3. **PostgreSQL Version**: Latest (15+)
4. **Region**: Choose closest to you (or Oregon for Render)
5. Click "Create Project"

### 1.3 Get Connection String
1. After project creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
   ```
2. **Copy this entire string** - you'll need it for Render
3. Save it securely (this is your production database URL)

**✅ Neon Setup Complete!**

**Free Tier Features:**
- ✅ 3 GB storage
- ✅ Unlimited compute hours
- ✅ No time limit
- ✅ Auto-sleep after inactivity (wakes instantly)
- ✅ No credit card required

---

## Step 2: Deploy to Render.com (10 minutes)

### 2.1 Sign Up
1. Go to **[render.com](https://render.com)**
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your **server repository**
3. Configure:
   - **Name**: `worldcup-2026-api` (or your choice)
   - **Region**: `Oregon` (or closest)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start:prod
     ```
   - **Instance Type**: `Free`

4. **DON'T click deploy yet!** Go to Environment tab first.

### 2.3 Add Environment Variables

Click **"Environment"** tab and add these variables:

#### Required Variables

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `<your-neon-connection-string>` | From Step 1 |
| `PORT` | `4000` | Must be 4000 |
| `NODE_ENV` | `production` | Production mode |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` | Random string |
| `GOOGLE_CLIENT_ID` | Your Client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Your Secret | From Google Console |
| `GOOGLE_CALLBACK_URL` | `https://YOUR-APP.onrender.com/auth/google/callback` | Replace YOUR-APP |
| `FRONTEND_URL` | `https://YOUR-USERNAME.github.io/your-repo` | Your frontend URL |

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

#### Email Variables (For Match Notifications)

| Key | Value |
|-----|-------|
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Your Gmail app password |
| `EMAIL_FROM` | `World Cup 2026 <noreply@worldcup2026.com>` |
| `APP_URL` | `https://YOUR-USERNAME.github.io/your-repo` |

**How to get Gmail app password:**
1. Enable 2FA on Gmail
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate for "Mail"
4. Copy 16-character password

#### Optional (API-Football for live results)

| Key | Value |
|-----|-------|
| `API_FOOTBALL_KEY` | From RapidAPI | Optional |
| `API_FOOTBALL_HOST` | `api-football-v1.p.rapidapi.com` | Optional |

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will start building (3-5 minutes)
3. Watch logs for progress

**Your API will be live at:**
```
https://YOUR-APP.onrender.com
```

Save this URL - you'll need it for frontend configuration!

---

## Step 3: Initialize Database (3 minutes)

After deployment, you need to run migrations and seed data.

### Using Render Shell

1. In Render Dashboard, go to your service
2. Click **"Shell"** tab (top right)
3. Run these commands:

```bash
# Run migrations
npx prisma migrate deploy

# Seed database (teams, players, matches)
npx prisma db seed
```

You should see:
- ✅ Migrations applied
- ✅ 112 teams created
- ✅ 88 players created
- ✅ 104 matches created

**✅ Database Initialized!**

---

## Step 4: Update Google OAuth (2 minutes)

Add your production URL to Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://YOUR-USERNAME.github.io
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://YOUR-APP.onrender.com/auth/google/callback
   ```
6. Click **"Save"**

---

## Step 5: Verify Deployment (5 minutes)

### Test API Health

```bash
curl https://YOUR-APP.onrender.com/
```

Should return: `{"message":"World Cup 2026 API"}`

### Test Matches Endpoint

```bash
curl https://YOUR-APP.onrender.com/matches
```

Should return array of matches.

### Test in Browser

1. Visit your frontend (GitHub Pages)
2. Click "Sign in with Google"
3. Should complete OAuth successfully
4. Try making a prediction
5. Check leaderboard

### Check Render Logs

In Render Dashboard → Logs, you should see:

```
[NestApplication] Nest application successfully started
Application is running on: http://0.0.0.0:4000
[EmailService] Email service initialized with gmail
```

**✅ Everything Working!**

---

## 🔄 Auto-Deploy Setup

Every push to `main` branch will automatically deploy:

1. Push changes to GitHub
2. Render detects new commit
3. Rebuilds and redeploys automatically
4. Takes ~3-5 minutes

**Monitor deployments:**
- Render Dashboard → Deployments tab

---

## 📊 Free Tier Limits

### Render.com Free Tier
- ✅ 750 hours/month (enough for one service)
- ⚠️ **Sleeps after 15 minutes of inactivity**
- ✅ Wakes up on first request (~30 seconds)
- ✅ 512 MB RAM
- ✅ Shared CPU

**Note:** Cron jobs will keep service active during tournaments.

### Neon Free Tier
- ✅ 3 GB storage
- ✅ Unlimited compute hours
- ✅ Auto-suspend after 5 minutes (wakes instantly)
- ✅ 1 active project
- ✅ No time limit

---

## 🐛 Troubleshooting

### Build Failed

**Error:** `Cannot find module`

**Solution:**
```bash
git add package-lock.json
git commit -m "Add package-lock"
git push
```

### Database Connection Failed

**Error:** `P1001: Can't reach database server`

**Solutions:**
1. Check `DATABASE_URL` is correct from Neon
2. Ensure connection string includes `?sslmode=require`
3. Verify Neon database is running

### OAuth Not Working

**Error:** `redirect_uri_mismatch`

**Solutions:**
1. Check `GOOGLE_CALLBACK_URL` matches exactly
2. Verify Google Console has production callback URL
3. Ensure no trailing slashes

### Service Keeps Sleeping

**Issue:** API responds slowly on first request

**Solutions:**
1. This is normal for free tier
2. First request wakes it (~30 seconds)
3. Consider Hobby plan ($7/month, never sleeps)

---

## 📝 Deployment Checklist

- [ ] Neon database created
- [ ] Connection string saved
- [ ] Render web service created
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Database migrated
- [ ] Database seeded
- [ ] Google OAuth updated
- [ ] API health check passes
- [ ] Frontend can connect
- [ ] OAuth flow works

---

## 🎉 Deployment Complete!

Your World Cup 2026 backend is now live at:
```
https://YOUR-APP.onrender.com
```

**Costs: $0/month forever!** 🎊

---

## 📚 Useful Links

- **Neon Dashboard**: [console.neon.tech](https://console.neon.tech)
- **Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
- **Google OAuth Console**: [console.cloud.google.com](https://console.cloud.google.com)

Happy deploying! ⚽🏆

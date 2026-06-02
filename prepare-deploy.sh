#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Preparing Server for Deployment (Render.com + Neon)${NC}\n"

# Navigate to server directory
cd "$(dirname "$0")"

# Restore build artifacts that shouldn't be committed
echo -e "${YELLOW}📦 Cleaning build artifacts...${NC}"
git restore dist/ node_modules/ package-lock.json 2>/dev/null || true

# Add all source files
echo -e "${YELLOW}📝 Staging changes...${NC}"
git add .env.example
git add .gitignore
git add .github/
git add prisma/
git add src/
git add README.md
git add DEPLOYMENT.md
git add render.yaml
git add package.json
git add tsconfig.json

# Show status
echo -e "\n${BLUE}📊 Git Status:${NC}"
git status --short

# Commit
echo -e "\n${GREEN}✅ Ready to commit!${NC}"
echo -e "${YELLOW}Run this command to commit:${NC}"
echo -e "git commit -m \"feat: production-ready with Neon + Render deployment\""
echo -e "\n${YELLOW}Then push:${NC}"
echo -e "git push origin main"

echo -e "\n${GREEN}📚 Next Steps:${NC}"
echo -e "1. Create Neon database at https://neon.tech"
echo -e "2. Follow DEPLOYMENT.md for complete Render.com setup"
echo -e "3. Total cost: \$0/month! 🎉"

#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== WhatsApp Bot Local Setup ===${NC}\n"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Install from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL not found. Install from https://www.postgresql.org/download/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL found: $(psql --version)${NC}"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}Redis not found. Install from https://redis.io/download${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Redis found: $(redis-server --version)${NC}\n"

# Create database
echo -e "${BLUE}Creating PostgreSQL database...${NC}"
creatdb whatsapp_bot 2>/dev/null || echo "Database may already exist"
echo -e "${GREEN}✓ Database ready${NC}\n"

# Install dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}\n"

echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd ../frontend
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}\n"

cd ..

# Create .env files
echo -e "${BLUE}Creating .env files...${NC}"

cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://postgres@localhost:5432/whatsapp_bot
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-change-in-production
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
EOF

cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

echo -e "${GREEN}✓ .env files created${NC}\n"

echo -e "${BLUE}=== Setup Complete ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Start Redis:  ${GREEN}redis-server${NC}"
echo -e "  2. Start backend: ${GREEN}cd backend && npm run dev${NC}"
echo -e "  3. Start frontend: ${GREEN}cd frontend && npm run dev${NC}"
echo -e "  4. Open ${GREEN}http://localhost:3000${NC}\n"
echo -e "${YELLOW}Create a test account to get started!${NC}"

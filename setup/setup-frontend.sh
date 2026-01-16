#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Verdelle Nails - Frontend Setup${NC}"
echo -e "${BLUE}========================================${NC}"

cd frontend

# Install dependencies
echo -e "\n${GREEN}Installing npm dependencies...${NC}"
npm install

# Copy environment file
echo -e "${GREEN}Setting up environment file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file.${NC}"
fi

echo -e "\n${GREEN}Frontend setup complete!${NC}"
echo -e "${BLUE}To start the development server, run:${NC}"
echo -e "  cd frontend"
echo -e "  npm start"

#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Verdelle Nails - Backend Setup${NC}"
echo -e "${BLUE}========================================${NC}"

cd backend

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install it first.${NC}"
    exit 1
fi

# Create virtual environment
echo -e "\n${GREEN}Creating virtual environment...${NC}"
python3 -m venv venv

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
echo -e "${GREEN}Setting up environment file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please update with your database credentials.${NC}"
fi

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo -e "${GREEN}Create a superuser for Django admin:${NC}"
python manage.py createsuperuser

echo -e "\n${GREEN}Backend setup complete!${NC}"
echo -e "${BLUE}To start the server, run:${NC}"
echo -e "  cd backend"
echo -e "  source venv/bin/activate"
echo -e "  python manage.py runserver"

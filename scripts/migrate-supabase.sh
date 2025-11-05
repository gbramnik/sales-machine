#!/bin/bash

# Supabase Database Migration Script
# Applies all migrations to Supabase project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Sales Machine - Supabase Migration${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must be run from project root directory${NC}"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "supabase/migrations" ]; then
    echo -e "${RED}Error: supabase/migrations directory not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Select migration target:${NC}"
echo "1) Local Supabase (supabase start)"
echo "2) Remote Supabase (Production)"
echo "3) List pending migrations"
echo ""
read -p "Enter choice (1-3): " CHOICE

case $CHOICE in
  1)
    echo -e "${GREEN}Migrating to LOCAL Supabase...${NC}"
    echo ""

    # Check if local Supabase is running
    if ! supabase status &> /dev/null; then
        echo -e "${YELLOW}Local Supabase is not running. Starting it now...${NC}"
        supabase start
    fi

    # Apply migrations
    echo -e "${YELLOW}Applying migrations...${NC}"
    supabase db reset

    echo ""
    echo -e "${GREEN}✓ Local migrations applied successfully!${NC}"
    echo ""
    echo -e "${BLUE}Database URL:${NC} postgresql://postgres:postgres@localhost:54322/postgres"
    echo -e "${BLUE}Studio URL:${NC} http://localhost:54323"
    ;;

  2)
    echo -e "${YELLOW}WARNING: This will migrate the PRODUCTION database!${NC}"
    read -p "Are you sure? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        echo "Migration cancelled."
        exit 0
    fi

    echo -e "${GREEN}Migrating to REMOTE Supabase...${NC}"
    echo ""

    # Link to remote project if not already linked
    supabase link --project-ref sizslvtrbuldfzaoygbs

    # Push migrations
    echo -e "${YELLOW}Pushing migrations to remote...${NC}"
    supabase db push

    echo ""
    echo -e "${GREEN}✓ Remote migrations applied successfully!${NC}"
    ;;

  3)
    echo -e "${GREEN}Pending migrations:${NC}"
    echo ""

    # List migration files
    ls -1 supabase/migrations/

    echo ""
    echo -e "${BLUE}To apply migrations, run this script again and choose option 1 or 2${NC}"
    ;;

  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"

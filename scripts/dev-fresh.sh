#!/bin/bash

# PocketBase Full Setup and Development Script
# This script:
# 1. Resets PocketBase (wipes data)
# 2. Starts PocketBase in background
# 3. Sets up admin user
# 4. Creates collections
# 5. Seeds test data
# 6. Starts Vite dev server
# 7. Cleans up background PocketBase on exit

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Configuration
PB_URL="${VITE_POCKETBASE_URL:-http://127.0.0.1:8090}"
PB_PORT=8090
PB_PID_FILE=".pb_dev.pid"
LOG_DIR=".pb_logs"

# Create log directory
mkdir -p "$LOG_DIR"

cleanup() {
    echo
    echo -e "${BLUE}========================================${NC}"
    echo -e "${YELLOW}Shutting down...${NC}"
    echo -e "${BLUE}========================================${NC}"

    # Kill background PocketBase if running
    if [ -f "$PB_PID_FILE" ]; then
        PB_PID=$(cat "$PB_PID_FILE")
        if ps -p "$PB_PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping PocketBase (PID: $PB_PID)...${NC}"
            kill "$PB_PID" 2>/dev/null || true
            wait "$PB_PID" 2>/dev/null || true
            echo -e "${GREEN}✓ PocketBase stopped${NC}"
        fi
        rm -f "$PB_PID_FILE"
    fi

    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PocketBase Full Setup + Dev Server${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Step 1: Reset PocketBase
echo -e "${YELLOW}Step 1: Resetting PocketBase...${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
# Pipe 'yes' to make it non-interactive
if echo 'yes' | pnpm pb:reset > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Reset complete${NC}"
else
    echo -e "${RED}✗ Reset failed${NC}"
    exit 1
fi
echo

# Step 2: Create collections (MUST be done while PocketBase is STOPPED)
echo -e "${YELLOW}Step 2: Creating collections via migration...${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
echo -e "${GRAY}Note: PocketBase must be STOPPED for migrations${NC}"
if pnpm pb:create-collections > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Collections created successfully${NC}"
else
    echo -e "${YELLOW}⚠ Migration had issues, will continue...${NC}"
fi
echo

# Step 3: Start PocketBase in background
echo -e "${YELLOW}Step 3: Starting PocketBase in background...${NC}"
echo -e "${GRAY}----------------------------------------${NC}"

# Check if platform-specific binary exists
PB_BINARY=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ $(uname -m) == "arm64" ]]; then
        PB_BINARY="./thirdparty/pocketbase/pocketbase-darwin-arm64"
    else
        PB_BINARY="./thirdparty/pocketbase/pocketbase-darwin-amd64"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PB_BINARY="./thirdparty/pocketbase/pocketbase-linux-amd64"
else
    echo -e "${RED}✗ Unsupported platform: $OSTYPE${NC}"
    exit 1
fi

if [ ! -f "$PB_BINARY" ]; then
    echo -e "${RED}✗ PocketBase binary not found: $PB_BINARY${NC}"
    echo -e "${YELLOW}Run: pnpm setup:thirdparty${NC}"
    exit 1
fi

# Start PocketBase in background
nohup "$PB_BINARY" serve --http=0.0.0.0:8090 > "$LOG_DIR/pocketbase.log" 2>&1 &
PB_PID=$!
echo $PB_PID > "$PB_PID_FILE"

echo -e "${GRAY}PocketBase PID: $PB_PID${NC}"
echo -e "${GRAY}Log file: $LOG_DIR/pocketbase.log${NC}"

# Wait for PocketBase to be ready
echo -e "${YELLOW}Waiting for PocketBase to start...${NC}"
MAX_WAIT=30
WAIT_TIME=0
while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if curl -s "$PB_URL/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PocketBase is running at $PB_URL${NC}"
        break
    fi
    sleep 1
    WAIT_TIME=$((WAIT_TIME + 1))
    echo -n "."
done

if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    echo -e "${RED}✗ PocketBase failed to start within ${MAX_WAIT}s${NC}"
    echo -e "${YELLOW}Check log: $LOG_DIR/pocketbase.log${NC}"
    tail -20 "$LOG_DIR/pocketbase.log"
    exit 1
fi
echo

# Step 4: Setup admin
echo -e "${YELLOW}Step 4: Setting up admin user...${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
if pnpm pb:setup > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Admin setup complete${NC}"
else
    echo -e "${YELLOW}⚠ Admin setup had issues (may already exist)${NC}"
fi
echo

# Step 5: Seed data
echo -e "${YELLOW}Step 5: Seeding test data...${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
if pnpm db:seed; then
    echo -e "${GREEN}✓ Data seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠ Seeding had issues${NC}"
    echo -e "${YELLOW}This might be expected if collections aren't set up yet${NC}"
fi
echo

# Step 6: Start dev server
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo
echo -e "${YELLOW}Starting Vite development server...${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
echo
echo -e "${GREEN}PocketBase:${NC}"
echo -e "  URL: ${BLUE}$PB_URL${NC}"
echo -e "  Admin: ${BLUE}$PB_URL/_/${NC}"
echo -e "  PID: $PB_PID (will auto-stop on exit)"
echo
echo -e "${GREEN}Test Users (password: password123):${NC}"
echo -e "  user@example.com"
echo -e "  manager@example.com"
echo -e "  another@example.com"
echo
echo -e "${GREEN}Development Server:${NC}"
echo -e "  Starting at ${BLUE}http://localhost:5173${NC}"
echo
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Start Vite (foreground, will block)
pnpm dev

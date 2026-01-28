#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

console.log(`${colors.blue}PocketBase Reset / Wipe Script${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

async function stopPocketBase() {
  console.log(`${colors.blue}Checking for running PocketBase instances...${colors.reset}`);

  try {
    const result = execSync('lsof -i :8090', { encoding: 'utf-8' });
    
    if (result.trim()) {
      console.log(`${colors.yellow}PocketBase is running on port 8090${colors.reset}`);
      console.log(`${colors.yellow}Process: ${result.trim()}${colors.reset}`);
      console.log();
      console.log(`${colors.yellow}To stop PocketBase manually:${colors.reset}`);
      console.log(`${colors.gray}1. Find the PID from above${colors.reset}`);
      console.log(`${colors.gray}2. Kill the process: ${colors.blue}kill <PID>${colors.reset}`);
      console.log(`${colors.gray}3. Or press Ctrl+C in the PocketBase terminal${colors.reset}`);
      console.log();
      console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

      return false;
    } else {
      console.log(`${colors.green}✓ No PocketBase instance found running${colors.reset}`);
      return true;
    }
  } catch (error) {
    if (error.message.includes('lsof: not found')) {
      console.log(`${colors.yellow}lsof not available on this system${colors.reset}`);
      console.log(`${colors.yellow}Checking if port 8090 is in use...${colors.reset}`);
      console.log(`${colors.yellow}Please manually stop PocketBase if it's running${colors.reset}`);
      return false;
    } else {
      console.error(`${colors.red}Error checking for PocketBase:${colors.reset}`);
      return false;
    }
  }
}

async function wipePocketBaseData() {
  console.log(`${colors.blue}Wiping PocketBase data...${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

  const dataDirs = [
    'pb_data',
    'pb_data.bak',
    'pb_public',
    'pb_migrations'
  ];

  for (const dir of dataDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    
    if (fs.existsSync(dirPath)) {
      console.log(`${colors.yellow}Removing: ${dir}${colors.reset}`);
      
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`${colors.green}✓ Removed ${dir}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}✗ Error removing ${dir}: ${error.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.gray}✓ ${dir} not found (already clean)${colors.reset}`);
    }
  }

  console.log();
  console.log(`${colors.green}✓ PocketBase data directory wiped${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
}

async function resetConfigFile() {
  console.log(`${colors.blue}Checking configuration files...${colors.reset}`);

  const configFiles = [
    '.env',
    'pb-config.json'
  ];

  for (const file of configFiles) {
    const filePath = path.join(__dirname, '..', file);
    
    if (fs.existsSync(filePath)) {
      console.log(`${colors.gray}✓ ${file} exists${colors.reset}`);
    }
  }

  console.log();
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
}

async function showNextSteps() {
  console.log(`${colors.green}✓ PocketBase reset complete!${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

  console.log(`1. ${colors.gray}Start PocketBase (fresh instance):${colors.reset}`);
  console.log(`   ${colors.blue}Option A: ${colors.gray}Direct binary${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}./pocketbase serve${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}Or:${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}pnpm pb:start${colors.reset}`);

  console.log(`2. ${colors.gray}Access Admin UI (first-time setup):${colors.reset}`);
  console.log(`   ${colors.blue}${PB_URL}/_/${colors.reset}`);
  console.log(`   ${colors.gray}You'll see a setup screen${colors.reset}`);

  console.log(`3. ${colors.gray}Create admin account:${colors.reset}`);
  console.log(`   ${colors.gray}Email: ${colors.blue}${process.env.PB_ADMIN_EMAIL || 'admin@example.com'}${colors.reset}`);
  console.log(`   ${colors.gray}Password: ${colors.blue}${process.env.PB_ADMIN_PASSWORD || 'admin12345'}${colors.reset}`);

  console.log(`4. ${colors.gray}Verify .env configuration:${colors.reset}`);
  console.log(`   ${colors.gray}Check that these are set:${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}VITE_POCKETBASE_URL=${PB_URL}${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}PB_ADMIN_EMAIL=${process.env.PB_ADMIN_EMAIL || 'admin@example.com'}${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}PB_ADMIN_PASSWORD=${process.env.PB_ADMIN_PASSWORD || 'admin12345'}${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}VITE_AUTO_MOCK_DATA=${process.env.VITE_AUTO_MOCK_DATA || 'true'}${colors.reset}`);

  console.log(`5. ${colors.gray}After admin is created:${colors.reset}`);
  console.log(`   ${colors.gray}Run: ${colors.blue}pnpm pb:setup${colors.reset}`);
  console.log(`   ${colors.gray}This will verify admin credentials${colors.reset}`);

  console.log(`6. ${colors.gray}Create collections:${colors.reset}`);
  console.log(`   ${colors.gray}Option A - Manual (Recommended):${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}Use Admin UI at ${PB_URL}/_/${colors.reset}`);
  console.log(`   ${colors.gray}  See: ${colors.blue}docs/pocketbase-setup.md${colors.reset}`);
  console.log(`   ${colors.gray}  for detailed field definitions${colors.reset}`);
  console.log(`   ${colors.gray}Option B - Generate config:${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}pnpm pb:create-collections${colors.reset}`);
  console.log(`   ${colors.gray}  Then import in Admin UI${colors.reset}`);

  console.log(`7. ${colors.gray}Seed test data (optional):${colors.reset}`);
  console.log(`   ${colors.blue}pnpm db:seed${colors.reset}`);

  console.log(`8. ${colors.gray}Start development:${colors.reset}`);
  console.log(`   ${colors.blue}pnpm dev${colors.reset}`);

  console.log(`9. ${colors.gray}Access application:${colors.reset}`);
  console.log(`   ${colors.blue}http://localhost:3000${colors.reset}`);

  console.log();
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

  console.log(`${colors.yellow}Warning: This will delete ALL PocketBase data!${colors.reset}`);
  console.log(`${colors.yellow}Including users, coupons, and roles.${colors.reset}`);
  console.log();
}

async function main() {
  const stopped = await stopPocketBase();

  if (!stopped) {
    console.log();
    console.log(`${colors.yellow}Please stop PocketBase manually before continuing${colors.reset}`);
    console.log(`${colors.yellow}Press Enter when ready to continue, or Ctrl+C to cancel...${colors.reset}`);

    await new Promise((resolve) => {
      process.stdin.once('data', resolve);
    });
  }

  console.log();
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

  console.log(`${colors.yellow}Are you sure you want to wipe all PocketBase data?${colors.reset}`);
  console.log(`${colors.yellow}This action CANNOT be undone!${colors.reset}`);
  console.log();
  console.log(`${colors.gray}Type 'yes' to continue, or anything else to cancel...${colors.reset}`);

  const answer = await new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim().toLowerCase());
    });
  });

  if (answer !== 'yes' && answer !== 'y') {
    console.log(`${colors.red}Cancelled.${colors.reset}`);
    process.exit(0);
    return;
  }

  console.log();
  await wipePocketBaseData();
  await resetConfigFile();

  await showNextSteps();
}

main();
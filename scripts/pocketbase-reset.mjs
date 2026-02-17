#!/usr/bin/env node

import fs from 'fs';
import net from 'net';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = dirname(__dirname);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const PB_PORT = 8090;
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin12345';

console.log(`${colors.blue}PocketBase Reset / Wipe Script${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

async function stopPocketBase() {
  console.log(`${colors.blue}Checking for running PocketBase instances...${colors.reset}`);

  const isPortInUse = await checkPortInUse(PB_PORT);

  if (isPortInUse) {
    console.log(`${colors.yellow}✓ Port ${PB_PORT} is in use${colors.reset}`);
    console.log(`${colors.yellow}PocketBase may be running${colors.reset}`);
    console.log();
    console.log(`${colors.yellow}To stop PocketBase:${colors.reset}`);
    console.log(`${colors.gray}1. Press Ctrl+C in the PocketBase terminal${colors.reset}`);
    console.log(`${colors.gray}2. Or kill the process manually${colors.reset}`);
    console.log();
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

    return false;
  } else {
    console.log(`${colors.green}✓ Port ${PB_PORT} is available${colors.reset}`);
    return true;
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

  const locations = [
    { name: 'root', path: REPO_ROOT },
    { name: 'thirdparty/pocketbase', path: join(REPO_ROOT, 'thirdparty', 'pocketbase') }
  ];

  for (const location of locations) {
    console.log(`${colors.blue}Checking ${location.name}...${colors.reset}`);

    for (const dir of dataDirs) {
      const dirPath = join(location.path, dir);

      if (fs.existsSync(dirPath)) {
        console.log(`${colors.yellow}Removing: ${join(location.name, dir)}${colors.reset}`);

        try {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`${colors.green}✓ Removed ${join(location.name, dir)}${colors.reset}`);
        } catch (error) {
          console.error(`${colors.red}✗ Error removing ${join(location.name, dir)}: ${error.message}${colors.reset}`);
        }
      } else {
        console.log(`${colors.gray}✓ ${join(location.name, dir)} not found (already clean)${colors.reset}`);
      }
    }

    console.log();
  }

  console.log(`${colors.green}✓ PocketBase data directory wiped${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
}

async function showConfigStatus() {
  console.log(`${colors.blue}Configuration files status:${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

  const configFiles = [
    { name: '.env', path: join(REPO_ROOT, '.env') },
    { name: 'pb-config.json', path: join(REPO_ROOT, 'pb-config.json') }
  ];

  for (const file of configFiles) {
    if (fs.existsSync(file.path)) {
      console.log(`${colors.green}✓ ${file.name} exists${colors.reset}`);

      if (file.name === '.env') {
        console.log(`  ${colors.gray}PB_ADMIN_EMAIL: ${PB_ADMIN_EMAIL}${colors.reset}`);
        console.log(`  ${colors.gray}PB_ADMIN_PASSWORD: ${PB_ADMIN_PASSWORD}${colors.reset}`);
        console.log(`  ${colors.gray}VITE_POCKETBASE_URL: ${PB_URL}${colors.reset}`);
      }
    } else {
      console.log(`${colors.gray}✗ ${file.name} not found${colors.reset}`);
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
  console.log(`   ${colors.blue}pnpm pb:start${colors.reset}`);

  console.log();
  console.log(`2. ${colors.gray}Run setup (automated):${colors.reset}`);
  console.log(`   ${colors.blue}pnpm pb:setup${colors.reset}`);
  console.log(`   ${colors.gray}This will automatically create the admin user using credentials from .env${colors.reset}`);

  console.log();
  console.log(`3. ${colors.gray}Create collections:${colors.reset}`);
  console.log(`   ${colors.gray}Option A - Manual (Recommended):${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}Use Admin UI at ${PB_URL}/_/${colors.reset}`);
  console.log(`   ${colors.gray}  See: ${colors.blue}docs/pocketbase-setup.md${colors.reset}`);
  console.log(`   ${colors.gray}  for detailed field definitions${colors.reset}`);
  console.log(`   ${colors.gray}Option B - Generate config:${colors.reset}`);
  console.log(`   ${colors.gray}  ${colors.blue}pnpm pb:create-collections${colors.reset}`);
  console.log(`   ${colors.gray}  Then import in Admin UI${colors.reset}`);

  console.log();
  console.log(`4. ${colors.gray}Seed test data (optional):${colors.reset}`);
  console.log(`   ${colors.blue}pnpm db:seed${colors.reset}`);

  console.log();
  console.log(`5. ${colors.gray}Start development:${colors.reset}`);
  console.log(`   ${colors.blue}pnpm dev${colors.reset}`);

  console.log();
  console.log(`6. ${colors.gray}Access application:${colors.reset}`);
  console.log(`   ${colors.blue}http://localhost:3009${colors.reset}`);

  console.log();
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

  console.log(`${colors.yellow}Warning: This deleted ALL PocketBase data!${colors.reset}`);
  console.log(`${colors.yellow}Including users, coupons, and roles.${colors.reset}`);

  console.log();
  console.log(`${colors.yellow}Note: Configuration (.env) is preserved${colors.reset}`);
  console.log(`${colors.yellow}Your admin credentials are still set to:${colors.reset}`);
  console.log(`  ${colors.blue}${PB_ADMIN_EMAIL}${colors.reset}`);
  console.log(`  ${colors.blue}${PB_ADMIN_PASSWORD}${colors.reset}`);

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
  await showConfigStatus();

  console.log();
  await showNextSteps();
  process.exit(0);
}

main();

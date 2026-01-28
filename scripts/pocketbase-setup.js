#!/usr/bin/env node

import PocketBase from 'pocketbase';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin12345';

console.log(`${colors.blue}PocketBase Setup Script${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

async function checkConnection() {
  console.log(`${colors.blue}Checking PocketBase connection...${colors.reset}`);

  try {
    const pb = new PocketBase(PB_URL);
    const health = await pb.health.check();
    console.log(`${colors.green}✓ PocketBase is running at ${PB_URL}${colors.reset}`);
    console.log(`${colors.gray}Version: ${health.code}${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Cannot connect to PocketBase at ${PB_URL}${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.yellow}Please start PocketBase server first:${colors.reset}`);
    console.log(`${colors.yellow}  pnpm pb:start${colors.reset}`);
    console.log(`${colors.yellow}Or download and run PocketBase:${colors.reset}`);
    console.log(`${colors.yellow}  https://pocketbase.io/docs/${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
    return false;
  }
}

async function setupAdmin() {
  console.log(`${colors.blue}Setting up admin user...${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

  try {
    const pb = new PocketBase(PB_URL);

    console.log(`${colors.gray}Using credentials from .env:${colors.reset}`);
    console.log(`${colors.gray}Email: ${PB_ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.gray}Password: ${PB_ADMIN_PASSWORD}${colors.reset}`);
    console.log();

    console.log(`${colors.blue}Attempting to authenticate...${colors.reset}`);

    try {
      await pb.admins.authWithPassword(
        PB_ADMIN_EMAIL,
        PB_ADMIN_PASSWORD
      );

      console.log(`${colors.green}✓ Admin user exists and credentials are valid${colors.reset}`);
      console.log();
      return true;
    } catch (authError) {
      console.log(`${colors.yellow}Authentication failed${colors.reset}`);
      console.log(`${colors.yellow}Error: ${authError.message}${colors.reset}`);
      console.log();

      console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
      console.log(`${colors.yellow}FIRST-TIME SETUP INSTRUCTIONS:${colors.reset}`);
      console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
      console.log(`${colors.yellow}If this is your FIRST time using PocketBase:${colors.reset}`);
      console.log();
      console.log(`${colors.gray}1. Start PocketBase (fresh instance):${colors.reset}`);
      console.log(`   ${colors.blue}Option A: ${colors.gray}Direct binary${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}./pocketbase serve${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}Or:${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}pnpm pb:start${colors.reset}`);
      console.log();
      console.log(`${colors.gray}2. On FIRST run, you'll see a setup screen:${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}Open: ${PB_URL}/_/ in browser${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}Create your admin account${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}Email: ${PB_ADMIN_EMAIL}${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}Password: ${PB_ADMIN_PASSWORD}${colors.reset}`);
      console.log();
      console.log(`${colors.gray}3. After creating admin, run this script again:${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}pnpm pb:setup${colors.reset}`);
      console.log();
      console.log(`${colors.gray}4. To completely reset:${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}pnpm pb:reset${colors.reset}`);
      console.log(`   ${colors.gray}  ${colors.blue}This will stop PocketBase, delete ALL data, and let you start fresh${colors.reset}`);

      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Unexpected error during setup:${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

async function main() {
  const connected = await checkConnection();

  if (!connected) {
    process.exit(1);
    return;
  }

  const success = await setupAdmin();

  if (!success) {
    process.exit(1);
    return;
  }

  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.green}✓ PocketBase setup complete!${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

  console.log(`1. Access Admin UI: ${PB_URL}/_/`);
  console.log(`2. Login with: ${PB_ADMIN_EMAIL}`);
  console.log(`3. Run: ${colors.gray}pnpm pb:create-collections${colors.reset}`);
  console.log(`   - Or create manually in Admin UI`);
  console.log(`4. Seed data (optional): ${colors.gray}pnpm db:seed${colors.reset}`);
  console.log(`5. Start dev server: ${colors.gray}pnpm dev${colors.reset}`);

  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

  console.log();
  console.log(`${colors.yellow}To reset everything and start fresh:${colors.reset}`);
  console.log(`${colors.gray}Run: ${colors.blue}pnpm pb:reset${colors.reset}`);
  console.log(`${colors.gray}This will:${colors.reset}`);
  console.log(`   ${colors.gray}1. Stop PocketBase (if running)${colors.reset}`);
  console.log(`   ${colors.gray}2. Delete ALL data (users, coupons, etc.)${colors.reset}`);
  console.log(`   ${colors.gray}3. Let you start fresh${colors.reset}`);

  console.log();
  console.log(`${colors.yellow}Test credentials (if you seed):${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
  console.log(`User: user@example.com / pass123`);
  console.log(`Manager: manager@example.com / pass123`);
}

main();
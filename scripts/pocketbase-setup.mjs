#!/usr/bin/env node

import PocketBase from 'pocketbase';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const REPO_ROOT = dirname(__dirname);
const PLATFORM = process.platform;
let POCKETBASE_BINARY;

if (PLATFORM === 'darwin') {
  const ARCH = process.arch;
  if (ARCH === 'arm64') {
    POCKETBASE_BINARY = join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-darwin-arm64');
  } else if (ARCH === 'x64') {
    POCKETBASE_BINARY = join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-darwin-amd64');
  } else {
    console.error('Unsupported macOS architecture:', ARCH);
    process.exit(1);
  }
} else if (PLATFORM === 'linux') {
  POCKETBASE_BINARY = join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-linux-amd64');
} else if (PLATFORM === 'win32') {
  POCKETBASE_BINARY = join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-windows-amd64.exe');
} else {
  console.error('Unsupported platform:', PLATFORM);
  process.exit(1);
}

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

async function createFirstAdminCLI() {
  console.log(`${colors.blue}Attempting to create first admin user via CLI...${colors.reset}`);

  try {
    execSync(`"${POCKETBASE_BINARY}" superuser upsert "${PB_ADMIN_EMAIL}" "${PB_ADMIN_PASSWORD}"`, {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      env: {
        ...process.env,
        HOME: process.env.HOME
      }
    });

    console.log(`${colors.green}✓ First admin user created successfully!${colors.reset}`);
    console.log(`${colors.gray}Email: ${PB_ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.gray}Password: ${PB_ADMIN_PASSWORD}${colors.reset}`);
    console.log();
    return true;
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : '';
    const stdout = error.stdout ? error.stdout.toString() : '';

    if (stderr.includes('already exists') || stdout.includes('already exists')) {
      console.log(`${colors.yellow}✗ Admin user already exists${colors.reset}`);
      console.log(`${colors.gray}This is expected if PocketBase was set up previously${colors.reset}`);
      console.log();
      return false;
    } else if (error.status === 403 || stderr.includes('forbidden')) {
      console.log(`${colors.yellow}✗ Admin user already exists (access forbidden)${colors.reset}`);
      console.log(`${colors.gray}This means PocketBase already has an admin account${colors.reset}`);
      console.log();
      return false;
    } else {
      console.error(`${colors.red}✗ Failed to create admin user${colors.reset}`);
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
      console.error(`${colors.red}Status: ${error.status}${colors.reset}`);
      if (stderr) {
        console.error(`${colors.red}Stderr: ${stderr}${colors.reset}`);
      }
      console.log();
      return false;
    }
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

    console.log(`${colors.blue}Step 1: Attempting to authenticate with existing admin...${colors.reset}`);

    try {
      await pb.admins.authWithPassword(
        PB_ADMIN_EMAIL,
        PB_ADMIN_PASSWORD
      );

      console.log(`${colors.green}✓ Admin user exists and credentials are valid${colors.reset}`);
      console.log();
      return true;
    } catch (authError) {
      console.log(`${colors.yellow}✓ Authentication failed (expected for fresh PocketBase instance)${colors.reset}`);
      console.log(`${colors.gray}Error: ${authError.message}${colors.reset}`);
      console.log();

      console.log(`${colors.blue}Step 2: Attempting to create first admin user...${colors.reset}`);
      console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

      const created = await createFirstAdminCLI();

      if (created) {
        console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
        console.log(`${colors.blue}Step 3: Verifying admin login...${colors.reset}`);

        try {
          await pb.admins.authWithPassword(
            PB_ADMIN_EMAIL,
            PB_ADMIN_PASSWORD
          );

          console.log(`${colors.green}✓ Admin user verified and authenticated${colors.reset}`);
          console.log();
          return true;
        } catch (verifyError) {
          console.error(`${colors.red}✗ Failed to verify admin login${colors.reset}`);
          console.error(`${colors.red}Error: ${verifyError.message}${colors.reset}`);
          return false;
        }
      } else {
        console.log();
        console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
        console.log(`${colors.yellow}ADMIN CREATION FAILED${colors.reset}`);
        console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
        console.log(`${colors.yellow}This usually means:${colors.reset}`);
        console.log(`${colors.gray}1. An admin user already exists with different credentials${colors.reset}`);
        console.log(`${colors.gray}2. The password in .env doesn't match the existing admin${colors.reset}`);
        console.log(`${colors.gray}3. The email format is invalid${colors.reset}`);
        console.log();
        console.log(`${colors.yellow}Solutions:${colors.reset}`);
        console.log();
        console.log(`${colors.gray}Option A - Update credentials:${colors.reset}`);
        console.log(`  ${colors.blue}1. Access Admin UI: ${PB_URL}/_/${colors.reset}`);
        console.log(`  ${colors.blue}2. Login with existing admin credentials${colors.reset}`);
        console.log(`  ${colors.blue}3. Update .env with correct credentials${colors.reset}`);
        console.log(`  ${colors.blue}4. Run: pnpm pb:setup${colors.reset}`);
        console.log();
        console.log(`${colors.gray}Option B - Reset and start fresh:${colors.reset}`);
        console.log(`  ${colors.blue}1. Stop PocketBase (Ctrl+C)${colors.reset}`);
        console.log(`  ${colors.blue}2. Run: pnpm pb:reset${colors.reset}`);
        console.log(`  ${colors.blue}3. Start PocketBase: pnpm pb:start${colors.reset}`);
        console.log(`  ${colors.blue}4. Run: pnpm pb:setup${colors.reset}`);
        console.log();
        console.log(`${colors.gray}Option C - Manually create admin (fresh instance only):${colors.reset}`);
        console.log(`  ${colors.blue}1. Open: ${PB_URL}/_/ in browser${colors.reset}`);
        console.log(`  ${colors.blue}2. Use the setup screen to create admin${colors.reset}`);
        console.log(`  ${colors.blue}3. Update .env with those credentials${colors.reset}`);
        console.log(`  ${colors.blue}4. Run: pnpm pb:setup${colors.reset}`);
        console.log();

        return false;
      }
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
  console.log(`   - Creates: user_roles, retailers, coupons`);
  console.log(`   - Coupons include userId relation`);
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
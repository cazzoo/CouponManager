#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);

const REPO_ROOT = path.resolve(__dirname, '..');

// Detect platform and select appropriate binary
const PLATFORM = process.platform;
let POCKETBASE_BINARY;

if (PLATFORM === 'darwin') {
  const ARCH = process.arch;
  if (ARCH === 'arm64') {
    POCKETBASE_BINARY = path.join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-darwin-arm64');
  } else if (ARCH === 'x64') {
    POCKETBASE_BINARY = path.join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-darwin-amd64');
  } else {
    console.error('Unsupported macOS architecture:', ARCH);
    process.exit(1);
  }
} else if (PLATFORM === 'linux') {
  POCKETBASE_BINARY = path.join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-linux-amd64');
} else if (PLATFORM === 'win32') {
  POCKETBASE_BINARY = path.join(REPO_ROOT, 'thirdparty', 'pocketbase', 'pocketbase-windows-amd64.exe');
} else {
  console.error('Unsupported platform:', PLATFORM);
  process.exit(1);
}

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

const args = process.argv.slice(2);
const isConfigOnly = args.includes('--config');

async function runMigration() {
  console.log('\n=== Running PocketBase migration ===\n');

  try {
    console.log('Running migration using PocketBase binary...');
    console.log('Binary:', POCKETBASE_BINARY);
    console.log('Note: Make sure PocketBase server is STOPPED before running migrations');
    console.log('Using PocketBase v0.36.1 binary from thirdparty directory');
    
    try {
      execSync(`"${POCKETBASE_BINARY}" --dir ./pb_data migrate up --migrationsDir ./migrations`, {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
          ...process.env,
          HOME: process.env.HOME
        }
      });
      
      console.log('\n✓ Migration completed successfully');
    } catch (error) {
      console.error('\n✗ Migration failed');
      console.error('Make sure:');
      console.error('  1. PocketBase server is STOPPED');
      console.error('  2. migrations/ directory exists');
      console.error('  3. PocketBase binary exists in thirdparty/pocketbase/');
      console.error('\nIf this is a fresh install, you may need to:');
      console.error('  a) Set up first admin user via PocketBase Admin UI');
      console.error('  b) Add userId relation field to coupons collection via Admin UI');
      throw error;
    }
  } catch (error) {
    console.error('\n✗ Failed to run migration:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // For migration mode, we don't need to check connection
    // Server should be STOPPED when running migrations
    await runMigration();

    console.log('\n✓ PocketBase setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start PocketBase: pnpm pb:start');
    console.log('2. Access Admin UI: http://127.0.0.1:8090/_/');
    console.log('3. Set up first admin account');
    console.log('4. Add userId relation field to coupons collection via Admin UI');

  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    process.exit(1);
  }
}

main();

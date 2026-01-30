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

    const pbDir = path.dirname(POCKETBASE_BINARY);
    const pbDataPath = path.join(pbDir, 'pb_data');
    const migrationsPath = path.join(REPO_ROOT, 'migrations');

    console.log('PocketBase directory:', pbDir);
    console.log('Data directory:', pbDataPath);
    console.log('Migrations directory:', migrationsPath);

    try {
      execSync(`"${POCKETBASE_BINARY}" migrate up --migrationsDir "${migrationsPath}"`, {
        cwd: pbDir,
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
      console.error('  2. migrations/ directory exists at:', migrationsPath);
      console.error('  3. PocketBase binary exists at:', POCKETBASE_BINARY);
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

async function verifyCollections() {
  const fs = await import('fs');
  const pbDir = path.dirname(POCKETBASE_BINARY);
  const dbPath = path.join(pbDir, 'pb_data', 'data.db');

  if (!fs.existsSync(dbPath)) {
    console.log('\n⚠ Database file not found. Please start PocketBase and run setup first.');
    return;
  }

  try {
    const { execSync } = await import('child_process');
    const result = execSync(`sqlite3 "${dbPath}" "SELECT name FROM _collections WHERE name IN ('user_roles', 'retailers', 'coupons', 'users') ORDER BY name;"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const collections = result.trim().split('\n');
    console.log('\nCollections found:');
    collections.forEach(col => {
      console.log(`  ✓ ${col}`);
    });

    if (collections.length >= 3) {
      console.log('\n✓ All required collections exist!');
    } else {
      console.log('\n⚠ Some collections are missing. Please verify the migration was applied correctly.');
    }
  } catch (error) {
    console.log('\n⚠ Could not verify collections. Make sure SQLite is installed.');
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
    console.log('2. Run setup: pnpm pb:setup');
    console.log('3. Access Admin UI: http://127.0.0.1:8090/_/');
    console.log('\nCollections created:');
    console.log('  - users (auth collection)');
    console.log('  - user_roles');
    console.log('  - retailers');
    console.log('  - coupons (with userId relation)');

    await verifyCollections();

  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    process.exit(1);
  }
}

main();

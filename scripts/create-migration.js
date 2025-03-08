#!/usr/bin/env node

/**
 * Migration Creator for Coupon Manager
 * 
 * This script creates a new SQL migration file and adds it to the migrations.json list.
 * 
 * Usage:
 * node scripts/create-migration.js migration_name "Optional description"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const SQL_DIR = path.join(MIGRATIONS_DIR, 'sql');
const MIGRATIONS_FILE = path.join(MIGRATIONS_DIR, 'migrations.json');

// Ensure directories exist
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

if (!fs.existsSync(SQL_DIR)) {
  fs.mkdirSync(SQL_DIR, { recursive: true });
}

// Get command line arguments
const args = process.argv.slice(2);
const migrationName = args[0];
const description = args[1] || migrationName;

if (!migrationName) {
  console.error(`${colors.red}Error: Migration name is required${colors.reset}`);
  console.log('Usage: node scripts/create-migration.js migration_name "Optional description"');
  process.exit(1);
}

// Generate migration ID (timestamp-based)
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const id = `${year}${month}${day}${hours}${minutes}${seconds}`;
const safeName = migrationName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
const fileName = `${id}-${safeName}.sql`;
const filePath = path.join(SQL_DIR, fileName);

// Load existing migrations
let migrations = [];
if (fs.existsSync(MIGRATIONS_FILE)) {
  try {
    migrations = JSON.parse(fs.readFileSync(MIGRATIONS_FILE, 'utf8'));
  } catch (error) {
    console.error(`${colors.red}Error loading migrations file: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Create migration SQL file
const sqlTemplate = `-- Migration: ${migrationName}
-- Description: ${description}
-- Created at: ${now.toISOString()}

-- Up Migration
-- Add your SQL statements here

-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- Down Migration
-- Uncomment to use for rollback
/*
-- Add your rollback SQL statements here

-- Example:
-- DROP TABLE IF EXISTS example;
*/
`;

// Write SQL file
fs.writeFileSync(filePath, sqlTemplate);
console.log(`${colors.green}Created migration file: ${fileName}${colors.reset}`);

// Add to migrations.json
const newMigration = {
  id,
  description,
  file: fileName,
  dependencies: []
};

migrations.push(newMigration);

// Sort migrations by ID
migrations.sort((a, b) => a.id.localeCompare(b.id));

// Write updated migrations.json
fs.writeFileSync(MIGRATIONS_FILE, JSON.stringify(migrations, null, 2));
console.log(`${colors.green}Added migration to migrations.json${colors.reset}`);

// Provide next steps
console.log(`\n${colors.blue}Next steps:${colors.reset}`);
console.log(`1. Edit the migration file: ${filePath}`);
console.log(`2. Update dependencies in migrations.json if needed`);
console.log(`3. Run the migration with: pnpm migrate:up`); 
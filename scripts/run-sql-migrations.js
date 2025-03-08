#!/usr/bin/env node

/**
 * SQL Migration Runner for Coupon Manager
 * 
 * This script manages SQL-based migrations for the Coupon Manager application.
 * It reads migration files from the migrations/sql directory and executes them
 * in the correct order based on the migrations.json file.
 * 
 * Commands:
 * - node scripts/run-sql-migrations.js       # Run all pending migrations
 * - node scripts/run-sql-migrations.js list  # List all migrations
 * - node scripts/run-sql-migrations.js status # Check migration status
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
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

dotenv.config();

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const SQL_DIR = path.join(MIGRATIONS_DIR, 'sql');
const MIGRATIONS_FILE = path.join(MIGRATIONS_DIR, 'migrations.json');

// Database connection
const client = new pg.Client({
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT,
  database: process.env.SUPABASE_DB_NAME,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ensure migrations table exists
async function ensureMigrationsTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Load migrations from migrations.json
function loadMigrations() {
  if (!fs.existsSync(MIGRATIONS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(MIGRATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`${colors.red}Error loading migrations file: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Get applied migrations from database
async function getAppliedMigrations() {
  const result = await client.query('SELECT id FROM migrations ORDER BY executed_at');
  return result.rows.map(row => row.id);
}

// Execute a single migration
async function executeMigration(migration) {
  const sqlFile = path.join(SQL_DIR, migration.file);
  
  if (!fs.existsSync(sqlFile)) {
    console.error(`${colors.red}Migration file not found: ${migration.file}${colors.reset}`);
    return false;
  }
  
  try {
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Extract the up migration part (everything between -- Up Migration and -- Down Migration)
    const upMatch = sql.match(/-- Up Migration\s+([\s\S]*?)(?:-- Down Migration|$)/);
    if (!upMatch || !upMatch[1]) {
      console.error(`${colors.red}No Up Migration section found in ${migration.file}${colors.reset}`);
      return false;
    }
    
    const upSql = upMatch[1].trim();
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute the migration
    await client.query(upSql);
    
    // Record the migration
    await client.query(
      'INSERT INTO migrations (id, name) VALUES ($1, $2)',
      [migration.id, migration.description || migration.id]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`${colors.green}✓ Applied migration: ${migration.id} - ${migration.description || ''}${colors.reset}`);
    return true;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error(`${colors.red}Error applying migration ${migration.id}: ${error.message}${colors.reset}`);
    return false;
  }
}

// Run all pending migrations
async function runMigrations() {
  const migrations = loadMigrations();
  const appliedMigrations = await getAppliedMigrations();
  
  // Filter out already applied migrations
  const pendingMigrations = migrations.filter(m => !appliedMigrations.includes(m.id));
  
  if (pendingMigrations.length === 0) {
    console.log(`${colors.green}No pending migrations to apply.${colors.reset}`);
    return true;
  }
  
  console.log(`${colors.blue}Found ${pendingMigrations.length} pending migrations.${colors.reset}`);
  
  // Sort migrations by ID (which should be timestamp-based)
  pendingMigrations.sort((a, b) => a.id.localeCompare(b.id));
  
  // Execute migrations in order
  let success = true;
  for (const migration of pendingMigrations) {
    const result = await executeMigration(migration);
    if (!result) {
      success = false;
      break;
    }
  }
  
  return success;
}

// List all migrations and their status
async function listMigrations() {
  const migrations = loadMigrations();
  const appliedMigrations = await getAppliedMigrations();
  
  console.log(`${colors.blue}Migrations:${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(80)}${colors.reset}`);
  console.log(`${colors.gray}ID                   | Status    | Description${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(80)}${colors.reset}`);
  
  migrations.forEach(migration => {
    const status = appliedMigrations.includes(migration.id) 
      ? `${colors.green}Applied  ${colors.reset}` 
      : `${colors.yellow}Pending  ${colors.reset}`;
    console.log(`${migration.id} | ${status} | ${migration.description || ''}`);
  });
  
  console.log(`${colors.gray}${'─'.repeat(80)}${colors.reset}`);
}

// Check migration status
async function checkStatus() {
  const migrations = loadMigrations();
  const appliedMigrations = await getAppliedMigrations();
  
  const pendingCount = migrations.filter(m => !appliedMigrations.includes(m.id)).length;
  const appliedCount = appliedMigrations.length;
  
  console.log(`${colors.blue}Migration Status:${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  console.log(`Total migrations:  ${migrations.length}`);
  console.log(`Applied migrations: ${colors.green}${appliedCount}${colors.reset}`);
  console.log(`Pending migrations: ${pendingCount > 0 ? `${colors.yellow}${pendingCount}${colors.reset}` : `${colors.green}${pendingCount}${colors.reset}`}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  
  if (pendingCount > 0) {
    console.log(`${colors.yellow}Run 'pnpm migrate:up' to apply pending migrations.${colors.reset}`);
  } else {
    console.log(`${colors.green}Database is up to date.${colors.reset}`);
  }
}

// Main function
async function main() {
  const command = process.argv[2] || 'up';
  
  try {
    await client.connect();
    await ensureMigrationsTable();
    
    switch (command) {
      case 'up':
      case 'run':
        const success = await runMigrations();
        if (!success) {
          process.exit(1);
        }
        break;
      case 'list':
        await listMigrations();
        break;
      case 'status':
        await checkStatus();
        break;
      default:
        console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
        console.log('Available commands: up, list, status');
        process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main(); 
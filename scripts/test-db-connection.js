#!/usr/bin/env node

/**
 * Database Connection Tester for Coupon Manager
 * 
 * This script tests the connection to the Supabase database using the credentials
 * provided in the .env file.
 * 
 * Usage:
 * node scripts/test-db-connection.js
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

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

// Check if required environment variables are set
const requiredEnvVars = [
  'SUPABASE_DB_HOST',
  'SUPABASE_DB_PORT',
  'SUPABASE_DB_NAME',
  'SUPABASE_DB_USER',
  'SUPABASE_DB_PASSWORD'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`${colors.red}Error: Missing required environment variables:${colors.reset}`);
  missingEnvVars.forEach(varName => console.error(`- ${varName}`));
  console.error(`\n${colors.yellow}Please update your .env file with the required values.${colors.reset}`);
  console.error(`${colors.yellow}See docs/supabase-setup.md for instructions.${colors.reset}`);
  process.exit(1);
}

// Create database client
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

// Test connection
async function testConnection() {
  console.log(`${colors.blue}Testing connection to Supabase database...${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  console.log(`Host: ${process.env.SUPABASE_DB_HOST}`);
  console.log(`Database: ${process.env.SUPABASE_DB_NAME}`);
  console.log(`User: ${process.env.SUPABASE_DB_USER}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  
  try {
    await client.connect();
    console.log(`${colors.green}✓ Connection successful!${colors.reset}`);
    
    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    console.log(`PostgreSQL version: ${versionResult.rows[0].version.split(',')[0]}`);
    
    // Check if migrations table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      )
    `);
    
    if (tableResult.rows[0].exists) {
      // Count migrations
      const countResult = await client.query('SELECT COUNT(*) FROM migrations');
      console.log(`Migrations applied: ${countResult.rows[0].count}`);
    } else {
      console.log('Migrations table does not exist yet. Run migrations to create it.');
    }
    
    console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    console.log(`${colors.green}Database connection is ready for use.${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Connection failed: ${error.message}${colors.reset}`);
    console.error(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    console.error(`${colors.yellow}Troubleshooting tips:${colors.reset}`);
    console.error('1. Check that your Supabase database credentials are correct in .env');
    console.error('2. Make sure your IP address is allowed in Supabase database settings');
    console.error('3. Verify that the database is accessible from your current network');
    console.error('4. Check if SSL is required for your Supabase database connection');
    console.error(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    console.error(`${colors.yellow}See docs/supabase-setup.md for more information.${colors.reset}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection(); 
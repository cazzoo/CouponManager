#!/usr/bin/env node

/**
 * PocketBase Deploy Script
 * 
 * This script:
 * 1. Authenticates as PocketBase admin
 * 2. Imports collections (including user_roles)
 * 3. Creates application admin user with manager role
 * 
 * Usage: pnpm pb:deploy
 * 
 * Environment variables:
 * - VITE_POCKETBASE_URL: URL of your PocketBase instance
 * - PB_ADMIN_EMAIL: Admin email (for PocketBase admin authentication)
 * - PB_ADMIN_PASSWORD: Admin password (for PocketBase admin authentication)
 * - PB_APP_ADMIN_EMAIL: Application admin email (default: admin@couponmanager.app)
 * - PB_APP_ADMIN_PASSWORD: Application admin password (default: admin123)
 */

import { createCollections } from './pocketbase-create-remote-collections.mjs';
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

// Load .env.local first, then .env (local overrides remote)
dotenv.config({ path: '.env.local' });
dotenv.config();

// Clean the URL - remove trailing slashes and /_/ suffix
let PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
PB_URL = PB_URL.replace(/\/+$/, '').replace(/\/_+$/, '');

const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin12345';
const PB_APP_ADMIN_EMAIL = process.env.PB_APP_ADMIN_EMAIL || 'admin@couponmanager.app';

// Generate random password for app admin
const generatePassword = () => randomBytes(12).toString('hex');
let PB_APP_ADMIN_PASSWORD = generatePassword();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

console.log(`${colors.blue}PocketBase Deploy Script${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
console.log(`URL: ${PB_URL}`);
console.log(`App Admin: ${PB_APP_ADMIN_EMAIL}`);
console.log();

const pb = new PocketBase(PB_URL);

// ============ STEP 1: Authenticate ============
async function authenticate() {
  console.log(`${colors.blue}Step 1: Authenticating as admin...${colors.reset}`);

  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log(`${colors.green}✓ Authenticated${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Authentication failed: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}Make sure PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD are correct${colors.reset}`);
    return false;
  }
}

// ============ STEP 2: Create Collections ============
async function setupCollections() {
  console.log(`${colors.blue}Step 2: Creating collections...${colors.reset}`);
  await createCollections();
}

// ============ STEP 3: Create Application Admin User ============
async function createAppAdmin() {
  console.log(`${colors.blue}Step 3: Creating application admin user...${colors.reset}`);

  // Check if app admin user already exists
  try {
    const existing = await pb.collection('users').getList(1, 1, { 
      filter: `email="${PB_APP_ADMIN_EMAIL}"` 
    });
    if (existing.totalItems > 0) {
      console.log(`${colors.yellow}⚠ User already exists, checking role...${colors.reset}`);
      
      // Check if user has a role
      const userId = existing.items[0].id;
      try {
        const roles = await pb.collection('user_roles').getList(1, 1, {
          filter: `userId="${userId}"`
        });
        
        if (roles.totalItems === 0) {
          // Create role
          await pb.collection('user_roles').create({
            userId: userId,
            role: 'manager'
          });
          console.log(`${colors.green}✓ Assigned manager role${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠ Role already exists${colors.reset}`);
        }
      } catch (e) {
        console.log(`  ${colors.yellow}⚠ Could not check role: ${e.message}${colors.reset}`);
      }
      
      return true;
    }
  } catch {}

  // Create the application admin user
  console.log(`  Creating user...`);
  try {
    const user = await pb.collection('users').create({
      email: PB_APP_ADMIN_EMAIL,
      password: PB_APP_ADMIN_PASSWORD,
      passwordConfirm: PB_APP_ADMIN_PASSWORD,
      name: 'Application Admin',
      emailVisibility: true
    });
    console.log(`  ✓ User created`);
    
    // Create user role
    console.log(`  Creating role...`);
    await pb.collection('user_roles').create({
      userId: user.id,
      role: 'manager'
    });
    console.log(`  ✓ Manager role assigned`);
    
    console.log(`${colors.green}✓ Application admin user created!${colors.reset}`);
    console.log(`${colors.blue}  Email: ${PB_APP_ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.blue}  Password: ${PB_APP_ADMIN_PASSWORD}${colors.reset}`);
    
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to create application admin: ${error.message}${colors.reset}`);
    if (error.data) {
      console.error(`${colors.red}  Data: ${JSON.stringify(error.data)}${colors.reset}`);
    }
    return false;
  }
}

// ============ MAIN ============
async function main() {
  try {
    // Step 1: Authenticate
    const authOk = await authenticate();
    if (!authOk) {
      process.exit(1);
    }

    // Step 2: Create collections
    await setupCollections();

    // Step 3: Create app admin
    const adminOk = await createAppAdmin();
    if (!adminOk) {
      console.error(`${colors.red}✗ Application admin creation failed${colors.reset}`);
      process.exit(1);
    }

    console.log();
    console.log(`${colors.green}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.green}✓ PocketBase deployment complete!${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Deploy failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();

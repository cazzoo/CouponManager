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

// Generate random password for app admin (only when needed)
const generatePassword = () => randomBytes(12).toString('hex');
let PB_APP_ADMIN_PASSWORD = null;

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

  let userId = null;
  let userCreated = false;

  // Check if app admin user already exists
  try {
    const existing = await pb.collection('users').getList(1, 1, {
      filter: `email="${PB_APP_ADMIN_EMAIL}"`
    });
    if (existing.totalItems > 0) {
      console.log(`${colors.yellow}⚠ User already exists, using existing account${colors.reset}`);
      console.log(`${colors.gray}  (Keeping existing password)${colors.reset}`);
      userId = existing.items[0].id;
    }
  } catch (error) {
    console.log(`  ${colors.yellow}⚠ Could not check existing user: ${error.message}${colors.reset}`);
  }

  // Create the application admin user if it doesn't exist
  if (!userId) {
    console.log(`  Creating user...`);
    
    // Generate password only when creating a new user
    PB_APP_ADMIN_PASSWORD = generatePassword();
    try {
      // DEBUG: Log authentication state and user creation data
      console.log(`  ${colors.gray}DEBUG: Creating user with data:${colors.reset}`);
      console.log(`  ${colors.gray}DEBUG: email=${PB_APP_ADMIN_EMAIL}${colors.reset}`);
      console.log(`  ${colors.gray}DEBUG: password length=${PB_APP_ADMIN_PASSWORD.length}${colors.reset}`);
      console.log(`  ${colors.gray}DEBUG: pb.authStore.token exists=${!!pb.authStore.token}${colors.reset}`);
      console.log(`  ${colors.gray}DEBUG: Is admin authenticated=${pb.authStore.model && pb.authStore.model.collectionName === 'admins'}${colors.reset}`);

      const user = await pb.collection('users').create({
        email: PB_APP_ADMIN_EMAIL,
        password: PB_APP_ADMIN_PASSWORD,
        passwordConfirm: PB_APP_ADMIN_PASSWORD,
        name: 'Application Admin',
        emailVisibility: true
      });

      // DEBUG: Log created user structure
      console.log(`  ${colors.gray}DEBUG: User created with id=${user.id}${colors.reset}`);
      console.log(`  ${colors.gray}DEBUG: User has passwordHash field=${Object.prototype.hasOwnProperty.call(user, 'passwordHash')}${colors.reset}`);
      console.log(`  ${colors.gray}DEBUG: User has emailVisibility=${user.emailVisibility}${colors.reset}`);
      console.log(`  ${colors.gray}DEBUG: User fields=${Object.keys(user).filter(k => !k.startsWith('@')).join(', ')}${colors.reset}`);

      console.log(`  ✓ User created`);
      userId = user.id;
      userCreated = true;
    } catch (error) {
      console.error(`${colors.red}✗ Failed to create application admin: ${error.message}${colors.reset}`);
      if (error.data) {
        console.error(`${colors.red}  Data: ${JSON.stringify(error.data)}${colors.reset}`);
      }
      return false;
    }
  }

  // Ensure user has manager role
  console.log(`  Checking role...`);
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
      console.log(`  ✓ Manager role assigned`);
    } else {
      console.log(`  ✓ Manager role already exists`);
    }
  } catch (error) {
    console.log(`  ${colors.yellow}⚠ Could not check role: ${error.message}${colors.reset}`);
  }
  
  // Print success message
  if (userCreated) {
    console.log(`${colors.green}✓ Application admin user created!${colors.reset}`);
    console.log(`${colors.blue}  Email: ${PB_APP_ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.blue}  Password: ${PB_APP_ADMIN_PASSWORD}${colors.reset}`);
    console.log(`${colors.yellow}  ⚠ Save these credentials securely!${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Using existing application admin user${colors.reset}`);
    console.log(`${colors.blue}  Email: ${PB_APP_ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.gray}  Password: (existing password unchanged)${colors.reset}`);
  }
  
  return true;
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

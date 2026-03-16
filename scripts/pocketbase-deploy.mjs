#!/usr/bin/env node

/**
 * PocketBase Deploy Script - Idempotent setup for remote PocketBase
 * 
 * This script:
 * 1. Creates collections (using pb:create-collections:remote)
 * 2. Creates application admin user (if not exists)
 * 
 * Usage: pnpm pb:deploy
 * 
 * Environment variables:
 * - VITE_POCKETBASE_URL: URL of your PocketBase instance
 * - PB_ADMIN_EMAIL: Admin email (for PocketBase admin authentication)
 * - PB_ADMIN_PASSWORD: Admin password (for PocketBase admin authentication)
 * - PB_APP_ADMIN_EMAIL: Application admin email (default: admin@example.com)
 * - PB_APP_ADMIN_PASSWORD: Application admin password (default: admin12345)
 */

import { createCollections } from './pocketbase-create-remote-collections.mjs';
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

// Clean the URL - remove trailing slashes and /_/ suffix
let PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
PB_URL = PB_URL.replace(/\/+$/, '').replace(/\/_+$/, '');

const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin12345';
const PB_APP_ADMIN_EMAIL = process.env.PB_APP_ADMIN_EMAIL || 'admin@example.com';

// Generate random password for app admin
const generateRandomPassword = () => {
  return randomBytes(16).toString('hex');
};

const PB_APP_ADMIN_PASSWORD = generateRandomPassword();

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
console.log();

const pb = new PocketBase(PB_URL);

// ============ STEP 1: Create Collections ============
async function setupCollections() {
  console.log(`${colors.blue}Step 1: Creating collections...${colors.reset}`);
  await createCollections();
}

// ============ STEP 2: Create Application Admin User ============
async function createAppAdmin() {
  console.log(`${colors.blue}Step 2: Creating application admin user...${colors.reset}`);

  // First authenticate as PocketBase admin
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to authenticate as PocketBase admin${colors.reset}`);
    console.error(`${colors.yellow}Make sure PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD are correct${colors.reset}`);
    return false;
  }

  // Check if app admin user already exists
  try {
    const existing = await pb.collection('users').getList(1, 1, { 
      filter: `email="${PB_APP_ADMIN_EMAIL}"` 
    });
    if (existing.totalItems > 0) {
      console.log(`${colors.yellow}⚠ Application admin user already exists, skipping${colors.reset}`);
      return true;
    }
  } catch {}

  // Create the application admin user
  try {
    await pb.collection('users').create({
      email: PB_APP_ADMIN_EMAIL,
      password: PB_APP_ADMIN_PASSWORD,
      passwordConfirm: PB_APP_ADMIN_PASSWORD,
      name: 'Application Admin',
      emailVisibility: true,
      role: 'manager'
    });
    console.log(`${colors.green}✓ Created application admin user${colors.reset}`);
    console.log(`${colors.blue}Email: ${PB_APP_ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.blue}Password: ${PB_APP_ADMIN_PASSWORD}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Please change the password after first login!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to create application admin: ${error.message}${colors.reset}`);
    return false;
  }

  // Create user role for admin
  try {
    // Get the user ID
    const user = await pb.collection('users').getList(1, 1, { 
      filter: `email="${PB_APP_ADMIN_EMAIL}"` 
    });
    
    if (user.totalItems > 0) {
      const userId = user.items[0].id;
      
      try {
        await pb.collection('user_roles').create({
          userId: userId,
          role: 'manager'
        });
        console.log(`${colors.green}✓ Assigned manager role to admin user${colors.reset}`);
      } catch (roleError) {
        if (roleError.status === 400 && roleError.data?.data?.userId?.code === 'validation_not_unique') {
          console.log(`${colors.yellow}⚠ Role already exists for admin user${colors.reset}`);
        }
      }
    }
  } catch (error) {
    console.error(`${colors.yellow}⚠ Could not assign role: ${error.message}${colors.reset}`);
  }

  return true;
}

// ============ MAIN ============
async function main() {
  try {
    // Step 1: Create collections
    await setupCollections();

    // Step 2: Create application admin
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

#!/usr/bin/env node

/**
 * PocketBase Deploy Script - Uses migrations for setup
 * 
 * This script:
 * 1. Uses existing migration files from migrations/ directory
 * 2. Imports collections programmatically via PocketBase SDK
 * 3. Creates application admin user (if not exists)
 * 
 * Usage: pnpm pb:deploy
 * 
 * Environment variables:
 * - VITE_POCKETBASE_URL: URL of your PocketBase instance
 * - PB_ADMIN_EMAIL: Admin email (for PocketBase admin authentication)
 * - PB_ADMIN_PASSWORD: Admin password (for PocketBase admin authentication)
 * - PB_APP_ADMIN_EMAIL: Application admin email (default: admin@example.com)
 */

import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Clean the URL - remove trailing slashes and /_/ suffix
let PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
PB_URL = PB_URL.replace(/\/+$/, '').replace(/\/_+$/, '');

const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin12345';
const PB_APP_ADMIN_EMAIL = process.env.PB_APP_ADMIN_EMAIL || 'admin@example.com';

// Generate random password for app admin
const generateRandomPassword = () => randomBytes(16).toString('hex');
const PB_APP_ADMIN_PASSWORD = generateRandomPassword();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

console.log(`${colors.blue}PocketBase Deploy Script (Migration-based)${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
console.log(`URL: ${PB_URL}`);
console.log();

const pb = new PocketBase(PB_URL);

// ============ STEP 1: Authenticate ============
async function authenticate() {
  console.log(`${colors.blue}Authenticating as admin...${colors.reset}`);

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

// ============ STEP 2: Import Collections from Migrations ============
async function importCollections() {
  console.log(`${colors.blue}Importing collections from migrations...${colors.reset}`);

  const migrationsDir = join(__dirname, '..', 'migrations');
  const migrationFile = join(migrationsDir, '002_create_collections.js');

  if (!existsSync(migrationFile)) {
    console.error(`${colors.red}✗ Migration file not found: ${migrationFile}${colors.reset}`);
    return false;
  }

  try {
    // Read and execute the migration file
    // We need to extract the snapshot from the migration
    const migrationContent = readFileSync(migrationFile, 'utf-8');
    
    // Extract the snapshot array from the migration
    const snapshotMatch = migrationContent.match(/const snapshot = (\[[\s\S]*?\]);/);
    if (!snapshotMatch) {
      console.error(`${colors.red}✗ Could not parse migration file${colors.reset}`);
      return false;
    }

    // Evaluate the snapshot array safely
    const snapshot = eval('(' + snapshotMatch[1] + ')');
    
    console.log(`Found ${snapshot.length} collections in migration`);
    
    for (const collection of snapshot) {
      try {
        // Check if collection exists
        let existing;
        try {
          existing = await pb.collections.getOne(collection.name);
          console.log(`${colors.yellow}⚠ Collection '${collection.name}' exists, checking for updates...${colors.reset}`);
        } catch {
          // Doesn't exist, create it
          existing = await pb.collections.import(collection, false);
          console.log(`${colors.green}✓ Imported collection '${collection.name}'${colors.reset}`);
          continue;
        }

        // Collection exists - check if we need to update
        const existingFields = existing.schema || [];
        const newFields = collection.fields || [];
        
        // Find fields that don't exist
        const fieldsToAdd = newFields.filter(
          nf => !existingFields.find(ef => ef.name === nf.name)
        );

        if (fieldsToAdd.length > 0) {
          // Update collection with new fields
          await pb.collections.update(collection.name, {
            schema: [...existingFields, ...fieldsToAdd]
          });
          console.log(`  ${colors.green}✓ Added ${fieldsToAdd.length} new fields to '${collection.name}'${colors.reset}`);
        } else {
          console.log(`  ${colors.yellow}✓ Collection '${collection.name}' already up to date${colors.reset}`);
        }
      } catch (error) {
        console.error(`${colors.red}✗ Failed to import '${collection.name}': ${error.message}${colors.reset}`);
        if (error.data) {
          console.error(`${colors.gray}Error: ${JSON.stringify(error.data)}${colors.reset}`);
        }
      }
    }

    console.log(`${colors.green}✓ Collections imported successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to import collections: ${error.message}${colors.reset}`);
    return false;
  }
}

// ============ STEP 3: Add role field to users collection ============
async function addRoleToUsers() {
  console.log(`${colors.blue}Adding 'role' field to users collection...${colors.reset}`);

  try {
    const usersCol = await pb.collections.getOne('users');
    const currentFields = usersCol.schema || [];
    
    const roleFieldExists = currentFields.find(f => f.name === 'role');
    
    if (!roleFieldExists) {
      await pb.collections.update('users', {
        schema: [
          ...currentFields,
          {
            name: 'role',
            type: 'select',
            required: true,
            values: ['user', 'manager', 'demo']
          }
        ]
      });
      console.log(`${colors.green}✓ Added 'role' field to users${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ 'role' field already exists in users${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to add role field: ${error.message}${colors.reset}`);
    return false;
  }
}

// ============ STEP 4: Create Application Admin User ============
async function createAppAdmin() {
  console.log(`${colors.blue}Creating application admin user...${colors.reset}`);

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
  // Authenticate
  const authOk = await authenticate();
  if (!authOk) {
    process.exit(1);
  }

  // Import collections
  const collectionsOk = await importCollections();
  if (!collectionsOk) {
    console.error(`${colors.red}✗ Collections import failed${colors.reset}`);
    process.exit(1);
  }

  // Add role field to users
  await addRoleToUsers();

  // Create app admin
  const adminOk = await createAppAdmin();
  if (!adminOk) {
    console.error(`${colors.red}✗ Application admin creation failed${colors.reset}`);
    process.exit(1);
  }

  console.log();
  console.log(`${colors.green}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.green}✓ PocketBase deployment complete!${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
}

main();

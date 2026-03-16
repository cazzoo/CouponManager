#!/usr/bin/env node

/**
 * Script to create collections on a remote PocketBase instance
 * Usage: pnpm pb:create-collections:remote
 * 
 * This works with remote PocketBase (PocketHost) - no local binary needed
 */

import PocketBase from 'pocketbase';
import dotenv from 'dotenv';

dotenv.config();

const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin12345';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function createCollections() {
  // Clean the URL - remove trailing slashes and /_/ suffix
  let pbUrl = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
  pbUrl = pbUrl.replace(/\/+$/, '').replace(/\/_+$/, '');
  
  console.log(`${colors.blue}Creating collections on remote PocketBase...${colors.reset}`);
  console.log(`URL: ${pbUrl}`);
  console.log();

  const pb = new PocketBase(pbUrl);

  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log(`${colors.green}✓ Authenticated as admin${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to authenticate:${colors.reset}`, error.message);
    console.log(`${colors.yellow}Make sure:${colors.reset}`);
    console.log(`  1. VITE_POCKETBASE_URL is set to the base URL (without /_/ )`);
    console.log(`  2. PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD are correct`);
    console.log(`  3. Admin user exists in PocketBase`);
    process.exit(1);
  }

  // Get the users collection ID
  let usersCollectionId;
  try {
    const usersCol = await pb.collections.getOne('users');
    usersCollectionId = usersCol.id;
    console.log(`${colors.green}✓ Found users collection: ${usersCollectionId}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Users collection not found${colors.reset}`);
    process.exit(1);
  }

  const collections = [
    {
      name: 'user_roles',
      type: 'base',
      schema: [
        { name: 'userId', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: false },
        { name: 'role', type: 'select', required: true, values: ['user', 'manager', 'demo'] }
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && (userId = @request.auth.id || @request.auth.data.role = \'manager\')',
      deleteRule: '@request.auth.id != "" && @request.auth.data.role = \'manager\''
    },
    {
      name: 'retailers',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'userId', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: false }
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""'
    },
    {
      name: 'coupons',
      type: 'base',
      schema: [
        { name: 'retailer', type: 'text', required: true },
        { name: 'initialValue', type: 'text', required: true },
        { name: 'currentValue', type: 'text', required: true },
        { name: 'userId', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: false },
        { name: 'expirationDate', type: 'date', required: false },
        { name: 'notes', type: 'text', required: false },
        { name: 'barcode', type: 'text', required: false },
        { name: 'reference', type: 'text', required: false },
        { name: 'activationCode', type: 'text', required: false },
        { name: 'pin', type: 'text', required: false }
      ],
      listRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')',
      viewRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')',
      createRule: '@request.auth.id != ""',
      updateRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')',
      deleteRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')'
    }
  ];

  for (const collection of collections) {
    try {
      // Check if collection exists
      let existingCollection;
      try {
        existingCollection = await pb.collections.getOne(collection.name);
        console.log(`${colors.yellow}⚠ Collection '${collection.name}' exists, updating schema...${colors.reset}`);
      } catch {
        // Collection doesn't exist, create it
        existingCollection = await pb.collections.create(collection);
        console.log(`${colors.green}✓ Created collection '${collection.name}'${colors.reset}`);
      }

      // Now update the collection schema if needed
      // Get current fields
      const currentFields = existingCollection.schema || [];
      const newFields = collection.schema;

      // Check if fields need to be added
      const fieldsToAdd = newFields.filter(
        newField => !currentFields.find(f => f.name === newField.name)
      );

      if (fieldsToAdd.length > 0) {
        console.log(`  Adding ${fieldsToAdd.length} fields to '${collection.name}'...`);
        
        // Update with new fields
        await pb.collections.update(collection.name, {
          schema: [...currentFields, ...fieldsToAdd],
          listRule: collection.listRule,
          viewRule: collection.viewRule,
          createRule: collection.createRule,
          updateRule: collection.updateRule,
          deleteRule: collection.deleteRule
        });
        console.log(`  ${colors.green}✓ Updated schema for '${collection.name}'${colors.reset}`);
      } else {
        console.log(`  ${colors.green}✓ Schema already up to date for '${collection.name}'${colors.reset}`);
      }

    } catch (error) {
      console.error(`${colors.red}✗ Failed to create/update '${collection.name}':${colors.reset}`, error.message);
      if (error.data) {
        console.error(`${colors.gray}Error data: ${JSON.stringify(error.data)}${colors.reset}`);
      }
    }
  }

  console.log();
  console.log(`${colors.green}✓ Collections setup complete!${colors.reset}`);
  console.log();
}

createCollections();

export { createCollections };

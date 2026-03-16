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
    console.log(`  2. PB_ADMIN_ADMIN_EMAIL and PB_ADMIN_PASSWORD are correct`);
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

  // Collection definitions - rules will be set AFTER schema is created
  const collections = [
    {
      name: 'user_roles',
      schema: [
        { name: 'userId', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: false },
        { name: 'role', type: 'select', required: true, values: ['user', 'manager', 'demo'] }
      ],
      // Rules that reference userId - will be set after schema creation
      rules: {
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != "" && @request.auth.data.role = \'manager\''
      }
    },
    {
      name: 'retailers',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'userId', type: 'relation', required: true, collectionId: usersCollectionId, cascadeDelete: false }
      ],
      rules: {
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""'
      }
    },
    {
      name: 'coupons',
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
      rules: {
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""'
      }
    }
  ];

  for (const coll of collections) {
    try {
      // Check if collection exists
      let existingCollection;
      try {
        existingCollection = await pb.collections.getOne(coll.name);
        console.log(`${colors.yellow}⚠ Collection '${coll.name}' exists, checking schema...${colors.reset}`);
      } catch {
        // Collection doesn't exist - create it FIRST without rules
        console.log(`Creating collection '${coll.name}' (without rules first)...`);
        existingCollection = await pb.collections.create({
          name: coll.name,
          type: 'base',
          schema: coll.schema,
          listRule: null,
          viewRule: null,
          createRule: null,
          updateRule: null,
          deleteRule: null
        });
        console.log(`${colors.green}✓ Created collection '${coll.name}'${colors.reset}`);
      }

      // Now add/update fields that are missing
      const currentFields = existingCollection.schema || [];
      const newFields = coll.schema;

      const fieldsToAdd = newFields.filter(
        newField => !currentFields.find(f => f.name === newField.name)
      );

      if (fieldsToAdd.length > 0) {
        console.log(`  Adding ${fieldsToAdd.length} fields to '${coll.name}'...`);
        
        // Update with new fields
        await pb.collections.update(coll.name, {
          schema: [...currentFields, ...fieldsToAdd]
        });
        console.log(`  ${colors.green}✓ Added fields to '${coll.name}'${colors.reset}`);
      }

      // Now update the rules (they can reference the fields now)
      console.log(`  Updating rules for '${coll.name}'...`);
      await pb.collections.update(coll.name, {
        listRule: coll.rules.listRule,
        viewRule: coll.rules.viewRule,
        createRule: coll.rules.createRule,
        updateRule: coll.rules.updateRule,
        deleteRule: coll.rules.deleteRule
      });
      console.log(`  ${colors.green}✓ Updated rules for '${coll.name}'${colors.reset}`);

    } catch (error) {
      console.error(`${colors.red}✗ Failed to process '${coll.name}':${colors.reset}`, error.message);
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

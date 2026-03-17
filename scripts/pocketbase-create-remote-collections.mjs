#!/usr/bin/env node

/**
 * Script to create collections on a remote PocketBase instance
 * Usage: pnpm pb:create-collections:remote
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

let hasError = false;

async function createCollections() {
  let pbUrl = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
  pbUrl = pbUrl.replace(/\/+$/, '').replace(/\/_+$/, '');
  
  console.log(`${colors.blue}Creating collections on remote PocketBase...${colors.reset}`);
  console.log(`URL: ${pbUrl}`);
  console.log();

  const pb = new PocketBase(pbUrl);

  // Authenticate as admin
  console.log(`${colors.blue}Authenticating...${colors.reset}`);
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  console.log(`${colors.green}✓ Authenticated${colors.reset}`);

  // Get users collection ID
  const usersCol = await pb.collections.getOne('users');
  const usersCollectionId = usersCol.id;
  console.log(`  Users ID: ${usersCollectionId}`);

  const collections = [
    {
      name: 'user_roles',
      fields: [
        { name: 'userId', type: 'relation', required: true, options: { collectionId: usersCollectionId, cascadeDelete: false } },
        { name: 'role', type: 'select', required: true, options: { values: ['user', 'manager', 'demo'] } }
      ],
      rules: { listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: '' }
    },
    {
      name: 'retailers',
      fields: [
        { name: 'name', type: 'text', required: true, options: { min: 1, max: 100 } },
        { name: 'userId', type: 'relation', required: true, options: { collectionId: usersCollectionId, cascadeDelete: false } }
      ],
      rules: { listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: '' }
    },
    {
      name: 'coupons',
      fields: [
        { name: 'retailer', type: 'text', required: true, options: { min: 1, max: 100 } },
        { name: 'initialValue', type: 'text', required: true, options: { min: 0, max: 50 } },
        { name: 'currentValue', type: 'text', required: true, options: { min: 0, max: 50 } },
        { name: 'userId', type: 'relation', required: true, options: { collectionId: usersCollectionId, cascadeDelete: false } },
        { name: 'expirationDate', type: 'date', required: false },
        { name: 'notes', type: 'editor', required: false },
        { name: 'barcode', type: 'text', required: false, options: { min: 0, max: 200 } },
        { name: 'reference', type: 'text', required: false, options: { min: 0, max: 100 } },
        { name: 'activationCode', type: 'text', required: false, options: { min: 0, max: 50 } },
        { name: 'pin', type: 'text', required: false, options: { min: 0, max: 10 } }
      ],
      rules: { listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: '' }
    }
  ];

  for (const coll of collections) {
    console.log(`\n${colors.blue}Processing ${coll.name}...${colors.reset}`);
    
    // Check if collection exists with data
    try {
      const existing = await pb.collections.getOne(coll.name);
      console.log(`  Collection exists, checking for data...`);
      
      // Check if there's data in the collection
      try {
        const records = await pb.collection(coll.name).getList(1, 1);
        if (records.totalItems > 0) {
          console.log(`  ${colors.yellow}⚠ Collection has ${records.totalItems} records - skipping${colors.reset}`);
          continue;
        }
      } catch {
        // No records
      }
      
      // Delete empty collection
      await pb.collections.delete(coll.name);
      console.log(`  Deleted existing (empty)`);
    } catch {
      // Collection doesn't exist
    }

    // Create new
    try {
      const newCol = await pb.collections.create({
        name: coll.name,
        type: 'base',
        schema: coll.fields,
        listRule: coll.rules.listRule,
        viewRule: coll.rules.viewRule,
        createRule: coll.rules.createRule,
        updateRule: coll.rules.updateRule,
        deleteRule: coll.rules.deleteRule
      });
      console.log(`  ${colors.green}✓ Created${colors.reset}`);
      console.log(`  Schema: ${newCol.schema?.map(f => f.name).join(', ') || '(none)'}`);
    } catch (e) {
      console.log(`  ${colors.red}✗ Error: ${e.message}${colors.reset}`);
      if (e.data) console.log(`  Data: ${JSON.stringify(e.data)}`);
      hasError = true;
    }
  }

  if (hasError) {
    console.log(`\n${colors.red}✗ Collection setup failed${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.green}✓ Collections setup complete!${colors.reset}`);
}

createCollections().catch(e => {
  console.error(`${colors.red}Fatal: ${e.message}${colors.reset}`);
  process.exit(1);
});

export { createCollections };

#!/usr/bin/env node

/**
 * Script to create collections on a remote PocketBase instance
 * Usage: pnpm pb:create-collections:remote
 * 
 * Uses PocketBase SDK's import() method to create collections with fields
 */

import PocketBase from 'pocketbase';
import dotenv from 'dotenv';

// Load .env.local first, then .env (local overrides remote)
dotenv.config({ path: '.env.local' });
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
  console.log(`Admin: ${PB_ADMIN_EMAIL}`);
  console.log();

  const pb = new PocketBase(pbUrl);

  // Authenticate as admin
  console.log(`${colors.blue}Authenticating...${colors.reset}`);
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log(`${colors.green}✓ Authenticated${colors.reset}`);
  } catch (e) {
    console.error(`${colors.red}✗ Auth failed: ${e.message}${colors.reset}`);
    if (e.response) {
      console.error(`  Response: ${JSON.stringify(e.response)}`);
    }
    throw e;
  }

  // Get users collection ID for relation fields
  const usersCol = await pb.collections.getOne('users');
  const usersCollectionId = usersCol.id;
  console.log(`  Users ID: ${usersCollectionId}`);

  // Ensure users collection has the role field
  console.log(`${colors.blue}Checking users collection for role field...${colors.reset}`);
  const hasRoleField = usersCol.fields.some(f => f.name === 'role');
  if (!hasRoleField) {
    console.log(`  ${colors.yellow}⚠ Role field missing from users collection - adding it${colors.reset}`);
    try {
      await pb.collections.update('users', {
        ...usersCol,
        fields: [
          ...usersCol.fields,
          {
            id: 'text_users_role',
            name: 'role',
            type: 'text',
            required: false,
            system: false,
            presentable: false
          }
        ]
      });
      console.log(`  ${colors.green}✓ Role field added to users collection${colors.reset}`);
    } catch (e) {
      console.log(`  ${colors.red}✗ Failed to add role field: ${e.message}${colors.reset}`);
    }
  } else {
    console.log(`  ${colors.green}✓ Role field exists on users collection${colors.reset}`);
  }

  // Define collections using PocketBase import format (with field IDs)
  const collectionsData = [
    {
      name: 'user_roles',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          id: 'relation_user_roles_userId',
          name: 'userId',
          type: 'relation',
          required: true,
          system: false,
          collectionId: usersCollectionId,
          cascadeDelete: false,
          maxSelect: 1,
          presentable: false
        },
        {
          id: 'select_user_roles_role',
          name: 'role',
          type: 'select',
          required: true,
          system: false,
          values: ['user', 'manager', 'demo'],
          presentable: false
        }
      ],
      indexes: [],
      system: false
    },
    {
      name: 'retailers',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          id: 'text_retailers_name',
          name: 'name',
          type: 'text',
          required: true,
          system: false,
          min: 1,
          max: 100,
          presentable: false
        },
        {
          id: 'relation_retailers_userId',
          name: 'userId',
          type: 'relation',
          required: true,
          system: false,
          collectionId: usersCollectionId,
          cascadeDelete: false,
          maxSelect: 1,
          presentable: false
        }
      ],
      indexes: [],
      system: false
    },
    {
      name: 'coupons',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          id: 'text_coupons_retailer',
          name: 'retailer',
          type: 'text',
          required: true,
          system: false,
          min: 1,
          max: 100,
          presentable: false
        },
        {
          id: 'text_coupons_initialValue',
          name: 'initialValue',
          type: 'text',
          required: true,
          system: false,
          min: 0,
          max: 50,
          presentable: false
        },
        {
          id: 'text_coupons_currentValue',
          name: 'currentValue',
          type: 'text',
          required: true,
          system: false,
          min: 0,
          max: 50,
          presentable: false
        },
        {
          id: 'relation_coupons_userId',
          name: 'userId',
          type: 'relation',
          required: true,
          system: false,
          collectionId: usersCollectionId,
          cascadeDelete: false,
          maxSelect: 1,
          presentable: false
        },
        {
          id: 'date_coupons_expirationDate',
          name: 'expirationDate',
          type: 'date',
          required: false,
          system: false,
          presentable: false
        },
        {
          id: 'editor_coupons_notes',
          name: 'notes',
          type: 'editor',
          required: false,
          system: false,
          presentable: false
        },
        {
          id: 'text_coupons_barcode',
          name: 'barcode',
          type: 'text',
          required: false,
          system: false,
          min: 0,
          max: 200,
          presentable: false
        },
        {
          id: 'text_coupons_reference',
          name: 'reference',
          type: 'text',
          required: false,
          system: false,
          min: 0,
          max: 100,
          presentable: false
        },
        {
          id: 'text_coupons_activationCode',
          name: 'activationCode',
          type: 'text',
          required: false,
          system: false,
          min: 0,
          max: 50,
          presentable: false
        },
        {
          id: 'text_coupons_pin',
          name: 'pin',
          type: 'text',
          required: false,
          system: false,
          min: 0,
          max: 10,
          presentable: false
        }
      ],
      indexes: [],
      system: false
    }
  ];

  // Check existing collections and their data
  console.log(`${colors.blue}Checking existing collections...${colors.reset}`);
  for (const coll of collectionsData) {
    try {
      const existing = await pb.collections.getOne(coll.name);
      console.log(`  ${coll.name}: exists with ${existing.fields?.filter(f => !f.system).length || 0} fields`);
      
      // Check for data
      try {
        const records = await pb.collection(coll.name).getList(1, 1);
        if (records.totalItems > 0) {
          console.log(`    ${colors.yellow}⚠ Has ${records.totalItems} records - will preserve${colors.reset}`);
          // Mark to skip this collection
          coll._skip = true;
        } else {
          // Delete empty collection for recreation
          await pb.collections.delete(coll.name);
          console.log(`    Deleted (empty)`);
        }
      } catch {
        // No records
      }
    } catch {
      // Collection doesn't exist
      console.log(`  ${coll.name}: doesn't exist`);
    }
  }

  // Import collections
  console.log(`\n${colors.blue}Importing collections...${colors.reset}`);
  const collectionsToImport = collectionsData.filter(c => !c._skip);
  
  if (collectionsToImport.length > 0) {
    try {
      await pb.collections.import(collectionsToImport);
      console.log(`${colors.green}✓ Collections imported successfully${colors.reset}`);
    } catch (e) {
      console.log(`${colors.red}✗ Import failed: ${e.message}${colors.reset}`);
      hasError = true;
    }
  } else {
    console.log(`${colors.yellow}⚠ All collections have data - skipping import${colors.reset}`);
  }

  // Verify created collections
  console.log(`\n${colors.blue}Verifying collections...${colors.reset}`);
  for (const coll of collectionsData) {
    try {
      const result = await pb.collections.getOne(coll.name);
      const customFields = result.fields?.filter(f => !f.system) || [];
      console.log(`  ${coll.name}: ${customFields.map(f => f.name).join(', ')}`);
      
      if (customFields.length === 0 && !coll._skip) {
        console.log(`    ${colors.yellow}⚠ Warning: No fields!${colors.reset}`);
        hasError = true;
      }
    } catch (e) {
      console.log(`  ${coll.name}: ${colors.red}✗ Error: ${e.message}${colors.reset}`);
      hasError = true;
    }
  }

  if (hasError) {
    console.log(`\n${colors.red}✗ Collection setup failed${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.green}✓ Collections setup complete!${colors.reset}`);
}

export { createCollections };

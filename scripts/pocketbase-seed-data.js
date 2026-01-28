#!/usr/bin/env node

import PocketBase from 'pocketbase';
import dotenv from 'dotenv';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

console.log(`${colors.blue}PocketBase Data Seeding${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

async function createTestUsers() {
  console.log(`${colors.blue}Creating test users...${colors.reset}`);

  const testUsers = [
    {
      email: 'user@example.com',
      password: 'pass123',
      passwordConfirm: 'pass123',
      name: 'Regular User',
      emailVisibility: true
    },
    {
      email: 'manager@example.com',
      password: 'pass123',
      passwordConfirm: 'pass123',
      name: 'Manager User',
      emailVisibility: true
    },
    {
      email: 'another@example.com',
      password: 'pass123',
      passwordConfirm: 'pass123',
      name: 'Another User',
      emailVisibility: true
    }
  ];

  const pb = new PocketBase(PB_URL);
  const userIds = [];

  for (const userData of testUsers) {
    try {
      const user = await pb.collection('_users').create({
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.passwordConfirm,
        name: userData.name,
        emailVisibility: userData.emailVisibility
      });

      userIds.push({ email: userData.email, id: user.id });
      console.log(`${colors.green}✓ Created user: ${userData.email}${colors.reset}`);
    } catch (error) {
      if (error.status === 400 && error.data?.email) {
        console.log(`${colors.yellow}✓ User already exists: ${userData.email}${colors.reset}`);

        const existing = await pb.collection('_users').getList(1, 1, {
          filter: `email = "${userData.email}"`
        });

        if (existing.items.length > 0) {
          userIds.push({ email: userData.email, id: existing.items[0].id });
        }
      } else {
        console.error(`${colors.red}✗ Error creating user ${userData.email}: ${error.message}${colors.reset}`);
      }
    }
  }

  return userIds;
}

async function assignUserRoles(userIds) {
  console.log(`${colors.blue}Assigning user roles...${colors.reset}`);

  const pb = new PocketBase(PB_URL);

  const roleMap = {
    'user@example.com': 'user',
    'manager@example.com': 'manager',
    'another@example.com': 'user'
  };

  for (const userData of userIds) {
    const role = roleMap[userData.email] || 'user';

    try {
      await pb.collection('user_roles').create({
        userId: userData.id,
        role
      });
      console.log(`${colors.green}✓ Assigned role '${role}' to ${userData.email}${colors.reset}`);
    } catch (error) {
      if (error.status === 400) {
        console.log(`${colors.yellow}✓ Role already exists for ${userData.email}${colors.reset}`);
      } else {
        console.error(`${colors.red}✗ Error assigning role: ${error.message}${colors.reset}`);
      }
    }
  }
}

async function seedCoupons(userIds) {
  console.log(`${colors.blue}Seeding coupons...${colors.reset}`);

  const pb = new PocketBase(PB_URL);

  const couponTemplates = [
    {
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: new Date('2024-12-31').toISOString(),
      activationCode: 'AMZN2024',
      pin: '1234',
      notes: 'Birthday gift from Mom'
    },
    {
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '75',
      expirationDate: new Date('2024-06-30').toISOString(),
      activationCode: 'AMZN100SUMMER',
      pin: '5678',
      notes: 'Used $25 for headphones'
    },
    {
      retailer: 'Target',
      initialValue: '75',
      currentValue: '75',
      expirationDate: new Date('2024-09-30').toISOString(),
      activationCode: 'TGT75FALL',
      pin: '4321',
      notes: 'Christmas gift from Dad'
    },
    {
      retailer: 'Walmart',
      initialValue: '150',
      currentValue: '150',
      expirationDate: new Date('2024-08-15').toISOString(),
      activationCode: 'WMT150AUG',
      pin: '7890',
      notes: 'Anniversary gift'
    },
    {
      retailer: 'Best Buy',
      initialValue: '200',
      currentValue: '200',
      expirationDate: new Date('2024-10-15').toISOString(),
      activationCode: 'BB200OCT',
      pin: '1357',
      notes: 'Saving for a new laptop'
    },
    {
      retailer: 'Starbucks',
      initialValue: '25',
      currentValue: '10',
      expirationDate: new Date('2024-05-15').toISOString(),
      activationCode: 'SBUX25MAY',
      pin: '2468',
      notes: 'Morning coffee fund'
    },
    {
      retailer: 'iTunes',
      initialValue: '30',
      currentValue: '30',
      expirationDate: new Date('2024-11-30').toISOString(),
      activationCode: 'ITUNES30NOV',
      pin: '9876',
      notes: 'For new music releases'
    }
  ];

  let couponCount = 0;

  for (const couponTemplate of couponTemplates) {
    const userIndex = couponCount % userIds.length;
    const userId = userIds[userIndex].id;

    try {
      await pb.collection('coupons').create({
        ...couponTemplate,
        userId
      });
      couponCount++;
      console.log(`${colors.green}✓ Created coupon #${couponCount} for ${userIds[userIndex].email}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Error creating coupon: ${error.message}${colors.reset}`);
    }
  }
}

async function main() {
  try {
    console.log(`${colors.yellow}Prerequisites check:${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

    const pb = new PocketBase(PB_URL);

    try {
      const health = await pb.health.check();
      console.log(`${colors.green}✓ PocketBase is running at ${PB_URL}${colors.reset}`);
      console.log(`${colors.gray}Version: ${health.code}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Cannot connect to PocketBase at ${PB_URL}${colors.reset}`);
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
      console.log();
      console.log(`${colors.yellow}Please start PocketBase first:${colors.reset}`);
      console.log(`${colors.gray}  pnpm pb:start${colors.reset}`);
      console.log(`${colors.gray}Or download and run PocketBase:${colors.reset}`);
      console.log(`${colors.gray}  https://pocketbase.io/docs/${colors.reset}`);
      console.log();
      process.exit(1);
      return;
    }

    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

    console.log(`${colors.yellow}Checking if collections exist...${colors.reset}`);

    let collectionsExist = true;
    try {
      await pb.collection('coupons').getList(1, 1);
      console.log(`${colors.green}✓ 'coupons' collection exists${colors.reset}`);
    } catch (error) {
      if (error.status === 404) {
        console.log(`${colors.red}✗ 'coupons' collection NOT found${colors.reset}`);
        collectionsExist = false;
      } else {
        console.error(`${colors.red}✗ Error checking 'coupons': ${error.message}${colors.reset}`);
        process.exit(1);
        return;
      }
    }

    try {
      await pb.collection('user_roles').getList(1, 1);
      console.log(`${colors.green}✓ 'user_roles' collection exists${colors.reset}`);
    } catch (error) {
      if (error.status === 404) {
        console.log(`${colors.red}✗ 'user_roles' collection NOT found${colors.reset}`);
        collectionsExist = false;
      } else {
        console.error(`${colors.red}✗ Error checking 'user_roles': ${error.message}${colors.reset}`);
        process.exit(1);
        return;
      }
    }

    if (!collectionsExist) {
      console.log();
      console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
      console.log(`${colors.red}✗ Collections not found!${colors.reset}`);
      console.log(`${colors.yellow}Please create collections first:${colors.reset}`);
      console.log();
      console.log(`${colors.gray}Option A: Manual (Recommended)${colors.reset}`);
      console.log(`${colors.gray}  Run: ${colors.blue}pnpm pb:create-collections${colors.reset}`);
      console.log(`${colors.gray}  Then create in Admin UI: ${PB_URL}/_/${colors.reset}`);
      console.log();
      console.log(`${colors.gray}  Or see: ${colors.blue}docs/pocketbase-setup.md${colors.reset}`);
      console.log();
      console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
      process.exit(1);
      return;
    }

    console.log();

    const userIds = await createTestUsers();
    console.log();

    await assignUserRoles(userIds);
    console.log();

    await seedCoupons(userIds);
    console.log();

    console.log(`${colors.green}✓ Data seeding complete!${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

    console.log(`${colors.yellow}Test Credentials:${colors.reset}`);
    console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

    const users = [
      { email: 'user@example.com', password: 'pass123', role: 'user' },
      { email: 'manager@example.com', password: 'pass123', role: 'manager' },
      { email: 'another@example.com', password: 'pass123', role: 'user' }
    ];

    users.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

    console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
    console.log(`${colors.yellow}Note: You can now test the application with these credentials.${colors.reset}`);
    console.log();
  } catch (error) {
    console.error(`${colors.red}Error during seeding: ${error.message}${colors.reset}`);
    console.log();
    console.log(`${colors.yellow}Make sure PocketBase is running: pnpm pb:start${colors.reset}`);
    process.exit(1);
  }
}

main();
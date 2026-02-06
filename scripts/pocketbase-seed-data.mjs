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
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

console.log(`${colors.blue}PocketBase Data Seeding${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

// Helper function to create dates relative to now
function createDateFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function fixPermissions(pb) {
  console.log(`${colors.blue}Fixing collection permissions...${colors.reset}`);

  try {
    await pb.collections.update('user_roles', {
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && (userId = @request.auth.id || @request.auth.data.role = \'manager\')',
      deleteRule: '@request.auth.id != "" && @request.auth.data.role = \'manager\''
    });
    console.log(`${colors.green}✓ Updated user_roles collection rules${colors.reset}`);

    await pb.collections.update('coupons', {
      listRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')',
      viewRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')',
      updateRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')',
      deleteRule: '(userId = @request.auth.id) || (@request.auth.data.role = \'manager\')'
    });
    console.log(`${colors.green}✓ Updated coupons collection rules${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to fix permissions: ${error.message}${colors.reset}`);
    if (error.data) {
      console.error(`${colors.gray}Error data: ${JSON.stringify(error.data, null, 2)}${colors.reset}`);
    }
    throw error;
  }
}

async function createTestUsers(pb) {
  console.log(`${colors.blue}Creating test users...${colors.reset}`);

  const testUsers = [
    {
      email: 'user@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Regular User',
      emailVisibility: true,
      role: 'user'
    },
    {
      email: 'manager@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Manager User',
      emailVisibility: true,
      role: 'manager'
    },
    {
      email: 'another@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Another User',
      emailVisibility: true,
      role: 'user'
    },
    {
      email: 'demo@example.com',
      password: 'demo12345',
      passwordConfirm: 'demo12345',
      name: 'Demo User',
      emailVisibility: true,
      role: 'demo'
    },
    {
      email: 'test4@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Test User 4',
      emailVisibility: true,
      role: 'user'
    }
  ];

  const userIds = [];

  for (const userData of testUsers) {
    try {
      const user = await pb.collection('users').create({
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.passwordConfirm,
        name: userData.name,
        emailVisibility: userData.emailVisibility,
        role: userData.role
      });

      userIds.push({ email: userData.email, id: user.id });
      console.log(`${colors.green}✓ Created user: ${userData.email}${colors.reset}`);
    } catch (error) {
      if (error.status === 400 && error.data?.data?.email?.code === 'validation_not_unique') {
        console.log(`${colors.yellow}✓ User already exists: ${userData.email}${colors.reset}`);

        const existing = await pb.collection('users').getList(1, 1, {
          filter: `email = "${userData.email}"`
        });

        if (existing.items.length > 0) {
          userIds.push({ email: userData.email, id: existing.items[0].id });
        }
      } else {
        console.error(`${colors.red}✗ Error creating user ${userData.email}: ${error.message}${colors.reset}`);
        if (error.data) {
          console.error(`${colors.gray}  Details: ${JSON.stringify(error.data, null, 2)}${colors.reset}`);
        }
      }
    }
  }

  return userIds;
}

async function seedRetailers(pb) {
  console.log(`${colors.blue}Seeding retailers...${colors.reset}`);

  const retailers = [
    {
      name: 'Amazon',
      website: 'https://www.amazon.com'
    },
    {
      name: 'Target',
      website: 'https://www.target.com'
    },
    {
      name: 'Walmart',
      website: 'https://www.walmart.com'
    },
    {
      name: 'Best Buy',
      website: 'https://www.bestbuy.com'
    },
    {
      name: 'Starbucks',
      website: 'https://www.starbucks.com'
    },
    {
      name: 'iTunes',
      website: 'https://www.apple.com/itunes'
    },
    {
      name: 'Netflix',
      website: 'https://www.netflix.com'
    },
    {
      name: 'Uber Eats',
      website: 'https://www.ubereats.com'
    },
    {
      name: 'Sephora',
      website: 'https://www.sephora.com'
    },
    {
      name: 'Nike',
      website: 'https://www.nike.com'
    }
  ];

  for (const retailer of retailers) {
    try {
      await pb.collection('retailers').create(retailer);
      console.log(`${colors.green}✓ Created retailer: ${retailer.name}${colors.reset}`);
    } catch (error) {
      if (error.status === 400 && error.data?.data?.name?.code === 'validation_not_unique') {
        console.log(`${colors.yellow}✓ Retailer already exists: ${retailer.name}${colors.reset}`);
      } else {
        console.error(`${colors.red}✗ Error creating retailer ${retailer.name}: ${error.message}${colors.reset}`);
        if (error.data) {
          console.error(`${colors.gray}  Details: ${JSON.stringify(error.data, null, 2)}${colors.reset}`);
        }
      }
    }
  }
}

async function assignUserRoles(pb, userIds) {
  console.log(`${colors.blue}Assigning user roles...${colors.reset}`);

  const roleMap = {
    'user@example.com': 'user',
    'manager@example.com': 'manager',
    'another@example.com': 'user',
    'demo@example.com': 'demo',
    'test4@example.com': 'user'
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
      if (error.status === 400 && error.data?.data?.userId?.code === 'validation_not_unique') {
        console.log(`${colors.yellow}✓ Role already exists for ${userData.email}${colors.reset}`);
      } else {
        console.error(`${colors.red}✗ Error assigning role: ${error.message}${colors.reset}`);
      }
    }
  }
}

async function seedCoupons(pb, userIds) {
  console.log(`${colors.blue}Seeding coupons...${colors.reset}`);

  // Create a map from email to userId for easy lookup
  const userMap = new Map(userIds.map(u => [u.email, u.id]));

  // Define which email gets how many coupons and their ranges
  const couponDistribution = [
    { email: 'user@example.com', start: 1, end: 8 },
    { email: 'manager@example.com', start: 9, end: 15 },
    { email: 'another@example.com', start: 16, end: 20 },
    { email: 'demo@example.com', start: 27, end: 29 },
    { email: 'test4@example.com', start: 21, end: 35 }
  ];

  // Diverse coupon templates with dynamic dates
  const couponTemplates = [
    // Active coupons (expiring in the future)
    {
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '100',
      expirationDate: createDateFromNow(60), // 60 days from now
      activationCode: 'AMZN100',
      pin: '1234',
      notes: 'Birthday gift - plenty of time to use!'
    },
    {
      retailer: 'Target',
      initialValue: '50',
      currentValue: '50',
      expirationDate: createDateFromNow(45), // 45 days from now
      activationCode: 'TGT50',
      pin: '2345',
      notes: 'Target run gift card'
    },
    {
      retailer: 'Best Buy',
      initialValue: '200',
      currentValue: '200',
      expirationDate: createDateFromNow(90), // 90 days from now
      activationCode: 'BBY200',
      pin: '3456',
      notes: 'Saving for new electronics'
    },
    {
      retailer: 'Netflix',
      initialValue: '30',
      currentValue: '30',
      expirationDate: createDateFromNow(30), // 30 days from now
      activationCode: 'NFLX30',
      pin: '4567',
      notes: 'Monthly subscription gift'
    },
    {
      retailer: 'Starbucks',
      initialValue: '25',
      currentValue: '25',
      expirationDate: createDateFromNow(20), // 20 days from now
      activationCode: 'SBUX25',
      pin: '5678',
      notes: 'Coffee fund for the month'
    },

    // Expiring soon (within next 7 days) - URGENT!
    {
      retailer: 'Walmart',
      initialValue: '75',
      currentValue: '75',
      expirationDate: createDateFromNow(3), // 3 days from now
      activationCode: 'WMT75',
      pin: '6789',
      notes: 'EXPIRING SOON! Use this weekend'
    },
    {
      retailer: 'Uber Eats',
      initialValue: '40',
      currentValue: '40',
      expirationDate: createDateFromNow(5), // 5 days from now
      activationCode: 'UBEREATS40',
      pin: '7890',
      notes: 'Weekend dinner delivery - expires soon!'
    },
    {
      retailer: 'iTunes',
      initialValue: '15',
      currentValue: '15',
      expirationDate: createDateFromNow(2), // 2 days from now
      activationCode: 'ITUNES15',
      pin: '8901',
      notes: 'App store purchase - hurry!'
    },
    {
      retailer: 'Sephora',
      initialValue: '60',
      currentValue: '60',
      expirationDate: createDateFromNow(6), // 6 days from now
      activationCode: 'SEPHORA60',
      pin: '9012',
      notes: 'Beauty products - use this week'
    },

    // Recently expired (within last 30 days) - just missed!
    {
      retailer: 'Nike',
      initialValue: '80',
      currentValue: '80',
      expirationDate: createDateFromNow(-5), // 5 days ago
      activationCode: 'NIKE80',
      pin: '0123',
      notes: 'Just expired! Need to renew'
    },
    {
      retailer: 'Amazon',
      initialValue: '35',
      currentValue: '35',
      expirationDate: createDateFromNow(-12), // 12 days ago
      activationCode: 'AMZN35',
      pin: '1234',
      notes: 'Expired last week - forgot to use'
    },
    {
      retailer: 'Target',
      initialValue: '25',
      currentValue: '25',
      expirationDate: createDateFromNow(-20), // 20 days ago
      activationCode: 'TGT25',
      pin: '2345',
      notes: 'Expired recently'
    },

    // Long expired (months ago)
    {
      retailer: 'Best Buy',
      initialValue: '150',
      currentValue: '150',
      expirationDate: createDateFromNow(-90), // 90 days ago
      activationCode: 'BBY150',
      pin: '3456',
      notes: 'Expired months ago - old gift'
    },
    {
      retailer: 'Starbucks',
      initialValue: '20',
      currentValue: '20',
      expirationDate: createDateFromNow(-60), // 60 days ago
      activationCode: 'SBUX20',
      pin: '4567',
      notes: 'Old coffee card - expired'
    },

    // Partially used coupons (currentValue < initialValue)
    {
      retailer: 'Amazon',
      initialValue: '100',
      currentValue: '45',
      expirationDate: createDateFromNow(15), // 15 days from now
      activationCode: 'AMZN100PARTIAL',
      pin: '5678',
      notes: 'Used $55 already, $45 remaining'
    },
    {
      retailer: 'Walmart',
      initialValue: '200',
      currentValue: '120',
      expirationDate: createDateFromNow(25), // 25 days from now
      activationCode: 'WMT200PARTIAL',
      pin: '6789',
      notes: 'Partially used - $120 left'
    },
    {
      retailer: 'Target',
      initialValue: '75',
      currentValue: '30',
      expirationDate: createDateFromNow(10), // 10 days from now
      activationCode: 'TGT75PARTIAL',
      pin: '7890',
      notes: 'Used some for groceries'
    },

    // High value coupons
    {
      retailer: 'Best Buy',
      initialValue: '500',
      currentValue: '500',
      expirationDate: createDateFromNow(120), // 120 days from now
      activationCode: 'BBY500BIG',
      pin: '8901',
      notes: 'Big purchase planned!'
    },
    {
      retailer: 'Amazon',
      initialValue: '300',
      currentValue: '300',
      expirationDate: createDateFromNow(100), // 100 days from now
      activationCode: 'AMZN300',
      pin: '9012',
      notes: 'Saving for something special'
    },

    // Low value / small purchases
    {
      retailer: 'Starbucks',
      initialValue: '10',
      currentValue: '10',
      expirationDate: createDateFromNow(7), // 7 days from now
      activationCode: 'SBUX10SMALL',
      pin: '0123',
      notes: 'Quick coffee treat'
    },
    {
      retailer: 'Uber Eats',
      initialValue: '15',
      currentValue: '15',
      expirationDate: createDateFromNow(14), // 14 days from now
      activationCode: 'UBEREATS15',
      pin: '1234',
      notes: 'Lunch money'
    },

    // Different retailer variety
    {
      retailer: 'Nike',
      initialValue: '125',
      currentValue: '125',
      expirationDate: createDateFromNow(50), // 50 days from now
      activationCode: 'NIKE125',
      pin: '2345',
      notes: 'New running shoes'
    },
    {
      retailer: 'Sephora',
      initialValue: '85',
      currentValue: '85',
      expirationDate: createDateFromNow(35), // 35 days from now
      activationCode: 'SEPHORA85',
      pin: '3456',
      notes: 'Skincare routine'
    },
    {
      retailer: 'Netflix',
      initialValue: '50',
      currentValue: '50',
      expirationDate: createDateFromNow(55), // 55 days from now
      activationCode: 'NFLX50',
      pin: '4567',
      notes: 'Gift subscription'
    },

    // Critical expiring (1 day left)
    {
      retailer: 'iTunes',
      initialValue: '50',
      currentValue: '50',
      expirationDate: createDateFromNow(1), // 1 day from now!
      activationCode: 'ITUNES50URGENT',
      pin: '5678',
      notes: 'EXPIRES TOMORROW! Use now!'
    },
    {
      retailer: 'Amazon',
      initialValue: '60',
      currentValue: '60',
      expirationDate: createDateFromNow(1), // 1 day from now!
      activationCode: 'AMZN60URGENT',
      pin: '6789',
      notes: 'Last chance - expires tomorrow!'
    },

    // Demo user coupons (read-only sample data)
    {
      retailer: 'Amazon',
      initialValue: '25',
      currentValue: '25',
      expirationDate: createDateFromNow(30), // 30 days from now
      activationCode: 'DEMOAMZN25',
      pin: '0001',
      notes: 'Demo: Sample Amazon coupon'
    },
    {
      retailer: 'Target',
      initialValue: '15',
      currentValue: '15',
      expirationDate: createDateFromNow(14), // 14 days from now
      activationCode: 'DEMODTGT15',
      pin: '0002',
      notes: 'Demo: Sample Target coupon'
    },
    {
      retailer: 'Best Buy',
      initialValue: '50',
      currentValue: '50',
      expirationDate: createDateFromNow(-7), // 7 days ago (expired)
      activationCode: 'DEMOBBY50',
      pin: '0003',
      notes: 'Demo: Expired sample coupon'
    },

    // Test user 4 coupons - fresh account with recent coupons
    {
      retailer: 'Netflix',
      initialValue: '20',
      currentValue: '20',
      expirationDate: createDateFromNow(25), // 25 days from now
      activationCode: 'TEST4NFLX20',
      pin: '9876',
      notes: 'New subscriber gift'
    },
    {
      retailer: 'Spotify',
      initialValue: '35',
      currentValue: '35',
      expirationDate: createDateFromNow(40), // 40 days from now
      activationCode: 'TEST4SPOT35',
      pin: '5432',
      notes: 'Premium music subscription'
    },
    {
      retailer: 'Amazon',
      initialValue: '75',
      currentValue: '50',
      expirationDate: createDateFromNow(18), // 18 days from now
      activationCode: 'TEST4AMZN75',
      pin: '1098',
      notes: 'Partially used - $25 spent on books'
    },
    {
      retailer: 'Target',
      initialValue: '40',
      currentValue: '40',
      expirationDate: createDateFromNow(4), // 4 days from now - urgent!
      activationCode: 'TEST4TGT40',
      pin: '7654',
      notes: 'Weekend shopping - use soon!'
    },
    {
      retailer: 'Nike',
      initialValue: '95',
      currentValue: '95',
      expirationDate: createDateFromNow(60), // 60 days from now
      activationCode: 'TEST4NIKE95',
      pin: '4321',
      notes: 'Saving for new running shoes'
    },
    {
      retailer: 'Starbucks',
      initialValue: '18',
      currentValue: '18',
      expirationDate: createDateFromNow(-3), // 3 days ago (just expired)
      activationCode: 'TEST4SBUX18',
      pin: '3210',
      notes: 'Oops, missed this one!'
    }
  ];

  let couponCount = 0;

  for (const couponTemplate of couponTemplates) {
    couponCount++;
    
    // Find which user this coupon belongs to based on distribution
    const distribution = couponDistribution.find(d => couponCount >= d.start && couponCount <= d.end);
    
    if (!distribution) {
      console.error(`${colors.red}✗ No distribution found for coupon #${couponCount}${colors.reset}`);
      continue;
    }
    
    const userId = userMap.get(distribution.email);
    
    if (!userId) {
      console.error(`${colors.red}✗ User ID not found for ${distribution.email}${colors.reset}`);
      continue;
    }

    const daysUntilExp = couponTemplate.expirationDate;
    
    // Add color coding for urgency
    let urgencyColor = colors.green;
    if (daysUntilExp.includes(`T00:00:00.000Z`) && daysUntilExp.includes(`+`)) {
      const days = Math.round((new Date(daysUntilExp) - new Date()) / (1000 * 60 * 60 * 24));
      if (days <= 3) urgencyColor = colors.red;
      else if (days <= 7) urgencyColor = colors.yellow;
    }

    try {
      await pb.collection('coupons').create({
        ...couponTemplate,
        userId
      });
      
      console.log(`${colors.green}✓ Created coupon #${couponCount}${colors.reset} for ${colors.blue}${distribution.email}${colors.reset}: ${couponTemplate.retailer} ${urgencyColor}(${daysUntilExp})${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Error creating coupon: ${error.message}${colors.reset}`);
    }
  }

  console.log(`\n${colors.green}Total coupons created: ${couponCount}${colors.reset}`);
  
  // Print summary
  const now = new Date();
  let activeCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  
  couponTemplates.forEach(coupon => {
    const expDate = new Date(coupon.expirationDate);
    const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      expiredCount++;
    } else if (daysUntil <= 7) {
      expiringSoonCount++;
    } else {
      activeCount++;
    }
  });
  
  console.log(`${colors.blue}Summary:${colors.reset}`);
  console.log(`  ${colors.green}✓ Active coupons (7+ days): ${activeCount}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ Expiring soon (≤7 days): ${expiringSoonCount}${colors.reset}`);
  console.log(`  ${colors.red}✗ Expired: ${expiredCount}${colors.reset}`);
}

async function clearExistingData(pb) {
  console.log(`${colors.blue}Clearing existing seed data...${colors.reset}`);

  try {
    const coupons = await pb.collection('coupons').getList(1, 500);
    if (coupons.items.length > 0) {
      for (const coupon of coupons.items) {
        await pb.collection('coupons').delete(coupon.id);
      }
      console.log(`${colors.yellow}✓ Deleted ${coupons.items.length} existing coupons${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.gray}ℹ No existing coupons to clear${colors.reset}`);
  }

  try {
    const roles = await pb.collection('user_roles').getList(1, 500);
    if (roles.items.length > 0) {
      for (const role of roles.items) {
        await pb.collection('user_roles').delete(role.id);
      }
      console.log(`${colors.yellow}✓ Deleted ${roles.items.length} existing user roles${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.gray}ℹ No existing user roles to clear${colors.reset}`);
  }

  try {
    const retailers = await pb.collection('retailers').getList(1, 500);
    if (retailers.items.length > 0) {
      for (const retailer of retailers.items) {
        await pb.collection('retailers').delete(retailer.id);
      }
      console.log(`${colors.yellow}✓ Deleted ${retailers.items.length} existing retailers${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.gray}ℹ No existing retailers to clear${colors.reset}`);
  }

  console.log();
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

    console.log(`${colors.yellow}Authenticating as admin...${colors.reset}`);

    if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
      console.error(`${colors.red}✗ Admin credentials not found in environment variables${colors.reset}`);
      console.error(`${colors.red}Required: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD${colors.reset}`);
      process.exit(1);
      return;
    }

    try {
      const authData = await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
      console.log(`${colors.green}✓ Admin authenticated${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Admin authentication failed: ${error.message}${colors.reset}`);
      console.error(`${colors.red}Check PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD in .env${colors.reset}`);
      process.exit(1);
      return;
    }

    await fixPermissions(pb);
    console.log();

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

    try {
      await pb.collection('retailers').getList(1, 1);
      console.log(`${colors.green}✓ 'retailers' collection exists${colors.reset}`);
    } catch (error) {
      if (error.status === 404) {
        console.log(`${colors.red}✗ 'retailers' collection NOT found${colors.reset}`);
        collectionsExist = false;
      } else {
        console.error(`${colors.red}✗ Error checking 'retailers': ${error.message}${colors.reset}`);
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

    await clearExistingData(pb);

    const userIds = await createTestUsers(pb);
    console.log();

    await seedRetailers(pb);
    console.log();

    await assignUserRoles(pb, userIds);
    console.log();

    await seedCoupons(pb, userIds);
    console.log();

    console.log(`${colors.green}✓ Data seeding complete!${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);

    console.log(`${colors.yellow}Test Credentials:${colors.reset}`);
    console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);

    const users = [
      { email: 'user@example.com', password: 'password123', role: 'user' },
      { email: 'manager@example.com', password: 'password123', role: 'manager' },
      { email: 'another@example.com', password: 'password123', role: 'user' },
      { email: 'demo@example.com', password: 'demo12345', role: 'demo' },
      { email: 'test4@example.com', password: 'password123', role: 'user' }
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

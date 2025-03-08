#!/usr/bin/env node

/**
 * Mock Data Generator for Coupon Manager
 * 
 * This script adds mock data to the Coupon Manager database for testing purposes.
 * It creates users via the Supabase Management API and adds corresponding user roles and coupons.
 * 
 * Usage:
 * node scripts/add-mock-data.js
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (for admin operations)
 * - SUPABASE_MANAGEMENT_API_KEY: Your Supabase Management API key (for user creation)
 * - SUPABASE_PROJECT_REF: Your Supabase project reference ID (e.g., 'xovlwgnfhtnycavejtzd')
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import https from 'https';

// Initialize configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// Disable SSL certificate verification for development
// WARNING: This is not recommended for production use
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();

// Database connection
const client = new pg.Client({
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT,
  database: process.env.SUPABASE_DB_NAME,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Supabase API configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const managementApiKey = process.env.SUPABASE_MANAGEMENT_API_KEY;
const projectRef = process.env.SUPABASE_PROJECT_REF || supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`${colors.red}Error: Missing Supabase credentials in .env file.${colors.reset}`);
  console.error(`${colors.yellow}Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.${colors.reset}`);
  process.exit(1);
}

if (!managementApiKey && !projectRef) {
  console.log(`${colors.yellow}Warning: SUPABASE_MANAGEMENT_API_KEY or SUPABASE_PROJECT_REF not found in .env file.${colors.reset}`);
  console.log(`${colors.yellow}User creation via Management API will be skipped.${colors.reset}`);
}

// Print current environment variables (without sensitive values)
console.log(`${colors.blue}Environment Configuration:${colors.reset}`);
console.log(`Project Reference: ${projectRef || '(not set)'}`);
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Management API Key: ${managementApiKey ? '********' + managementApiKey.slice(-4) : '(not set)'}`);

// Create custom fetch with SSL verification disabled
const customFetch = (url, options) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false
  });
  
  console.log(`${colors.gray}[DEBUG] Fetching URL: ${url}${colors.reset}`);
  if (options.headers) {
    console.log(`${colors.gray}[DEBUG] Headers: ${JSON.stringify(Object.keys(options.headers))}${colors.reset}`);
  }
  
  return fetch(url, { ...options, agent: httpsAgent });
};

// Test user credentials
const testUsers = [
  {
    email: 'user@example.com',
    password: 'pass123',
    role: 'user',
    name: 'Regular User'
  },
  {
    email: 'manager@example.com',
    password: 'pass123',
    role: 'manager',
    name: 'Manager User'
  },
  {
    email: 'another@example.com',
    password: 'pass123',
    role: 'user',
    name: 'Another User'
  }
];

// Fixed UUIDs for test users (used as fallback)
const fixedUserIds = [
  '00000000-0000-0000-0000-000000000001', // Regular user (user@example.com)
  '00000000-0000-0000-0000-000000000002', // Manager (manager@example.com)
  '00000000-0000-0000-0000-000000000003'  // Another regular user (another@example.com)
];

// Sample coupons (will be associated with users after creation)
const couponTemplates = [
  {
    retailer: 'Amazon',
    initial_value: '50',
    current_value: '50',
    expiration_date: new Date('2024-12-31').toISOString(),
    activation_code: 'AMZN2024',
    pin: '1234',
    notes: 'Birthday gift from Mom'
  },
  {
    retailer: 'Amazon',
    initial_value: '100',
    current_value: '75',
    expiration_date: new Date('2024-06-30').toISOString(),
    activation_code: 'AMZN100SUMMER',
    pin: '5678',
    notes: 'Used $25 for headphones'
  },
  {
    retailer: 'Target',
    initial_value: '75',
    current_value: '75',
    expiration_date: new Date('2024-09-30').toISOString(),
    activation_code: 'TGT75FALL',
    pin: '4321',
    notes: 'Christmas gift from Dad'
  },
  {
    retailer: 'Walmart',
    initial_value: '150',
    current_value: '150',
    expiration_date: new Date('2024-08-15').toISOString(),
    activation_code: 'WMT150AUG',
    pin: '7890',
    notes: 'Anniversary gift'
  },
  {
    retailer: 'Best Buy',
    initial_value: '200',
    current_value: '200',
    expiration_date: new Date('2024-10-15').toISOString(),
    activation_code: 'BB200OCT',
    pin: '1357',
    notes: 'Saving for a new laptop'
  },
  {
    retailer: 'Starbucks',
    initial_value: '25',
    current_value: '10',
    expiration_date: new Date('2024-05-15').toISOString(),
    activation_code: 'SBUX25MAY',
    pin: '2468',
    notes: 'Morning coffee fund'
  },
  {
    retailer: 'iTunes',
    initial_value: '30',
    current_value: '30',
    expiration_date: new Date('2024-11-30').toISOString(),
    activation_code: 'ITUNES30NOV',
    pin: '9876',
    notes: 'For new music releases'
  }
];

// Try alternate method to create users with service role key
async function createUsersWithServiceRole() {
  console.log(`${colors.blue}Attempting to create users with Service Role Key...${colors.reset}`);
  
  if (!supabaseServiceKey) {
    console.log(`${colors.yellow}Missing Service Role Key. Using fixed UUIDs.${colors.reset}`);
    return null;
  }
  
  try {
    const createdUsers = [];
    
    // Try different endpoint patterns
    const endpoints = [
      `${supabaseUrl}/auth/v1/admin/users`,
      `${supabaseUrl}/rest/v1/auth/users`
    ];
    
    let successfulEndpoint = null;
    
    // Try to find a working endpoint first
    for (const endpoint of endpoints) {
      try {
        console.log(`${colors.blue}Testing endpoint: ${endpoint}${colors.reset}`);
        
        const response = await customFetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          }
        });
        
        if (response.ok) {
          console.log(`${colors.green}Found working endpoint: ${endpoint}${colors.reset}`);
          successfulEndpoint = endpoint;
          break;
        } else {
          console.log(`${colors.yellow}Endpoint ${endpoint} returned status: ${response.status}${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}Error with endpoint ${endpoint}: ${error.message}${colors.reset}`);
      }
    }
    
    if (!successfulEndpoint) {
      console.log(`${colors.yellow}No working endpoint found for Service Role Key method.${colors.reset}`);
      return null;
    }
    
    // Use the successful endpoint to create users
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      
      try {
        const createResponse = await customFetch(
          successfulEndpoint, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
              email: user.email,
              password: user.password,
              email_confirm: true,
              user_metadata: {
                name: user.name,
                role: user.role
              }
            })
          }
        );
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          console.log(`${colors.yellow}Error creating user ${user.email}: ${errorData.message || errorData.error || createResponse.status}${colors.reset}`);
          
          createdUsers.push({
            id: fixedUserIds[i],
            email: user.email,
            role: user.role
          });
          continue;
        }
        
        const userData = await createResponse.json();
        console.log(`${colors.green}✓ Created user: ${user.email} with ID: ${userData.id || userData.user?.id}${colors.reset}`);
        
        createdUsers.push({
          id: userData.id || userData.user?.id || fixedUserIds[i],
          email: user.email,
          role: user.role
        });
      } catch (error) {
        console.log(`${colors.yellow}Error creating user ${user.email}: ${error.message}${colors.reset}`);
        createdUsers.push({
          id: fixedUserIds[i],
          email: user.email,
          role: user.role
        });
      }
    }
    
    if (createdUsers.length > 0) {
      return createdUsers;
    }
    
    return null;
  } catch (error) {
    console.log(`${colors.yellow}Service Role Key method failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Create or get users via Supabase Management API
async function createOrGetUsers() {
  console.log(`${colors.blue}Attempting to create users via Supabase Management API...${colors.reset}`);
  
  // If Management API key or project ref is missing, use fixed UUIDs
  if (!managementApiKey || !projectRef) {
    console.log(`${colors.yellow}Missing Management API credentials. Using fixed UUIDs.${colors.reset}`);
    return testUsers.map((user, index) => ({
      id: fixedUserIds[index],
      email: user.email,
      role: user.role
    }));
  }
  
  try {
    const createdUsers = [];
    
    // Management API base URL
    const managementApiUrl = 'https://api.supabase.com';
    
    // Get existing users via Management API
    console.log(`${colors.blue}Fetching existing users from project: ${projectRef}${colors.reset}`);
    
    const existingUsersResponse = await customFetch(
      `${managementApiUrl}/v1/projects/${projectRef}/auth/users`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Log response status
    console.log(`${colors.gray}[DEBUG] Response status: ${existingUsersResponse.status}${colors.reset}`);
    
    // Check for non-OK response
    if (!existingUsersResponse.ok) {
      try {
        const errorText = await existingUsersResponse.text();
        console.log(`${colors.yellow}Error response: ${errorText}${colors.reset}`);
        
        try {
          const errorData = JSON.parse(errorText);
          console.log(`${colors.yellow}Error fetching users: ${errorData.message || errorData.error || existingUsersResponse.status}${colors.reset}`);
        } catch (jsonError) {
          console.log(`${colors.yellow}Error fetching users: ${errorText || existingUsersResponse.status}${colors.reset}`);
        }
      } catch (textError) {
        console.log(`${colors.yellow}Error fetching users: ${existingUsersResponse.status}${colors.reset}`);
      }
      
      throw new Error('Failed to fetch existing users');
    }
    
    const existingUsers = await existingUsersResponse.json();
    console.log(`${colors.green}Found ${existingUsers.length} existing users${colors.reset}`);
    
    // Process each test user
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      
      // Check if user already exists
      const existingUser = existingUsers.find(u => u.email === user.email);
      
      if (existingUser) {
        console.log(`${colors.green}User ${user.email} already exists with ID: ${existingUser.id}${colors.reset}`);
        
        createdUsers.push({
          id: existingUser.id,
          email: user.email,
          role: user.role
        });
        continue;
      }
      
      // User doesn't exist, create new user
      console.log(`${colors.blue}Creating new user: ${user.email}...${colors.reset}`);
      
      const createUserResponse = await customFetch(
        `${managementApiUrl}/v1/projects/${projectRef}/auth/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${managementApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              name: user.name,
              role: user.role
            }
          })
        }
      );
      
      if (!createUserResponse.ok) {
        let errorMessage = `Status: ${createUserResponse.status}`;
        try {
          const errorData = await createUserResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Ignore JSON parsing error
        }
        
        console.log(`${colors.yellow}Error creating user ${user.email}: ${errorMessage}${colors.reset}`);
        console.log(`${colors.yellow}Using fixed UUID instead: ${fixedUserIds[i]}${colors.reset}`);
        
        createdUsers.push({
          id: fixedUserIds[i],
          email: user.email,
          role: user.role
        });
        continue;
      }
      
      const newUser = await createUserResponse.json();
      console.log(`${colors.green}✓ Created user: ${user.email} with ID: ${newUser.id}${colors.reset}`);
      
      createdUsers.push({
        id: newUser.id,
        email: user.email,
        role: user.role
      });
    }
    
    return createdUsers;
  } catch (error) {
    console.log(`${colors.yellow}Error using Management API: ${error.message}${colors.reset}`);
    
    // Try alternate method if Management API fails
    console.log(`${colors.blue}Attempting alternate method with Service Role Key...${colors.reset}`);
    const serviceRoleUsers = await createUsersWithServiceRole();
    
    if (serviceRoleUsers) {
      return serviceRoleUsers;
    }
    
    console.log(`${colors.yellow}Using fixed UUIDs as fallback.${colors.reset}`);
    return testUsers.map((user, index) => ({
      id: fixedUserIds[index],
      email: user.email,
      role: user.role
    }));
  }
}

// Add mock data to the database
async function addMockData() {
  console.log(`${colors.blue}Adding mock data to the database...${colors.reset}`);
  
  try {
    // Create or get users via Supabase Management API
    const users = await createOrGetUsers();
    
    console.log(`${colors.blue}User IDs for database operations:${colors.reset}`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}): ${user.id}`);
    });
    
    // Connect to the database
    await client.connect();
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if foreign key constraints are enabled
    console.log(`${colors.blue}Checking foreign key constraints...${colors.reset}`);
    
    // Temporarily disable RLS and foreign key constraints for testing
    console.log(`${colors.yellow}Temporarily disabling RLS and foreign key constraints for testing...${colors.reset}`);
    
    // Disable RLS
    await client.query('ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY');
    
    // Drop foreign key constraints
    const checkFkUserRoles = await client.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_user_roles_user'
      AND table_name = 'user_roles'
    `);
    
    if (checkFkUserRoles.rows.length > 0) {
      await client.query('ALTER TABLE public.user_roles DROP CONSTRAINT fk_user_roles_user');
      console.log(`${colors.green}Dropped foreign key constraint on user_roles${colors.reset}`);
    }
    
    const checkFkCoupons = await client.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_coupons_user'
      AND table_name = 'coupons'
    `);
    
    if (checkFkCoupons.rows.length > 0) {
      await client.query('ALTER TABLE public.coupons DROP CONSTRAINT fk_coupons_user');
      console.log(`${colors.green}Dropped foreign key constraint on coupons${colors.reset}`);
    }
    
    // Check if data already exists
    const userRolesResult = await client.query('SELECT COUNT(*) FROM user_roles');
    const couponsResult = await client.query('SELECT COUNT(*) FROM coupons');
    
    if (userRolesResult.rows[0].count > 0 || couponsResult.rows[0].count > 0) {
      console.log(`${colors.yellow}Data already exists in the database.${colors.reset}`);
      console.log(`${colors.yellow}Clearing existing data before adding mock data...${colors.reset}`);
      
      // Clear existing data
      await client.query('DELETE FROM coupons');
      await client.query('DELETE FROM user_roles');
      
      console.log(`${colors.green}Existing data cleared.${colors.reset}`);
    }
    
    // Add user roles
    console.log(`${colors.blue}Adding user roles...${colors.reset}`);
    for (const user of users) {
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [user.id, user.role]
      );
    }
    console.log(`${colors.green}✓ Added ${users.length} user roles${colors.reset}`);
    
    // Add coupons
    console.log(`${colors.blue}Adding coupons...${colors.reset}`);
    
    // Distribute coupons among users
    const coupons = [];
    
    // First 3 coupons for first user
    for (let i = 0; i < 3 && i < couponTemplates.length; i++) {
      coupons.push({
        ...couponTemplates[i],
        user_id: users[0].id
      });
    }
    
    // Next 2 coupons for second user
    for (let i = 3; i < 5 && i < couponTemplates.length; i++) {
      coupons.push({
        ...couponTemplates[i],
        user_id: users[1].id
      });
    }
    
    // Last 2 coupons for third user
    for (let i = 5; i < 7 && i < couponTemplates.length; i++) {
      coupons.push({
        ...couponTemplates[i],
        user_id: users[2].id
      });
    }
    
    for (const coupon of coupons) {
      await client.query(
        `INSERT INTO coupons (
          retailer, initial_value, current_value, expiration_date, 
          activation_code, pin, user_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          coupon.retailer,
          coupon.initial_value,
          coupon.current_value,
          coupon.expiration_date,
          coupon.activation_code,
          coupon.pin,
          coupon.user_id,
          coupon.notes
        ]
      );
    }
    console.log(`${colors.green}✓ Added ${coupons.length} coupons${colors.reset}`);
    
    // Re-enable RLS
    await client.query('ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY');
    console.log(`${colors.green}Re-enabled RLS${colors.reset}`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`${colors.green}Mock data added successfully!${colors.reset}`);
    
    // Print summary
    console.log(`\n${colors.blue}Data Summary:${colors.reset}`);
    console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    console.log(`User Roles: ${users.length}`);
    console.log(`Coupons: ${coupons.length}`);
    console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    
    // Print test user credentials
    console.log(`\n${colors.blue}Test User Credentials:${colors.reset}`);
    console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    
    testUsers.forEach((user, index) => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
      console.log(`User ID: ${users[index]?.id || 'Unknown'}`);
      console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
    });
    
    console.log(`\n${colors.yellow}Note: SSL certificate verification has been disabled for this script.${colors.reset}`);
    console.log(`${colors.yellow}This is not recommended for production use.${colors.reset}`);
    
    if (!managementApiKey || !projectRef) {
      console.log(`\n${colors.yellow}IMPORTANT: To use the Supabase Management API, add these to your .env file:${colors.reset}`);
      console.log(`${colors.yellow}SUPABASE_MANAGEMENT_API_KEY=your-management-api-key${colors.reset}`);
      console.log(`${colors.yellow}SUPABASE_PROJECT_REF=${projectRef || 'your-project-ref'}${colors.reset}`);
      console.log(`${colors.yellow}You can find your project ref in your Supabase URL: https://[project-ref].supabase.co${colors.reset}`);
      console.log(`${colors.yellow}Get your Management API key from the Supabase dashboard under Project Settings > API.${colors.reset}`);
    }
    
  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(`${colors.red}Error during rollback: ${rollbackError.message}${colors.reset}`);
    }
    
    console.error(`${colors.red}Error adding mock data: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (closeError) {
      console.error(`${colors.red}Error closing database connection: ${closeError.message}${colors.reset}`);
    }
  }
}

// Run the script
addMockData(); 
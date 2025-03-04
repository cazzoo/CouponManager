import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Initialize configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env file
dotenv.config({ path: path.join(rootDir, '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initial coupon data from the existing CouponService
const initialCoupons = [
  {
    retailer: 'Amazon',
    initial_value: '50',
    current_value: '50',
    expiration_date: new Date('2024-12-31').toISOString(),
    activation_code: 'AMZN2024',
    pin: '1234'
  },
  {
    retailer: 'Amazon',
    initial_value: '100',
    current_value: '100',
    expiration_date: new Date('2024-06-30').toISOString(),
    activation_code: 'AMZN100SUMMER',
    pin: '5678'
  },
  {
    retailer: 'Amazon',
    initial_value: '25',
    current_value: '25',
    expiration_date: new Date('2024-03-15').toISOString(),
    activation_code: 'AMZN25SPRING',
    pin: '9012'
  },
  {
    retailer: 'Target',
    initial_value: '75',
    current_value: '75',
    expiration_date: new Date('2024-09-30').toISOString(),
    activation_code: 'TGT75FALL',
    pin: '4321'
  },
  {
    retailer: 'Target',
    initial_value: '150',
    current_value: '150',
    expiration_date: new Date('2024-08-15').toISOString(),
    activation_code: 'TGT150AUG',
    pin: '7890'
  }
];

// Main migration function
async function migrateToSupabase() {
  console.log('Starting migration to Supabase...');
  
  console.log('\n===== TABLE CREATION INSTRUCTIONS =====');
  console.log('To create the coupons table in your Supabase database:');
  console.log('1. Log in to your Supabase dashboard at https://app.supabase.com');
  console.log('2. Select your project');
  console.log('3. Go to the SQL Editor (left sidebar)');
  console.log('4. Create a new query');
  console.log('5. Copy and paste the following SQL:');
  console.log('\n```');
  
  const sqlFilePath = path.join(rootDir, 'scripts', 'create-supabase-table.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(sqlContent);
  
  console.log('```\n');
  console.log('6. Run the query');
  console.log('======================================\n');

  // Check if the user has already created the table
  let tableExists = false;
  
  try {
    // Use direct query to check if table exists
    const { data, error } = await supabase
      .from('coupons')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('The coupons table does not exist yet.');
        console.log('Please create it using the SQL instructions above.');
        process.exit(0);
      } else {
        console.error('Error checking table existence:', error);
        process.exit(1);
      }
    } else {
      tableExists = true;
      console.log('Coupons table exists! Proceeding with data migration...');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
  
  if (tableExists) {
    // Check if we need to seed the table
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Error checking table data:', error);
        process.exit(1);
      }
      
      if (data && data.length > 0) {
        console.log('Table already contains data. No seeding needed.');
      } else {
        console.log('Table is empty. Seeding with initial data...');
        
        const { error: insertError } = await supabase
          .from('coupons')
          .insert(initialCoupons);
        
        if (insertError) {
          console.error('Error seeding data:', insertError);
          process.exit(1);
        }
        
        console.log(`Successfully added ${initialCoupons.length} coupons to the database!`);
      }
      
      console.log('\nMigration completed successfully!');
    } catch (error) {
      console.error('Error seeding table:', error);
      process.exit(1);
    }
  }
}

// Run the migration
migrateToSupabase(); 
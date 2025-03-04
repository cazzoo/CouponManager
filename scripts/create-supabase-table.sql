-- Create the coupons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coupons (
  id SERIAL PRIMARY KEY,
  retailer TEXT NOT NULL,
  initial_value TEXT NOT NULL,
  current_value TEXT NOT NULL,
  expiration_date TIMESTAMP,
  activation_code TEXT,
  pin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 
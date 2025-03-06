-- Migration script to add user roles and coupon ownership
-- This adds:
-- 1. A user_roles table to store user roles
-- 2. A user_id column to the coupons table to associate coupons with users

-- Create the user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_roles_user_id_unique UNIQUE (user_id)
);

-- Add comment to user_roles table
COMMENT ON TABLE public.user_roles IS 'Stores user role information for access control';

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);

-- Add foreign key if we're using RLS (Row-Level Security)
-- ALTER TABLE public.user_roles 
--   ADD CONSTRAINT fk_user_roles_user
--   FOREIGN KEY (user_id) 
--   REFERENCES auth.users(id)
--   ON DELETE CASCADE;

-- Add user_id column to the coupons table
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add comment to user_id column
COMMENT ON COLUMN public.coupons.user_id IS 'The user who owns this coupon';

-- Add index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON public.coupons (user_id);

-- Add foreign key if we're using RLS (Row-Level Security)
-- ALTER TABLE public.coupons 
--   ADD CONSTRAINT fk_coupons_user
--   FOREIGN KEY (user_id) 
--   REFERENCES auth.users(id)
--   ON DELETE SET NULL;

-- Create default role for existing users (optional)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Update coupons without user_id to be owned by the first user (optional)
-- Only do this if you want to preserve existing coupons during migration
-- UPDATE public.coupons
-- SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
-- WHERE user_id IS NULL;

-- Add Row Level Security (RLS) policies (only if using RLS)
-- Enable RLS on coupons
-- ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
-- CREATE POLICY "Users can view their own coupons" 
--   ON public.coupons FOR SELECT 
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own coupons" 
--   ON public.coupons FOR INSERT 
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own coupons" 
--   ON public.coupons FOR UPDATE 
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own coupons" 
--   ON public.coupons FOR DELETE 
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Managers can view all coupons" 
--   ON public.coupons FOR SELECT 
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.user_roles 
--       WHERE user_id = auth.uid() AND role = 'manager'
--     )
--   );

-- CREATE POLICY "Managers can update any coupon" 
--   ON public.coupons FOR UPDATE 
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.user_roles 
--       WHERE user_id = auth.uid() AND role = 'manager'
--     )
--   );

-- CREATE POLICY "Managers can delete any coupon" 
--   ON public.coupons FOR DELETE 
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.user_roles 
--       WHERE user_id = auth.uid() AND role = 'manager'
--     )
--   ); 
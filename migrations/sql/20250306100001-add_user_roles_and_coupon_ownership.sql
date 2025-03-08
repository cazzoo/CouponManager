-- Migration: Add User Roles and Coupon Ownership
-- Description: Adds user roles table and user_id to coupons table
-- Created at: 2025-03-06T10:00:01.000Z

-- Up Migration
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

-- Add user_id column to the coupons table
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add comment to user_id column
COMMENT ON COLUMN public.coupons.user_id IS 'The user who owns this coupon';

-- Add index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON public.coupons (user_id);

-- Create default role for existing users (optional)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Down Migration (commented out, uncomment to use for rollback)
/*
-- Drop indexes
DROP INDEX IF EXISTS idx_coupons_user_id;
DROP INDEX IF EXISTS idx_user_roles_role;
DROP INDEX IF EXISTS idx_user_roles_user_id;

-- Drop user_id column from coupons
ALTER TABLE public.coupons DROP COLUMN IF EXISTS user_id;

-- Drop user_roles table
DROP TABLE IF EXISTS public.user_roles;
*/ 
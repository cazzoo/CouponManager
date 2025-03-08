-- Migration: Add Foreign Keys for RLS
-- Description: Adds foreign key constraints for Row Level Security
-- Created at: 2025-03-06T10:00:04.000Z

-- Up Migration
-- Check if the constraint already exists for user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_roles_user'
  ) THEN
    -- Add foreign key constraint to user_roles table
    ALTER TABLE public.user_roles 
      ADD CONSTRAINT fk_user_roles_user
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Check if the constraint already exists for coupons
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_coupons_user'
  ) THEN
    -- Add foreign key constraint to coupons table
    ALTER TABLE public.coupons 
      ADD CONSTRAINT fk_coupons_user
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Add comments explaining the foreign keys
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_roles_user'
  ) THEN
    COMMENT ON CONSTRAINT fk_user_roles_user ON public.user_roles IS 'Links user_roles to auth.users for RLS';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_coupons_user'
  ) THEN
    COMMENT ON CONSTRAINT fk_coupons_user ON public.coupons IS 'Links coupons to auth.users for RLS';
  END IF;
END $$;

-- Down Migration (commented out, uncomment to use for rollback)
/*
-- Drop foreign key constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_coupons_user'
  ) THEN
    ALTER TABLE public.coupons DROP CONSTRAINT fk_coupons_user;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_roles_user'
  ) THEN
    ALTER TABLE public.user_roles DROP CONSTRAINT fk_user_roles_user;
  END IF;
END $$;
*/ 
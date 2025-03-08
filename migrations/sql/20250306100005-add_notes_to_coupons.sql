-- Migration: Add Notes to Coupons
-- Description: Adds a notes column to the coupons table
-- Created at: 2025-03-06T10:00:05.000Z

-- Up Migration
-- Add notes column to coupons table
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment to notes column
COMMENT ON COLUMN public.coupons.notes IS 'Additional notes about the coupon';

-- Down Migration (commented out, uncomment to use for rollback)
/*
-- Remove notes column from coupons table
ALTER TABLE public.coupons DROP COLUMN IF EXISTS notes;
*/ 
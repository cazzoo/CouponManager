-- Migration: Enable RLS for User Roles
-- Description: Enables Row Level Security for the user_roles table
-- Created at: 2025-03-06T10:00:03.000Z

-- Up Migration
-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own role" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own role" 
  ON public.user_roles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Manager policies - allow managers to access all user roles
CREATE POLICY "Managers can view all user roles" 
  ON public.user_roles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Managers can update any user role" 
  ON public.user_roles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Managers can insert user roles" 
  ON public.user_roles FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Managers can delete user roles" 
  ON public.user_roles FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Down Migration (commented out, uncomment to use for rollback)
/*
-- Drop all policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can update any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can delete user roles" ON public.user_roles;

-- Disable RLS on user_roles table
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
*/ 
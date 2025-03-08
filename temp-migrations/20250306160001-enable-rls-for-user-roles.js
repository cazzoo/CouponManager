'use strict';

exports.shorthands = undefined;

exports.up = async function(pgm) {
  // Enable RLS on user_roles table
  pgm.sql(`ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;`);
  
  // Create policies for user_roles
  pgm.sql(`
    CREATE POLICY "Users can view their own role" 
      ON public.user_roles FOR SELECT 
      USING (auth.uid() = user_id);
  `);
  
  pgm.sql(`
    CREATE POLICY "Users can update their own role" 
      ON public.user_roles FOR UPDATE 
      USING (auth.uid() = user_id);
  `);
  
  // Manager policies
  pgm.sql(`
    CREATE POLICY "Managers can view all user roles" 
      ON public.user_roles FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
  
  pgm.sql(`
    CREATE POLICY "Managers can update any user role" 
      ON public.user_roles FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
  
  pgm.sql(`
    CREATE POLICY "Managers can insert user roles" 
      ON public.user_roles FOR INSERT 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
  
  pgm.sql(`
    CREATE POLICY "Managers can delete user roles" 
      ON public.user_roles FOR DELETE 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
}

exports.down = async function(pgm) {
  // Drop all policies
  pgm.sql(`DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;`);
  pgm.sql(`DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can view all user roles" ON public.user_roles;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can update any user role" ON public.user_roles;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can insert user roles" ON public.user_roles;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can delete user roles" ON public.user_roles;`);
  
  // Disable RLS on user_roles table
  pgm.sql(`ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;`);
} 
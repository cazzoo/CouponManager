'use strict';

exports.shorthands = undefined;

exports.up = async function(pgm) {
  // Enable RLS on coupons table
  pgm.sql(`ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;`);
  
  // Create policies for coupons
  pgm.sql(`
    CREATE POLICY "Users can view their own coupons" 
      ON public.coupons FOR SELECT 
      USING (auth.uid() = user_id);
  `);
  
  pgm.sql(`
    CREATE POLICY "Users can insert their own coupons" 
      ON public.coupons FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  `);
  
  pgm.sql(`
    CREATE POLICY "Users can update their own coupons" 
      ON public.coupons FOR UPDATE 
      USING (auth.uid() = user_id);
  `);
  
  pgm.sql(`
    CREATE POLICY "Users can delete their own coupons" 
      ON public.coupons FOR DELETE 
      USING (auth.uid() = user_id);
  `);
  
  // Manager policies
  pgm.sql(`
    CREATE POLICY "Managers can view all coupons" 
      ON public.coupons FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
  
  pgm.sql(`
    CREATE POLICY "Managers can update any coupon" 
      ON public.coupons FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
  
  pgm.sql(`
    CREATE POLICY "Managers can delete any coupon" 
      ON public.coupons FOR DELETE 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
  
  pgm.sql(`
    CREATE POLICY "Managers can insert coupons for any user" 
      ON public.coupons FOR INSERT 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'manager'
        )
      );
  `);
}

exports.down = async function(pgm) {
  // Drop all policies
  pgm.sql(`DROP POLICY IF EXISTS "Users can view their own coupons" ON public.coupons;`);
  pgm.sql(`DROP POLICY IF EXISTS "Users can insert their own coupons" ON public.coupons;`);
  pgm.sql(`DROP POLICY IF EXISTS "Users can update their own coupons" ON public.coupons;`);
  pgm.sql(`DROP POLICY IF EXISTS "Users can delete their own coupons" ON public.coupons;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can view all coupons" ON public.coupons;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can update any coupon" ON public.coupons;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can delete any coupon" ON public.coupons;`);
  pgm.sql(`DROP POLICY IF EXISTS "Managers can insert coupons for any user" ON public.coupons;`);
  
  // Disable RLS on coupons table
  pgm.sql(`ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;`);
} 
# Row Level Security (RLS) in Supabase

This document explains how Row Level Security (RLS) is implemented in the Coupon Manager application.

## Overview

Row Level Security (RLS) is a PostgreSQL feature that allows us to restrict access to rows in a table based on the user making the request. In our application, we use RLS to ensure that:

1. Regular users can only access their own data
2. Managers can access all data

## Tables with RLS Enabled

The following tables have RLS enabled:

1. `public.coupons` - Stores coupon information
2. `public.user_roles` - Stores user role information

## Foreign Key Constraints

To maintain data integrity with RLS, we've added foreign key constraints:

1. `fk_user_roles_user` - Links `user_roles.user_id` to `auth.users.id` with CASCADE delete
2. `fk_coupons_user` - Links `coupons.user_id` to `auth.users.id` with SET NULL delete

## RLS Policies

### Coupons Table Policies

| Policy Name | Operation | Description |
|-------------|-----------|-------------|
| Users can view their own coupons | SELECT | Users can only view coupons they own |
| Users can insert their own coupons | INSERT | Users can only insert coupons with their user_id |
| Users can update their own coupons | UPDATE | Users can only update coupons they own |
| Users can delete their own coupons | DELETE | Users can only delete coupons they own |
| Managers can view all coupons | SELECT | Managers can view all coupons |
| Managers can update any coupon | UPDATE | Managers can update any coupon |
| Managers can delete any coupon | DELETE | Managers can delete any coupon |
| Managers can insert coupons for any user | INSERT | Managers can insert coupons for any user |

### User Roles Table Policies

| Policy Name | Operation | Description |
|-------------|-----------|-------------|
| Users can view their own role | SELECT | Users can only view their own role |
| Users can update their own role | UPDATE | Users can only update their own role |
| Managers can view all user roles | SELECT | Managers can view all user roles |
| Managers can update any user role | UPDATE | Managers can update any user role |
| Managers can insert user roles | INSERT | Managers can insert new user roles |
| Managers can delete user roles | DELETE | Managers can delete user roles |

## How RLS Works with Supabase

When a user authenticates with Supabase, their user ID is available as `auth.uid()` in PostgreSQL. Our RLS policies use this function to determine if a user has access to a particular row.

For example, the policy "Users can view their own coupons" uses the condition `auth.uid() = user_id`, which only allows users to see rows where their user ID matches the `user_id` column.

## Testing RLS

To test RLS, you can:

1. Sign in as a regular user and verify they can only see their own data
2. Sign in as a manager and verify they can see all data
3. Try to access data that doesn't belong to the user and verify it's not accessible

## Migration Scripts

The following migration scripts were used to set up RLS:

1. `enable-rls-for-coupons.sql` - Enables RLS on the coupons table
2. `enable-rls-for-user-roles.sql` - Enables RLS on the user_roles table
3. `add-foreign-keys-for-rls.sql` - Adds foreign key constraints for RLS

## Best Practices

1. Always test RLS policies thoroughly
2. Remember that RLS only applies to queries made through Supabase, not direct database access
3. Keep foreign key constraints in sync with RLS policies
4. Use the `auth.uid()` function to identify the current user
5. Consider using row-level security for all tables that contain user data 
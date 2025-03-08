# Migration System Cleanup

This document summarizes the cleanup performed on the migration system after transitioning from the old JavaScript-based migrations to the new SQL-based migration system.

## Files Removed

### Scripts

- `scripts/migrate-to-supabase.js` - Old script for migrating to Supabase
- `scripts/test-supabase-connection.js` - Old script for testing Supabase connection
- `scripts/run-migrations.js` - Old script for running JavaScript migrations
- `scripts/create-supabase-table.sql` - Old SQL file for creating the coupons table

### Migration Files

- `migrations/20250306133422-create_coupons_table.js` - Old JavaScript migration
- `migrations/20250306133422-add_user_roles_and_coupon_ownership.js` - Old JavaScript migration
- `migrations/20250306150000-add-notes-to-coupons.js` - Old JavaScript migration
- `migrations/20250306160000-enable-rls-for-coupons.js` - Old JavaScript migration
- `migrations/20250306160001-enable-rls-for-user-roles.js` - Old JavaScript migration
- `migrations/20250306160002-add-foreign-keys-for-rls.js` - Old JavaScript migration
- `migrations/20250306160003-add-notes-to-coupons.js` - Old JavaScript migration
- `migrations/template.js` - Old JavaScript migration template
- `migrations/database.json` - Old migration configuration file

## Package.json Updates

The following scripts were updated in `package.json`:

- Removed: `migrate:supabase`, `test:supabase`, `migrate:down`
- Updated: `db:test` to use the new test-db-connection.js script
- Updated: `migrate:create` to use the new create-migration.js script

## Dependencies Updates

- Removed: `node-pg-migrate` - No longer needed with the SQL-based migration system
- Moved: `pg` from devDependencies to dependencies as it's now used in production code

## Current Migration System

The current migration system consists of:

- `scripts/run-sql-migrations.js` - Script for running SQL migrations
- `scripts/create-migration.js` - Script for creating new SQL migrations
- `scripts/test-db-connection.js` - Script for testing database connection
- `migrations/migrations.json` - Configuration file for migrations
- `migrations/sql/*.sql` - SQL migration files

## Benefits of the New System

1. **Simplicity**: Direct SQL migrations are easier to understand and maintain
2. **Portability**: SQL migrations can be run directly against the database if needed
3. **Transparency**: Clear visibility into exactly what changes are being made to the database
4. **Dependency Management**: Explicit dependency tracking between migrations
5. **Improved Documentation**: Comprehensive documentation in the migrations README

## Next Steps

The migration system is now fully transitioned to the SQL-based approach. All necessary files for the old system have been removed, and the new system is ready for use.

To create and run migrations, use the following commands:

```bash
# Create a new migration
pnpm migrate:create migration_name "Optional description"

# Run all pending migrations
pnpm migrate:up

# List all migrations and their status
pnpm migrate:list

# Check migration status
pnpm migrate:status
``` 
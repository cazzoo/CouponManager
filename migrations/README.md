# SQL Migration System

This directory contains database migrations for the Coupon Manager application. The migration system is designed to work directly with Supabase PostgreSQL databases.

## Migration Structure

The migration system consists of:

- `migrations.json`: Contains metadata about migrations, including dependencies
- `sql/*.sql`: SQL migration files that contain the actual database changes

## Setup

Before running migrations, make sure you have set up your `.env` file with the correct Supabase database credentials:

```
SUPABASE_DB_HOST=aws-0-region-number.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-ref
SUPABASE_DB_PASSWORD=your_database_password
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See `docs/supabase-setup.md` for detailed instructions on setting up your Supabase database connection.

## Testing the Connection

To test your database connection:

```bash
pnpm db:test
```

This will verify that your credentials are correct and that you can connect to the database.

## Running Migrations

To run all pending migrations:

```bash
pnpm migrate:up
```

This will apply any migrations that haven't been applied yet, in the correct order based on dependencies.

## Listing Migrations

To list all migrations and their status:

```bash
pnpm migrate:list
```

This will show which migrations have been applied and which are pending.

## Checking Migration Status

To check the overall status of migrations:

```bash
pnpm migrate:status
```

This will show how many migrations have been applied and how many are pending.

## Creating a New Migration

To create a new migration:

```bash
pnpm migrate:create migration_name "Optional description"
```

This will:
1. Create a new SQL file in the `sql/` directory with a timestamp-based name
2. Add the migration to `migrations.json`

After creating a migration, you should:
1. Edit the SQL file to add your database changes
2. Update the dependencies in `migrations.json` if needed

## Adding Mock Data

For testing purposes, you can add mock data to the database:

```bash
pnpm db:mock
```

This will:
1. Try to create test users in Supabase Auth (if the service role key is provided)
2. Temporarily disable Row Level Security (RLS) and foreign key constraints
3. Add sample user roles and coupons to the database
4. Re-enable RLS

The mock data includes:
- 3 sample users with the following credentials:

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| User    | user@example.com    | password123 |
| Manager | manager@example.com | password123 |
| User    | another@example.com | password123 |

- 7 sample coupons with various retailers, values, and expiration dates

### Creating Users Manually

Due to SSL certificate issues, the script may not be able to create users automatically. In this case, you'll need to create the users manually in the Supabase dashboard:

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click on **+ New User**
3. Create the users with the credentials shown in the table above
4. After creating the users, update the `fixedUserIds` array in `scripts/add-mock-data.js` with the actual UUIDs from Supabase:

```javascript
// Fixed UUIDs for test users (used as fallback)
const fixedUserIds = [
  'actual-uuid-for-user@example.com',    // Regular user
  'actual-uuid-for-manager@example.com', // Manager
  'actual-uuid-for-another@example.com'  // Another regular user
];
```

## Migration File Format

### SQL Migration Files

SQL migration files should follow this format:

```sql
-- Migration: Name of the migration
-- Description: Detailed description
-- Created at: Timestamp

-- Up Migration
-- Your SQL statements for applying the migration
CREATE TABLE IF NOT EXISTS example (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Down Migration
-- Commented out SQL statements for rolling back the migration
/*
DROP TABLE IF EXISTS example;
*/
```

### Dependencies in migrations.json

The `migrations.json` file contains an array of migration objects:

```json
[
  {
    "id": "20250306100000",
    "description": "Create coupons table",
    "file": "20250306100000-create_coupons_table.sql",
    "dependencies": []
  },
  {
    "id": "20250306100001",
    "description": "Add user roles",
    "file": "20250306100001-add_user_roles.sql",
    "dependencies": ["20250306100000"]
  }
]
```

The `dependencies` array specifies which migrations must be applied before this one.

## Existing Migrations

The following migrations are currently defined:

1. `20250306100000-create_coupons_table.sql`: Creates the initial coupons table
2. `20250306100001-add_user_roles_and_coupon_ownership.sql`: Adds user roles table and user_id to coupons
3. `20250306100002-enable_rls_for_coupons.sql`: Enables Row Level Security for coupons table
4. `20250306100003-enable_rls_for_user_roles.sql`: Enables Row Level Security for user_roles table
5. `20250306100004-add_foreign_keys_for_rls.sql`: Adds foreign key constraints for RLS
6. `20250306100005-add_notes_to_coupons.sql`: Adds a notes column to the coupons table

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check that your Supabase database credentials are correct in `.env`
2. Make sure your IP address is allowed in Supabase database settings
3. Verify that the database is accessible from your current network
4. Check if SSL is required for your Supabase database connection

### Best Practices

1. Always create a new migration for schema changes, never modify existing migrations
2. Include both "up" and "down" migrations when possible
3. Test migrations in a development environment before applying to production
4. Keep migrations small and focused on a single change
5. Use IF EXISTS/IF NOT EXISTS clauses to make migrations more robust

## How It Works

The migration system tracks applied migrations in a `migrations` table in your database. When you run migrations, it:

1. Checks which migrations have already been applied
2. Determines which migrations need to be applied
3. Applies pending migrations in the correct order
4. Records each successful migration in the `migrations` table

This ensures that migrations are only applied once and in the correct order. 
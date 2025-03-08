# Migration System Organization

This document explains the organization of the migration system for the Coupon Manager application.

## Directory Structure

```
CouponManager/
├── migrations/
│   ├── migrations.json     # List of migrations with metadata and dependencies
│   ├── sql/                # SQL migration files
│   │   ├── 20250306100000-create_coupons_table.sql
│   │   ├── 20250306100001-add_user_roles_and_coupon_ownership.sql
│   │   └── ...
│   └── README.md           # Documentation for the migration system
├── scripts/
│   ├── add-mock-data.js    # Script to add mock data for testing
│   ├── create-migration.js # Script to create new migrations
│   ├── run-sql-migrations.js # Script to run migrations
│   ├── test-db-connection.js # Script to test database connection
│   └── ...
└── ...
```

## File Locations

### SQL Migration Files

All SQL migration files should be stored in the `migrations/sql/` directory. These files contain the actual SQL statements that modify the database schema.

Each migration file follows this naming convention:
```
YYYYMMDDHHMMSS-descriptive_name.sql
```

For example:
```
20250306100000-create_coupons_table.sql
```

### Migration Scripts

The scripts that manage migrations are stored in the `scripts/` directory:

- `create-migration.js`: Creates new migration files
- `run-sql-migrations.js`: Runs pending migrations
- `test-db-connection.js`: Tests the database connection
- `add-mock-data.js`: Adds mock data for testing

## Environment Setup

To use the migration system, you need to set up your `.env` file with the following variables:

```
# Database connection details for migrations
SUPABASE_DB_HOST=aws-0-region-number.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-ref
SUPABASE_DB_PASSWORD=your_database_password

# Supabase API
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The `SUPABASE_SERVICE_ROLE_KEY` is required to create test users automatically. If this key is not provided, the mock data script will use fixed UUIDs and you'll need to create the users manually in the Supabase dashboard.

## Best Practices

1. **Keep SQL files in one place**: All SQL migration files should be in the `migrations/sql/` directory only.

2. **Use descriptive names**: Migration filenames should clearly describe what the migration does.

3. **Maintain dependencies**: Update the `migrations.json` file to specify dependencies between migrations.

4. **Document migrations**: Each migration should include comments explaining what it does.

5. **Test migrations**: Always test migrations in a development environment before applying them to production.

## Commands

```bash
# Create a new migration
pnpm migrate:create migration_name "Optional description"

# Run all pending migrations
pnpm migrate:up

# List all migrations and their status
pnpm migrate:list

# Check migration status
pnpm migrate:status

# Add mock data for testing
pnpm db:mock
```

## Mock Data

The `pnpm db:mock` command creates test users and sample data for testing. It:

1. Creates test users in Supabase Auth (if the service role key is provided)
2. Temporarily disables Row Level Security (RLS) and foreign key constraints
3. Adds sample user roles and coupons to the database
4. Re-enables RLS

The mock data includes:

- 3 sample users with the following credentials:

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| User    | user@example.com    | password123 |
| Manager | manager@example.com | password123 |
| User    | another@example.com | password123 |

- 7 sample coupons with various retailers, values, and expiration dates

## Migration Process

1. Create a new migration using `pnpm migrate:create`
2. Edit the SQL file to add your database changes
3. Update dependencies in `migrations.json` if needed
4. Run the migration using `pnpm migrate:up`
5. Verify the migration was applied using `pnpm migrate:status`

For more detailed information, see the [migrations README](../migrations/README.md). 
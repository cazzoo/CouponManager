# SQL Migration System Implementation

This document provides an overview of the SQL migration system implementation for the Coupon Manager application.

## System Overview

The SQL migration system is designed to manage database schema changes in a structured and version-controlled way. It works directly with Supabase PostgreSQL databases and provides a simple interface for creating, tracking, and applying migrations.

## Key Components

### Files and Directories

- `migrations/migrations.json`: Contains metadata about migrations, including dependencies
- `migrations/sql/*.sql`: SQL migration files that contain the actual database changes
- `migrations/README.md`: Documentation for the migration system
- `scripts/run-sql-migrations.js`: Script for running migrations
- `scripts/create-migration.js`: Script for creating new migrations
- `scripts/test-db-connection.js`: Script for testing database connection
- `.env.example`: Example environment variables file
- `docs/supabase-setup.md`: Documentation for setting up Supabase database connection

### NPM Scripts

The following scripts are available in `package.json`:

- `db:test`: Test database connection
- `migrate`: Run all pending migrations
- `migrate:up`: Run all pending migrations (alias for `migrate`)
- `migrate:list`: List all migrations and their status
- `migrate:status`: Check migration status
- `migrate:create`: Create a new migration

## Implementation Details

### Migration Tracking

Migrations are tracked in a `migrations` table in the database with the following schema:

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Files

Each migration file is a SQL file with the following structure:

```sql
-- Migration: Name of the migration
-- Description: Detailed description
-- Created at: Timestamp

-- Up Migration
-- SQL statements for applying the migration

-- Down Migration
-- Commented out SQL statements for rolling back the migration
```

### Migration Execution

The migration system:

1. Connects to the database using credentials from `.env`
2. Ensures the `migrations` table exists
3. Loads migrations from `migrations.json`
4. Gets applied migrations from the database
5. Determines which migrations need to be applied
6. Applies pending migrations in the correct order
7. Records each successful migration in the `migrations` table

### Dependencies

Migrations can depend on other migrations. Dependencies are specified in the `migrations.json` file. The system ensures that migrations are applied in the correct order based on these dependencies.

## Security Considerations

- Database credentials are stored in `.env` (not committed to version control)
- SSL is enabled for database connections
- The system uses parameterized queries to prevent SQL injection

## Future Improvements

Potential future improvements to the migration system:

1. **Rollback Support**: Implement support for rolling back migrations
2. **Migration Verification**: Add a command to verify that applied migrations match the expected state
3. **Migration Dry Run**: Add a command to simulate running migrations without actually applying them
4. **Migration Locking**: Implement a locking mechanism to prevent concurrent migrations
5. **Migration Hooks**: Add support for pre and post-migration hooks

## Conclusion

The SQL migration system provides a robust way to manage database schema changes for the Coupon Manager application. It ensures that migrations are applied in the correct order and only once, making it safe to run migrations multiple times. 
# Supabase Database Setup Guide

This guide provides detailed instructions for setting up and connecting to your Supabase database for the Coupon Manager application.

## Prerequisites

- A Supabase account and project
- Access to the Supabase dashboard
- Your local development environment set up

## Step 1: Get Database Connection Details

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Project Settings** > **Database**
4. Scroll down to the **Connection Pooling** section
5. Note down the following information:
   - Host: `aws-0-region-number.pooler.supabase.com` (from Connection Pooling)
   - Port: `5432` (default)
   - Database Name: `postgres` (default)
   - User: `postgres.your-project-ref` (from Connection Pooling)
   - Password: (shown in the dashboard)

## Step 2: Get API Keys

1. In your Supabase dashboard, go to **Project Settings** > **API**
2. Note down the following information:
   - Project URL: `https://your-project-ref.supabase.co`
   - API Keys:
     - `anon` public key (for client-side code)
     - `service_role` key (for server-side code and admin operations)

The service role key has admin privileges and should be kept secure. It's required for operations like creating users programmatically.

## Step 3: Configure IP Allow List

By default, Supabase restricts database access to specific IP addresses for security reasons.

1. In your Supabase dashboard, go to **Project Settings** > **Database**
2. Scroll down to the **Connection Pooling** section
3. Click on **Configure**
4. Add your current IP address to the allow list
   - You can find your current IP by searching "what is my IP" on Google
   - For development, you can add your IP address
   - For production, add your server's IP address

## Step 4: Update Environment Variables

1. Open the `.env` file in your project root
2. Update the following variables with your Supabase database connection details:

```
# Database connection details for migrations
SUPABASE_DB_HOST=aws-0-region-number.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-ref
SUPABASE_DB_PASSWORD=your_database_password

# Supabase API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 5: Test Database Connection

1. Run the database connection test script:

```bash
pnpm db:test
```

2. If successful, you should see a message confirming the connection
3. If unsuccessful, review the error message and troubleshooting tips

## Step 6: Run Migrations

Once your connection is working, you can run the database migrations:

```bash
# Run all pending migrations
pnpm migrate:up
```

You can also check the status of migrations:

```bash
# List all migrations and their status
pnpm migrate:list

# Check migration status
pnpm migrate:status
```

## Step 7: Add Test Data (Optional)

To add test data for development and testing:

```bash
# Add sample users and coupons
pnpm db:mock
```

This will create test users with the following credentials:

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| User    | user@example.com    | password123 |
| Manager | manager@example.com | password123 |
| User    | another@example.com | password123 |

Note: Creating users requires the `SUPABASE_SERVICE_ROLE_KEY` to be set in your `.env` file.

## Creating New Migrations

To create a new migration:

```bash
# Create a new migration file
pnpm migrate:create migration_name "Optional description"
```

This will create a new SQL migration file in the `migrations/sql` directory and add it to the migrations list.

## Troubleshooting

### Connection Issues

If you encounter the error `getaddrinfo ENOTFOUND`:

1. Verify the hostname is correct
2. Check your internet connection
3. Ensure DNS resolution is working properly

### Authentication Issues

If you see errors like `password authentication failed`:

1. Double-check your password in the `.env` file
2. Ensure you're using the correct user (usually `postgres.your-project-ref`)
3. Verify the password hasn't been changed in the Supabase dashboard

### Permission Issues

If you see errors about insufficient privileges:

1. Make sure your IP address is in the allow list
2. Check that the database user has the necessary permissions
3. Verify you're connecting to the correct database

### SSL Issues

Supabase requires SSL connections. If you're having SSL-related issues:

1. Make sure your connection configuration includes `ssl: true`
2. For some environments, you may need to set `rejectUnauthorized: false`

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 
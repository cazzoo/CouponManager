# Coupon Manager

A modern web application for managing vouchers and coupons with an intuitive user interface.

[![Build and Test](https://github.com/cazzoo/CouponManager/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/cazzoo/CouponManager/actions/workflows/build-and-test.yml)
[![Statements](./badges/coverage/statements-badge.svg)](./badges/coverage/statements-badge.svg)
[![Lines](./badges/coverage/lines-badge.svg)](./badges/coverage/lines-badge.svg)
[![Functions](./badges/coverage/functions-badge.svg)](./badges/coverage/functions-badge.svg)
[![Branches](./badges/coverage/branches-badge.svg)](./badges/coverage/branches-badge.svg)

[View Detailed Coverage Report](https://cazzoo.github.io/CouponManager/)

## Overview

Coupon Manager helps users track and manage their gift cards, vouchers, and coupons. It provides a clean, responsive interface for managing coupon details including retailer information, values, expiration dates, and usage status.

> 🚨 **Platform Compatibility Warning:** The Cypress testing framework cannot be executed on macOS 26.2 due to a binary path incompatibility issue. If you're on macOS 26.2, use CI/CD, Docker, or a VM for running tests. See the [Testing](#testing) section below and [`docs/cypress-known-issues.md`](docs/cypress-known-issues.md) for details and workarounds.

## Key Features

- Add, edit, and track coupons with detailed information
- View aggregated statistics by retailer
- Filter by retailer, amount range, and expiration status
- Dark/light theme support
- Barcode scanning for quick coupon entry
- Support for partial coupon usage
- User management functionality with role-based access control
- Role-based access control with three distinct user roles
- Internationalization support (English, Spanish, French, and German)
- Fully responsive design optimized for both desktop and mobile
- Supabase integration for database and authentication
- Database migration system for managing schema changes
- Local memory database for development mode

## Getting Started

### Prerequisites

- Node.js v18 or higher
- pnpm (recommended) or npm
- Supabase account (for database and authentication)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/cazzoo/CouponManager.git
cd CouponManager

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The development server automatically uses a local in-memory database with mock data pre-populated, so you can start developing immediately without setting up Supabase. See the [Local Memory Database documentation](./docs/local-memory-db.md) for more details.

If you need to test with the actual Supabase database:

```bash
# Start the dev server with Supabase database connection
pnpm dev:supabase
```

Open your browser and navigate to `http://localhost:3000`

### Supabase Setup

1. Create a Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Copy your Supabase URL and API key from the project settings
3. Create a `.env` file in the project root with the following content:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database connection details for migrations
SUPABASE_DB_HOST=aws-0-region-number.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-ref
SUPABASE_DB_PASSWORD=your_database_password
```

4. Test your database connection:

```bash
pnpm db:test
```

5. Set up the database schema by running migrations:

```bash
# Run migrations to create database schema
pnpm migrate:up
```

6. Add mock data for testing (optional):

```bash
# Add sample users and coupons
pnpm db:mock
```

This will add sample coupons and user roles to the database. Due to SSL certificate issues, you may need to manually create the test users in the Supabase dashboard:

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click on **+ New User**
3. Create the following users:

| Role    | Email               | Password    | Description          |
|---------|---------------------|-------------|----------------------|
| User    | user@example.com    | password123 | Standard user        |
| Manager | manager@example.com | password123 | Administrator        |
| User    | another@example.com | password123 | Another standard user|
| Demo    | demo@example.com    | demo        | Demo user (limited)  |

4. After creating the users, update the `fixedUserIds` array in `scripts/add-mock-data.js` with the actual UUIDs from Supabase.

For detailed information about the migration system organization, see the [Migration System Organization](./docs/migration-system-organization.md) document.

For detailed instructions on setting up Supabase, see the [Supabase Setup Guide](./docs/supabase-setup.md).

### User Roles and Permissions

The application implements a robust role-based access control system with three user roles:

1. **Demo User**: Limited access for demonstration purposes. Can only view coupons, not create/edit/delete.
2. **User**: Standard role with ability to manage their own coupons.
3. **Manager**: Administrative role with access to user management and all system functions.

For a detailed breakdown of permissions, see the [Permission Matrix](./docs/permission-matrix.md) documentation.

### Database Migrations

The project uses a SQL-based migration system that works directly with Supabase.

```bash
# Test database connection
pnpm db:test

# Run all pending migrations
pnpm migrate:up

# List all migrations and their status
pnpm migrate:list

# Check migration status
pnpm migrate:status

# Create a new migration
pnpm migrate:create migration_name "Optional description"

# Add mock data for testing
pnpm db:mock
```

For more information on migrations, see the [migrations README](./migrations/README.md).

### Testing

> 🚨 **Critical Platform Compatibility Issue:** Cypress cannot be executed on macOS 26.2 due to a binary path incompatibility. This is a framework-level issue that cannot be fixed at the project level. If you're on macOS 26.2, use the workarounds below.

**Platform Compatibility:**

| Platform | Status | Notes |
|----------|--------|-------|
| Linux | ✅ Compatible | All versions supported |
| Windows | ✅ Compatible | All versions supported |
| macOS 24.x and earlier | ✅ Compatible | All versions supported |
| macOS 25.2.0 | ❌ Incompatible | Binary incompatibility |
| macOS 26.2.0 | ❌ Incompatible | Binary path incompatibility |
| macOS 27.x and later | ✅ Compatible | If available |

**Running Tests on Compatible Platforms:**

```bash
# Run all E2E tests
pnpm cypress:run

# Run all component tests
pnpm cypress:component:run

# Open Cypress Test Runner for interactive testing
pnpm cypress:open

# Open Cypress Component Test Runner
pnpm cypress:component:open
```

**Workarounds for macOS 26.2:**

1. **Use CI/CD (Recommended):**
   - Push your code changes to trigger CI/CD pipelines
   - Review test results from CI/CD
   - GitHub Actions uses compatible Linux environments

2. **Use Docker:**
   ```bash
   # Run E2E tests in Docker
   docker run -it -v $PWD:/e2e -w /e2e cypress/included:15.9.0

   # Run component tests in Docker
   docker run -it -v $PWD:/e2e -w /e2e cypress/included:15.9.0 cypress run --component
   ```

3. **Use Virtual Machines:**
   - Set up a VM with Linux, Windows, or compatible macOS
   - Run tests in the VM environment

4. **Use Cloud-Based Testing Services:**
   - BrowserStack, Sauce Labs, or TestingBot
   - No local environment setup required

**For More Information:**
- See [`docs/cypress-known-issues.md`](docs/cypress-known-issues.md) for detailed technical information
- See [`docs/cypress-migration-summary.md`](docs/cypress-migration-summary.md) for migration status
- See [`docs/cypress-testing-guide.md`](docs/cypress-testing-guide.md) for testing guide

## Current Status

- All core features implemented and fully functional
- User management functionality with role-based permissions
- 80% test coverage
- Barcode scanning functionality implemented
- Internationalization system in place with support for four languages
- Fully responsive design for desktop and mobile
- Some minor issues with barcode scanner on certain Android devices are being addressed

## Documentation

For detailed information about the project, please refer to the documentation:

- [Product Requirements (PRD)](docs/prd.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Internationalization System](docs/i18n-system.md)
- [Permission Matrix](docs/permission-matrix.md)
- [User Management](docs/user-management.md)
- [Code Style Guidelines](docs/code-style.md)
- [Contributing Guidelines](docs/contributing.md)
- [Testing Standards](docs/testing-standards.md)
- [Cypress Testing Guide](docs/cypress-testing-guide.md)
- [Current Project Status](docs/project-status/status.md)
- [Future Development Plans](docs/project-status/todo.md)

## Upcoming Features

- Optimized rendering performance for coupon list on mobile devices
- Notification system for expiring coupons
- Enhanced user management capabilities
- Data export/import functionality
- Advanced search capabilities with tags and categories

## License

MIT
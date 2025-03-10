# Local Memory Database for Development

This document explains how to use and configure the local memory database feature for development environments.

## Overview

When developing locally, it can be beneficial to use an in-memory database instead of connecting to the remote Supabase database. This offers several advantages:

- Faster development cycles without network latency
- Development without internet connection
- No risk of modifying production data
- Simplified testing environment
- No need to set up Supabase credentials for new developers

## How It Works

The application uses a factory pattern for both data and authentication services:

1. `CouponServiceFactory.js` - Selects between in-memory and Supabase implementations for data
2. `AuthServiceFactory.js` - Selects between mock and Supabase implementations for authentication
3. `MSW (Mock Service Worker)` - Intercepts and mocks API requests when in development mode

The factories automatically detect which npm script is being used and configure the services accordingly.

## Development Scripts

The project includes several npm scripts for different development scenarios:

```bash
# Default development script - uses memory database with auto mock data
pnpm dev

# Development with memory database and auto mock data (same as dev)
pnpm dev:memory

# Development with Supabase (for testing real database connections)
pnpm dev:supabase
```

### Environment Variables

Under the hood, the scripts set environment variables to control the behavior:

- `VITE_USE_MEMORY_DB` - Determines whether to use in-memory database (`true`) or Supabase (`false`)
- `VITE_AUTO_MOCK_DATA` - Controls whether to automatically inject mock data when using in-memory database

## Mock Users for Development

When running in development mode with the in-memory database, you can log in with the following pre-defined users:

| Email               | Password    | Role    | Description       |
|---------------------|-------------|---------|-------------------|
| user@example.com    | password123 | User    | Regular user      |
| manager@example.com | password123 | Manager | Manager user      |
| admin@example.com   | password123 | Admin   | Admin user        |
| demo@example.com    | demo        | User    | Demo account      |

These users are automatically available when running with `pnpm dev` or `pnpm dev:memory` and do not require Supabase authentication.

## Automatic Mock Data

When running with `pnpm dev` or `pnpm dev:memory`, the system automatically injects predefined mock data for testing. This gives you a consistent starting point for development and testing without needing to manually add data.

The mock data includes several coupon examples with various states:
- Active coupons with full value
- Partially used coupons
- Soon-to-expire coupons
- Expired but unused coupons
- Expired and used coupons

## Mock Service Worker (MSW)

The application uses MSW to intercept API requests and provide mock responses in development mode. This allows for complete separation from Supabase during development.

MSW handlers are defined in `/src/mocks/handlers.js` and automatically activated when running in memory database mode.

## UI Indicator

When running in development mode with the in-memory database enabled, a blue info alert appears at the top of the application that:

1. Indicates you're using the in-memory database
2. Shows whether mock data is automatically injected
3. Provides instructions for switching to Supabase if needed

This helps developers understand the current environment configuration.

## Data Persistence

Since the in-memory database exists only in memory during runtime, all data is lost when:

- The application is restarted
- The page is refreshed
- The development server is restarted

This behavior is by design, providing a clean slate for testing. If you need persistent data during development, use one of these approaches:

1. Run with `pnpm dev:supabase` to use the Supabase database
2. Modify the mock data in the `/src/mocks/data` directory

## Adding Custom Mock Data

If you need to customize the mock data, you can modify the files in the `/src/mocks/data` directory:

- `/src/mocks/data/coupons.js` - Mock coupon data
- `/src/mocks/data/users.js` - Mock user data

## Troubleshooting

### Data Disappears on Refresh

This is the expected behavior with the in-memory database. If you need data persistence, use the Supabase database with `pnpm dev:supabase`.

### Authentication Issues

When using the in-memory database, the application uses a mock authentication service that simulates the Supabase authentication API. If you encounter issues:

1. Check that you're using one of the predefined mock users
2. Make sure MSW is properly initialized (check console for "[MSW] Mock Service Worker activated" message)
3. Try clearing your browser's local storage and refreshing

### Missing Features

If you encounter missing features when using the in-memory database, it might be because the mock implementation doesn't support all features of the Supabase implementation. Check the respective mock services and add the missing functionality if necessary. 
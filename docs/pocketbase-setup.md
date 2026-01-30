# PocketBase Setup Guide

This guide explains how to set up PocketBase for the CouponManager application.

## Overview

PocketBase is an open-source Go framework that provides:
- SQLite database (self-hosted)
- Built-in authentication
- REST API
- Real-time subscriptions
- Admin UI for collection management

## Prerequisites

- Node.js 18+ (for running the application)
- No additional requirements - PocketBase is a single binary

## Quick Start

### 1. Download PocketBase

Download the latest PocketBase release for your operating system:

```bash
# macOS (Intel)
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip

# macOS (Apple Silicon)
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_arm64.zip

# Linux
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip

# Windows
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_windows_amd64.zip
```

Extract the archive:

```bash
unzip pocketbase_0.22.0_*.zip
```

### 2. Start PocketBase Server

Run the PocketBase binary:

```bash
./pocketbase serve
```

Or use the npm script:

```bash
pnpm pb:start
```

By default, PocketBase will:
- Listen on `http://127.0.0.1:8090`
- Store data in `pb_data/` directory
- Expose admin UI at `http://127.0.0.1:8090/_/`

### 3. Initialize PocketBase

Run the setup script to create admin user and configuration:

```bash
pnpm pb:setup
```

This will:
- Check PocketBase connection
- **Automatically create the first admin user** if it doesn't exist (using credentials from `.env`)
- Verify admin credentials are correct
- Prepare for collection creation

**Note:** The setup script handles both scenarios automatically:
- **Fresh PocketBase instance**: Creates admin using CLI command
- **Existing admin**: Validates credentials from `.env`

Admin credentials (from `.env`):
- Email: `admin@example.com` (default)
- Password: `admin12345` (default)

### 4. Create Collections

You can create collections in two ways:

#### Option A: Manual (Recommended)

1. Access Admin UI: http://127.0.0.1:8090/_/
2. Login with admin credentials (default: `admin@example.com` / `admin123`)
3. Create collections with the following structure:

**Collection: coupons**

| Field | Type | Required | Options |
|--------|--------|-----------|----------|
| retailer | text | Yes | - |
| initialValue | text | Yes | - |
| currentValue | text | Yes | - |
| expirationDate | date | No | - |
| activationCode | text | No | - |
| pin | text | No | - |
| barcode | text | No | - |
| reference | text | No | - |
| notes | editor | No | - |
| userId | relation | Yes | Collection: _users, Cascade Delete: No |

**API Rules for coupons:**

- **List rule**: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`
- **View rule**: Same as list rule
- **Create rule**: `null` (allow authenticated users)
- **Update rule**: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`
- **Delete rule**: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`

**Indexes:**
- `userId`
- `retailer`
- `created`

**Collection: user_roles**

| Field | Type | Required | Options |
|--------|--------|-----------|----------|
| userId | relation | Yes | Collection: _users, Cascade Delete: Yes |
| role | select | Yes | Values: user, manager, demo |

**API Rules for user_roles:**

- **List rule**: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`
- **View rule**: Same as list rule
- **Create rule**: `@request.auth.id != "" && (userId = @request.auth.id || @request.auth.id.role = "manager")`
- **Update rule**: Same as create rule
- **Delete rule**: Same as create rule

**Indexes:**
- `userId`

#### Option B: Automatic (with Admin Credentials)

If you have admin credentials set in `.env`, you can use:

```bash
pnpm pb:create-collections --api
```

Note: This requires `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` in `.env`.

### 5. Seed Test Data (Optional)

For development with sample data:

```bash
pnpm db:seed
```

This will create:
- 3 test users (user@example.com, manager@example.com, another@example.com)
- User roles for all users
- 7 sample coupons distributed among users

Test credentials:
- **Regular user**: user@example.com / pass123
- **Manager**: manager@example.com / pass123
- **Another user**: another@example.com / pass123

### 6. Configure Application

Update `.env` file:

```bash
# PocketBase URL (change if running on different host/port)
VITE_POCKETBASE_URL=http://127.0.0.1:8090

# Auto-seed data in development
VITE_AUTO_MOCK_DATA=true
```

### 7. Start Development Server

```bash
pnpm dev
```

The application will be available at: http://localhost:3000

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|-----------|----------|
| `VITE_POCKETBASE_URL` | PocketBase server URL | Yes | http://127.0.0.1:8090 |
| `PB_ADMIN_EMAIL` | Admin email for setup/seeding | No | admin@example.com |
| `PB_ADMIN_PASSWORD` | Admin password for setup/seeding | No | admin123 |
| `VITE_AUTO_MOCK_DATA` | Auto-seed test data | No | false |

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm pb:start` | Start PocketBase server |
| `pnpm pb:setup` | Initialize PocketBase (create admin) |
| `pnpm pb:create-collections` | Generate collection config (see above) |
| `pnpm pb:create-collections --api` | Create collections via API |
| `pnpm db:seed` | Seed test data |
| `pnpm pb:reset` | Reset PocketBase (delete all data, preserves .env) |

## Database Schema

### coupons Collection

Stores coupon information with user ownership.

**Fields:**
- `id` (auto-generated string)
- `retailer` (text) - Store/brand name
- `initialValue` (text) - Original coupon value
- `currentValue` (text) - Remaining value
- `expirationDate` (date, optional) - Expiration date
- `activationCode` (text, optional) - Activation code
- `pin` (text, optional) - PIN number
- `barcode` (text, optional) - Barcode data
- `reference` (text, optional) - Reference number
- `notes` (editor, optional) - User notes
- `userId` (relation) - Link to _users collection
- `created` (date, auto) - Creation timestamp
- `updated` (date, auto) - Last update timestamp

### user_roles Collection

Stores user role assignments.

**Fields:**
- `id` (auto-generated string)
- `userId` (relation) - Link to _users collection
- `role` (select) - Role: user, manager, or demo
- `created` (date, auto) - Creation timestamp
- `updated` (date, auto) - Last update timestamp

## Permission System

The application uses **application-level permissions** instead of database-level RLS.

### Roles

- **user**: Regular user with limited access
- **manager**: Full system access
- **demo**: Read-only access to sample data

### Permissions

| Permission | User | Manager | Demo |
|------------|-------|----------|-------|
| `viewOwnCoupons` | ✓ | ✓ | ✓ |
| `viewAnyCoupon` | ✗ | ✓ | ✗ |
| `createCoupon` | ✓ | ✓ | ✗ |
| `editCoupon` | ✓ (own only) | ✓ (any) | ✗ |
| `deleteCoupon` | ✓ (own only) | ✓ (any) | ✗ |
| `viewUsers` | ✗ | ✓ | ✗ |
| `editUserRole` | ✗ | ✓ | ✗ |
| `manageSystem` | ✗ | ✓ | ✗ |

### Ownership Verification

- Regular users can only access/edit/delete their own coupons
- Managers can access/edit/delete any coupon
- Ownership is verified in service layer before each operation

## Migration from Supabase

If you're migrating from Supabase:

1. Export data from Supabase (use Supabase dashboard or CLI)
2. Convert data format to match PocketBase schema
3. Import via PocketBase Admin UI or create import script
4. Update auth tokens (users will need to reset passwords)

Key differences:
- Supabase uses PostgreSQL with RLS → PocketBase uses SQLite with API rules
- Supabase `user_id` → PocketBase `userId`
- Supabase `auth.users` → PocketBase `_users`
- Supabase snake_case → PocketBase camelCase

## Troubleshooting

### Resetting PocketBase

If you need to start fresh with a clean PocketBase instance:

```bash
# Stop PocketBase (Ctrl+C)
# Run the reset script
pnpm pb:reset
```

The reset script will:
1. Check if PocketBase is running on port 8090
2. Prompt you to confirm the reset action
3. Delete all PocketBase data (`pb_data/`, `pb_public/`, `pb_migrations/`)
4. **Preserve** your `.env` configuration (admin credentials, URL settings)
5. Display next steps for setting up a fresh instance

**Note:** This will permanently delete all users, coupons, and roles. Use with caution.

### PocketBase won't start

```bash
# Check if port 8090 is in use
lsof -i :8090

# Use different port
./pocketbase serve --http=0.0.0.0:8091
```

### Can't connect to PocketBase

```bash
# Verify PocketBase is running
curl http://127.0.0.1:8090/api/health

# Check firewall settings
# Ensure port 8090 is open
```

### Collection creation fails

- Ensure admin user exists
- Check PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD in .env
- Try manual creation via Admin UI

### Application errors

```bash
# Check browser console for PocketBase errors
# Verify VITE_POCKETBASE_URL is correct
# Check that collections exist and have correct fields
```

## Production Deployment

### Deploying PocketBase

1. **Choose hosting:**
   - VPS (DigitalOcean, AWS, etc.)
   - PaaS (Render, Railway, Fly.io)
   - Self-hosted (on-premise server)

2. **Upload PocketBase:**
   ```bash
   # On server
   ./pocketbase serve --http=0.0.0.0:8090
   ```

3. **Configure reverse proxy (recommended):**
   ```nginx
   location /api/ {
       proxy_pass http://127.0.0.1:8090;
   }
   ```

4. **Set up SSL:**
   - Use Let's Encrypt with nginx/certbot
   - Or use Cloudflare SSL

5. **Update environment:**
   ```bash
   VITE_POCKETBASE_URL=https://your-domain.com/api
   ```

6. **Backup strategy:**
   - Back up `pb_data/` directory regularly
   - Consider using SQLite backups
   ```bash
   cp -r pb_data backups/pb_data_$(date +%Y%m%d)
   ```

### Scaling Considerations

- PocketBase is single-server (not distributed)
- Use read replicas for high-traffic reads
- Consider connection pooling for high concurrency
- Monitor CPU/memory usage

## Security Best Practices

1. **Strong admin password**
   ```bash
   # Set in .env
   PB_ADMIN_PASSWORD=your-very-strong-password
   ```

2. **API rules**
   - Implement strict access control
   - Use `@request.auth.id` checks
   - Limit admin operations

3. **HTTPS**
   - Use SSL in production
   - Validate certificates
   - HSTS headers

4. **Data backup**
   - Regular automated backups
   - Test restore procedures
   - Store backups securely

5. **Rate limiting**
   - Implement at reverse proxy level
   - Consider DDoS protection
   - Monitor abuse

## Additional Resources

- [PocketBase Documentation](https://pocketbase.io/docs)
- [PocketBase GitHub](https://github.com/pocketbase/pocketbase)
- [JavaScript SDK](https://github.com/pocketbase/js-sdk)
- [Community Forum](https://github.com/pocketbase/pocketbase/discussions)

## Support

For issues with CouponManager:
- Check logs in browser console
- Verify PocketBase is running
- Ensure collections are created correctly
- Check API rules are applied

For PocketBase issues:
- Check PocketBase logs
- Review PocketBase documentation
- Search GitHub issues
- Join PocketBase community
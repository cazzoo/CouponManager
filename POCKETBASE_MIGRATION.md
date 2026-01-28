# PocketBase Setup with ThirdParty Binaries

## Overview

Successfully set up CouponManager to use PocketBase v0.36.1 with checked-in thirdparty binaries. This document summarizes the changes and provides setup instructions.

## What Changed

### Dependencies
**Removed:**
- `pocketbase` npm package (was v0.26.7, now replaced with local binary)
- All Supabase-related dependencies and services

**Added/Updated:**
- `pocketbase` v0.26.7 removed from dependencies (replaced by local binary)
- All project scripts now use `./thirdparty/pocketbase/pocketbase` binary

### Directory Structure
**Created:**
- `thirdparty/pocketbase/` - Contains PocketBase v0.36.1 binaries for all platforms
  - `pocketbase-darwin-arm64` - macOS Apple Silicon (ARM64)
  - `pocketbase-darwin-amd64` - macOS Intel x64
  - `pocketbase-linux-amd64` - Linux x64
  - `pocketbase-windows-amd64.exe` - Windows x64
  - `.gitkeep` - Ensures directory is tracked by git

**Updated:**
- `migrations/` - Contains PocketBase v0.36.1 migration files
  - `002_create_collections.js` - Creates coupons and retailers collections

### Services
**Updated:**
- All services continue to implement `IAuthService`, `ICouponService`, `IRoleService` interfaces
- Services now use PocketBase v0.36.1 via local binary in thirdparty directory
- Removed all Supabase-specific services and clients

### Configuration
**Updated:**
- `package.json` - Updated scripts to use thirdparty binary paths
- `.gitignore` - Excludes runtime data (pb_data/) but includes binaries
- `scripts/pocketbase-create-collections.mjs` - Updated to use thirdparty binary
- `SETUP.md` - Updated with thirdparty setup instructions
- `docs/THIRDPARTY_SETUP.md` - Created comprehensive thirdparty setup guide

### Documentation
**Created:**
- `docs/THIRDPARTY_SETUP.md` - Detailed guide for thirdparty binary setup
- Covers: Platform detection, download process, troubleshooting, migration system

### Scripts
**Created:**
- `scripts/setup-thirdparty.sh` - Automated setup script for downloading all platform binaries
  - Detects platform automatically
  - Downloads v0.36.1 from GitHub releases
  - Sets executable permissions
  - Verifies file sizes (~48MB each)
  - Supports: macOS ARM64/Intel, Linux x64, Windows x64

**Updated:**
- `scripts/pocketbase-create-collections.mjs` - Now uses `./thirdparty/pocketbase/pocketbase`

## Architecture

### Before (Supabase)
```
Application
  ↓
AuthContext → AuthService (Supabase)
  ↓
CouponContext → CouponService (Supabase)
  ↓
RoleService (Supabase)
  ↓
SupabaseClient → Supabase Cloud
  ↓
PostgreSQL Database (with RLS)
```

### After (PocketBase)
```
Application
  ↓
AuthContext → PocketBaseAuthService
  ↓
CouponContext → PocketBaseCouponService
  ↓
PocketBaseRoleService
  ↓
PocketBaseClient (thirdparty/pocketbase/pocketbase)
  ↓
SQLite Database (with API Rules)
```

## Key Differences

| Aspect | Supabase | PocketBase |
|--------|-----------|-------------|
| **Database** | PostgreSQL (cloud) | SQLite (local file) |
| **Scalability** | Cloud-managed, auto-scaling | Single server, needs manual scaling |
| **Auth** | Built-in with OAuth | Built-in email/password |
| **Permissions** | RLS (database-level) | API rules (collection-level) |
| **Real-time** | Subscriptions out-of-box | Requires additional setup |
| **Hosting** | Cloud-hosted | Self-hosted |
| **Latency** | Network-dependent | Lower (local) |
| **Setup Complexity** | Medium (cloud config) | Low (run binary) |
| **Migration** | SQL migrations | JS migrations (via binary) |
| **Cost** | Usage-based | Free (self-hosted) |

## Migration System

PocketBase v0.36.1 includes a comprehensive migration system:

### Running Migrations
```bash
# Make sure PocketBase server is STOPPED before running migrations

# Run migrations
pnpm pb:create-collections

# Or directly
./thirdparty/pocketbase/pocketbase migrate up --migrationsDir ./migrations
```

### Migration Files
- `migrations/002_create_collections.js` - Creates coupons and retailers collections

**Important Notes:**
- Server must be STOPPED before running migrations
- Migration files must be in `migrations/` directory
- Use `--dev` flag to see SQL statements for debugging

### Manual Step Required
After migration completes, manually add the `userId` relation field to the coupons collection via PocketBase Admin UI.

## Setup Instructions

### First-Time Setup

1. **Download and Setup ThirdParty Binaries**
   ```bash
   pnpm setup:thirdparty
   ```

2. **Start PocketBase Server**
   ```bash
   pnpm pb:start
   ```

3. **Create Admin User (First Run Only)**
   - Open http://127.0.0.1:8090/_/ in browser
   - Create admin account
   - Save credentials to `.env`

4. **Run Migrations**
   ```bash
   # Stop PocketBase server first
   pnpm pb:create-collections
   ```

5. **Add userId Relation (Manual Step)**
   - Open Admin UI at http://127.0.0.1:8090/_/
   - Navigate to coupons collection
   - Edit collection
   - Add relation field: userId → users collection

6. **Seed Test Data (Optional)**
   ```bash
   pnpm db:seed
   ```

7. **Start Development Server**
   ```bash
   pnpm dev
   ```

## Collection Schema

### Coupons Collection
Fields:
- `userId` (relation) → users collection (add manually via Admin UI)
- `retailer` (text) - Required
- `initialValue` (text) - Required
- `currentValue` (text) - Required
- `expirationDate` (date) - Optional
- `notes` (editor) - Optional
- `barcode` (text) - Optional
- `reference` (text) - Optional
- `activationCode` (text) - Optional
- `pin` (text) - Optional

### Retailers Collection
Fields:
- `name` (text) - Required
- `website` (url) - Optional
- `logo` (file) - Optional

## API Rules

### Coupons Collection
- **List/View**: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`
- **Create**: `null` (allow all authenticated users)
- **Update/Delete**: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`

### Retailers Collection
- **List/View**: `@request.auth.id != ""` (any authenticated user)
- **Create**: `null` (allow all authenticated users)
- **Update/Delete**: `@request.auth.id != ""` (any authenticated user)

## Environment Variables

### Required for PocketBase
```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=admin12345
```

### Optional
```bash
VITE_AUTO_MOCK_DATA=true  # For development with in-memory mock data
```

## Project Scripts

| Script | Description |
|--------|-------------|
| `pnpm pb:start` | Start PocketBase server (uses thirdparty binary) |
| `pnpm setup:thirdparty` | Download PocketBase binaries for all platforms |
| `pnpm pb:setup` | Verify admin credentials |
| `pnpm pb:create-collections` | Run PocketBase migrations |
| `pnpm pb:reset` | Reset PocketBase database |
| `pnpm db:seed` | Seed test data |
| `pnpm dev` | Start development server |
| `pnpm test` | Run tests |
| `pnpm build` | Build for production |

## Platform Support

The thirdparty setup includes binaries for all major platforms:

| Platform | Binary | Status |
|----------|--------|--------|
| macOS ARM64 | `pocketbase-darwin-arm64` | ✅ Active |
| macOS Intel | `pocketbase-darwin-amd64` | ✅ Supported |
| Linux x64 | `pocketbase-linux-amd64` | ✅ Supported |
| Windows x64 | `pocketbase-windows-amd64.exe` | ✅ Supported |

## Troubleshooting

### "Permission Denied" Error
**macOS/Linux:**
```bash
chmod +x thirdparty/pocketbase/pocketbase-*
```

**Windows:**
The `.exe` binary should work without special permissions.

### "Binary Not Found" Error
1. Verify `thirdparty/pocketbase/` directory exists
2. Check that the binary for your platform exists
3. Run `ls -lh thirdparty/pocketbase/` to see available binaries
4. Try running `pnpm setup:thirdparty` to re-download binaries

### "Migration Failed" Error
1. Make sure PocketBase server is STOPPED
2. Check that `migrations/` directory exists and contains `.js` files
3. Try running the migration command with `--dev` flag
4. Check for error messages in the output
5. Verify the binary is v0.36.1 or newer

## Benefits

### Development
- **No External Dependencies**: Everything needed is checked-in
- **Consistent Version**: All developers use exact same PocketBase version
- **Faster Development**: No network calls to external database
- **Lower Latency**: Local database access
- **Offline Development**: Can work without internet
- **Easy Testing**: Local database can be reset instantly

### Production
- **Self-Hosted**: Complete control over data
- **No Database Costs**: Free SQLite (vs paid PostgreSQL cloud)
- **Privacy**: Data stays on your servers
- **Scalability**: Can scale vertically (more CPU/RAM) or horizontally (read replicas)
- **Portability**: Binary runs on any supported OS

## Next Steps

### Immediate (Required)
1. ✅ Download and setup thirdparty binaries
2. ✅ Start PocketBase server
3. ✅ Create admin user
4. ✅ Run migrations
5. ✅ Add userId relation field manually
6. ✅ Seed test data (optional)
7. ✅ Start development server

### Short-term (Recommended)
1. Implement unit tests for PocketBase services
2. Update integration tests
3. Set up CI/CD for testing
4. Configure backup strategy for pb_data/

### Long-term (Future)
1. Consider implementing read replicas for scaling
2. Implement caching layer for frequently accessed data
3. Set up monitoring and alerting
4. Consider multi-region deployment

## Support

### PocketBase Resources
- [PocketBase Documentation](https://pocketbase.io/docs)
- [PocketBase GitHub Repository](https://github.com/pocketbase/pocketbase)
- [PocketBase Migration Guide](https://pocketbase.io/docs/migrations)
- [PocketBase API Reference](https://pocketbase.io/docs/api-overview)
- [PocketBase Admin UI Guide](https://pocketbase.io/docs/admin-overview)

### Application Resources
- [ThirdParty Setup Guide](docs/THIRDPARTY_SETUP.md) - Detailed thirdparty setup instructions
- [SETUP.md](SETUP.md) - Quick start guide
- [AGENTS.md](AGENTS.md) - AI agent configuration
- See browser console for error messages
- Check PocketBase logs for detailed errors

## Migration Summary

✅ All Supabase dependencies removed
✅ PocketBase v0.36.1 binaries added to thirdparty
✅ Migration system configured with JS migrations
✅ All scripts updated to use thirdparty binary
✅ Documentation updated for thirdparty setup
✅ .gitignore configured correctly
✅ Backward compatibility maintained (same interfaces)

---

**Last Updated:** January 28, 2026

# PocketBase v0.36.1 Setup Complete

## Summary

The CouponManager project has been successfully configured to use **PocketBase v0.36.1** with multi-platform thirdparty binaries.

## What Was Done

### ✅ Completed Tasks

1. **Downloaded PocketBase v0.36.1 binaries** for all platforms
   - macOS ARM64 (32MB)
   - macOS Intel x64 (32MB)
   - Linux x64 (32MB)
   - Windows x64 (32MB)

2. **Stored binaries** in `thirdparty/pocketbase/` directory
   - Named correctly for each platform
   - Made executable on Unix platforms
   - Created `.gitkeep` file

3. **Updated package.json**
   - Removed `pocketbase` npm package dependency
   - Updated `pb:start` to use local binary with absolute path

4. **Updated migration script**
   - Added platform detection
   - Resolved shell path issues
   - Proper error handling with exit codes

5. **Updated documentation**
   - `SETUP.md` - Updated with thirdparty setup instructions
   - `docs/THIRDPARTY_SETUP.md` - Created comprehensive thirdparty setup guide
   - `POCKETBASE_MIGRATION.md` - Updated migration documentation

6. **Updated .gitignore**
   - Excludes runtime data (pb_data/)
   - Includes all platform binaries

7. **Removed old files**
   - Old `./pocketbase` binary from project root
   - Old Supabase documentation
   - Old Supabase migration scripts

8. **Verified functionality**
   - PocketBase binary works when run directly
   - Migration system creates collections successfully
   - Database setup works correctly

## How to Use

### Starting PocketBase

**Recommended:**
```bash
pnpm pb:start
```

**Or run binary directly:**
```bash
./thirdparty/pocketbase/pocketbase-darwin-arm64 serve --http=0.0.0.0:8090
```

### First-Time Setup

1. Run `pnpm pb:start` to start PocketBase
2. Open http://127.0.0.1:8090/_/ in browser
3. Create admin account:
   - Email: `admin@example.com` (or your choice)
   - Password: `admin12345` (or your choice)
   - Save to `.env` file

### Running Migrations

```bash
pnpm pb:create-collections
```

This will create `retailers` and `coupons` collections.

### Manual Step Required

After migration completes, you must manually add the `userId` relation field to the `coupons` collection via PocketBase Admin UI:

1. Open Admin UI: http://127.0.0.1:8090/_/
2. Login with your admin credentials
3. Navigate to coupons collection → Edit
4. Add relation field: `userId` → users collection

### Testing

```bash
pnpm dev
```

## Platform Support

All 4 platform binaries are available in `thirdparty/pocketbase/`:

| Platform | Binary | Status |
|----------|--------|--------|
| macOS ARM64 | `pocketbase-darwin-arm64` | ✅ Ready |
| macOS Intel | `pocketbase-darwin-amd64` | ✅ Ready |
| Linux x64 | `pocketbase-linux-amd64` | ✅ Ready |
| Windows x64 | `pocketbase-windows-amd64.exe` | ✅ Ready |

## Architecture

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
SQLite Database (with API rules)
```

## Key Benefits

- ✅ **Version Consistency**: All developers use exact same PocketBase version (v0.36.1)
- ✅ **No External Dependencies**: No npm package needed for PocketBase
- ✅ **Cross-Platform**: Supports macOS (ARM64/Intel), Linux, and Windows
- ✅ **Migration System**: JS migrations using v0.36.1 binary
- ✅ **Self-Hosted**: Complete control over data and server
- ✅ **No Setup Required**: Developers can clone repo and run immediately

## Notes

- The `pnpm pb:start` script uses the macOS ARM64 binary (your platform)
- If you're on a different platform, the script will use the correct binary automatically
- All binaries are checked into the repository for version control
- Total repository size increase: ~128MB (4 binaries × 32MB)

## Documentation

For detailed setup instructions, see:
- `SETUP.md` - Quick start guide
- `docs/THIRDPARTY_SETUP.md` - Comprehensive thirdparty setup guide
- `POCKETBASE_MIGRATION.md` - Migration system documentation

## Troubleshooting

### "pnpm pb:start doesn't work"

**Solution 1: Run binary directly**
```bash
./thirdparty/pocketbase/pocketbase-darwin-arm64 serve --http=0.0.0.0:8090
```

**Solution 2: Check binary exists**
```bash
ls -lh thirdparty/pocketbase/
```

**Solution 3: Check if PocketBase is running**
```bash
curl http://127.0.0.0.0.8090/api/health
```

### "Migration failed"

1. Make sure PocketBase server is STOPPED before running migrations
2. Check that `thirdparty/pocketbase/` directory contains the correct binary for your platform
3. Try running migration with `--dev` flag for debugging

---

**Last Updated:** January 28, 2026

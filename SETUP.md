# Quick Start Guide

Follow these steps to get CouponManager running with PocketBase.

## Step 1: Setup PocketBase Binaries

Download PocketBase v0.36.1 binaries for all platforms using the automated setup script:

```bash
pnpm setup:thirdparty
```

This will download binaries to `thirdparty/pocketbase/` directory for:
- macOS ARM64 (Apple Silicon)
- macOS Intel x64
- Linux x64
- Windows x64

**Manual Download (Fallback):**

If the automated script fails, you can manually download from [GitHub Releases](https://github.com/pocketbase/pocketbase/releases/tag/v0.36.1):

**macOS ARM64:**
```bash
wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.1/pocketbase_0.36.1_darwin_arm64.zip
unzip -o thirdparty/pocketbase/ pocketbase_0.36.1_darwin_arm64.zip
```

**macOS Intel:**
```bash
wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.1/pocketbase_0.36.1_darwin_amd64.zip
unzip -o thirdparty/pocketbase/ pocketbase_0.36.1_darwin_amd64.zip
```

**Linux:**
```bash
wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.1/pocketbase_0.36.1_linux_amd64.zip
unzip -o thirdparty/pocketbase/ pocketbase_0.36.1_linux_amd64.zip
```

**Windows:**
```powershell
Invoke-WebRequest -Uri https://github.com/pocketbase/pocketbase/releases/download/v0.36.1/pocketbase_0.36.1_windows_amd64.zip -OutFile pocketbase.zip
Expand-Archive -LiteralPath pocketbase.zip -DestinationPath thirdparty\pocketbase\
```

## Step 2: Start PocketBase

```bash
pnpm pb:start
```

PocketBase will start on `http://127.0.0.1:8090` using the binary from `thirdparty/pocketbase/`.

## Step 3: Initialize Admin User

**IMPORTANT:** For first-time setup, you must create the initial admin user through the Admin UI.

### First-Time Setup:

```bash
# PocketBase will show setup screen on first run
pnpm pb:start
```

Then:
1. Open http://127.0.0.1:8090/_/ in your browser
2. You'll see a setup screen (first run only)
3. Create admin account:
    - Email: `admin@example.com` (or your choice)
    - Password: `admin12345` (or your choice)
    - Save these credentials in `.env`

### After First-Time Setup:

Once admin exists, you can use this script:

```bash
pnpm pb:setup
```

This will verify your admin credentials.

## Step 4: Create Collections

**Option A: Manual (Recommended - Easier)**

1. Open http://127.0.0.1:8090/_/ in your browser
2. Login with credentials from `.env` (default: `admin@example.com` / `admin12345`)
3. Create **coupons** collection:
    - Add fields: retailer (text), initialValue (text), currentValue (text)
    - Add more fields: expirationDate, activationCode, pin, barcode, reference, notes
    - Add relation: userId → users collection
    - Add API rules (see below)
4. Create **retailers** collection:
    - Add fields: name (text), website (url), logo (file)

**API Rules to add:**

For **coupons** collection:
- List/View: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`
- Create: `null` (allow all authenticated)
- Update/Delete: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`

For **retailers** collection:
- List/View: `@request.auth.id != ""` (any authenticated user)
- Create: `null` (allow all authenticated)
- Update/Delete: `@request.auth.id != ""` (any authenticated user)

**Option B: Migration (Automated)**

```bash
pnpm pb:create-collections
```

This runs migrations from `migrations/` directory using PocketBase v0.36.1 migration system.

**Note:** After migration completes, you'll need to manually add the `userId` relation field to the coupons collection via the Admin UI.

## Step 5: Seed Test Data (Optional)

```bash
pnpm db:seed
```

This creates:
- 3 test users with roles
- 7 sample coupons

Test credentials:
- **User**: user@example.com / pass123
- **Manager**: manager@example.com / pass123
- **User**: another@example.com / pass123

## Step 6: Start Development Server

```bash
pnpm dev
```

Application will be available at: http://localhost:3000

## Verify Setup

1. ✅ PocketBase running at http://127.0.0.1:8090
2. ✅ Admin UI accessible at http://127.0.0.1:8090/_/
3. ✅ Collections created (coupons, retailers)
4. ✅ Can login at http://localhost:3000
5. ✅ Can create coupon
6. ✅ Can edit own coupon
7. ✅ Permissions work correctly

## Environment Variables

Create `.env` file in project root:

```bash
# PocketBase URL (change if different host/port)
VITE_POCKETBASE_URL=http://127.0.0.1:8090

# Admin credentials
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=admin12345

# Auto-seed data for development
VITE_AUTO_MOCK_DATA=true
```

## Common Issues

### "Cannot connect to PocketBase"

```bash
# Check if running
lsof -i :8090

# Check firewall
# macOS: System Preferences → Security → Firewall
# Linux: sudo ufw allow 8090
```

### "Admin user already exists"

If you get this error during setup:

**Option 1:** Login with existing credentials
```bash
# Access Admin UI at http://127.0.0.1:8090/_/
# Login with your credentials
```

**Option 2:** Reset via Admin UI
```bash
# Delete and recreate admin user in Admin UI
```

**Option 3:** Use different credentials
```bash
# Update .env with different email/password
# Run: pnpm pb:setup
```

### "Migration fails"

1. Make sure PocketBase server is STOPPED before running migrations
2. Check that `thirdparty/pocketbase/` directory contains the correct binary
3. Check that `migrations/` directory exists and contains migration files
4. Try running migration manually:
   ```bash
   ./thirdparty/pocketbase/pocketbase migrate up --migrationsDir ./migrations
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

## Documentation

- **Full Setup Guide:** `docs/pocketbase-setup.md`
- **ThirdParty Setup:** `docs/THIRDPARTY_SETUP.md`
- **Schema Reference:** Check `pb-config.json` for collection schemas

## Next Steps

Once everything is running:

1. ✅ Test authentication flow
2. ✅ Test coupon CRUD operations
3. ✅ Test permission system (user vs manager)
4. ✅ Test data persistence
5. ✅ Run `pnpm test` for unit tests
6. ✅ Run `pnpm cypress:open` for E2E tests

## Support

For PocketBase issues:
- [PocketBase Docs](https://pocketbase.io/docs)
- [PocketBase GitHub](https://github.com/pocketbase/pocketbase)
- [PocketBase Community](https://github.com/pocketbase/pocketbase/discussions)

For CouponManager issues:
- Check browser console for errors
- Verify PocketBase is running
- Check that collections exist
- Review error messages in scripts

---

**Summary:** PocketBase v0.36.1 is configured with multi-platform binary support. Follow the steps above to set up PocketBase and start using the application.
# ThirdParty PocketBase Setup Guide

This document explains how PocketBase v0.36.1 binaries are managed in the CouponManager repository.

## Why Checked-in Binaries?

The CouponManager repository includes PocketBase v0.36.1 binaries for multiple platforms as checked-in dependencies. This approach provides several benefits:

### Benefits:
- **Reproducibility**: All developers use the exact same version
- **No Installation Required**: Developers don't need to download PocketBase separately
- **Version Consistency**: Ensures everyone uses v0.36.1
- **Migration Support**: v0.36.1 includes proper migration system
- **Cross-Platform**: Supports macOS (ARM64/Intel), Linux, and Windows

### Trade-offs:
- **Repository Size**: Adds ~192MB to repository (4 binaries × ~48MB)
- **Limited Version**: Version is hardcoded; requires code change to update

## Directory Structure

```
thirdparty/pocketbase/
├── pocketbase-darwin-arm64       # macOS Apple Silicon (ARM64)
├── pocketbase-darwin-amd64       # macOS Intel x64
├── pocketbase-linux-amd64         # Linux x64
├── pocketbase-windows-amd64.exe     # Windows x64
└── .gitkeep
```

## Platform Detection

The setup script automatically detects your platform and uses the appropriate binary:

| Platform | Detection Method | Binary Used |
|----------|------------------|--------------|
| macOS ARM64 | `uname -m == arm64 && uname -s == Darwin` | `pocketbase-darwin-arm64` |
| macOS Intel | `uname -m == x86_64 && uname -s == Darwin` | `pocketbase-darwin-amd64` |
| Linux x64 | `uname -m == x86_64 && uname -s == Linux` | `pocketbase-linux-amd64` |
| Windows x64 | `uname -s == MINGW* || MSYS* || Windows_NT` | `pocketbase-windows-amd64.exe` |

## Setup Process

### Automated Setup (Recommended)

Run the setup script to download all platform binaries:

```bash
pnpm setup:thirdparty
```

This script:
1. Detects current platform
2. Downloads PocketBase v0.36.1 for all 4 platforms
3. Extracts binaries to `thirdparty/pocketbase/`
4. Sets executable permissions on Unix platforms
5. Verifies file sizes (~48MB expected)
6. Creates `.gitkeep` file

### Manual Setup (Fallback)

If the automated script fails, follow these steps:

1. Download PocketBase v0.36.1 from [GitHub Releases](https://github.com/pocketbase/pocketbase/releases/tag/v0.36.1)
2. Extract the zip for your platform
3. Move the binary to `thirdparty/pocketbase/` with platform-specific name
4. Set executable permissions on Unix platforms (macOS/Linux):
   ```bash
   chmod +x thirdparty/pocketbase/pocketbase-*
   ```

## Running PocketBase

### Using NPM Scripts

The project provides npm scripts that use the thirdparty binaries:

```bash
# Start PocketBase server
pnpm pb:start

# Run migrations
pnpm pb:create-collections

# Reset database
pnpm pb:reset
```

### Direct Binary Execution

You can also execute the binary directly:

```bash
# On macOS/Linux
./thirdparty/pocketbase/pocketbase serve --http=0.0.0.0:8090

# On Windows
.\thirdparty\pocketbase\pocketbase-windows-amd64.exe serve --http=0.0.0.0:8090
```

## Migration System

The project uses PocketBase v0.36.1's migration system located in the `migrations/` directory.

### Running Migrations

Migrations are run using the thirdparty binary:

```bash
# Make sure PocketBase server is STOPPED before running migrations

# Run migrations
pnpm pb:create-collections

# Or directly
./thirdparty/pocketbase/pocketbase migrate up --migrationsDir ./migrations
```

### Migration Files

Current migrations:
- `002_create_collections.js` - Creates coupons and retailers collections

**Important Notes:**
- Make sure PocketBase server is STOPPED before running migrations
- Migration files must be in the `migrations/` directory
- Use the `--dev` flag to see SQL statements for debugging

## Updating PocketBase Version

To update to a newer PocketBase version:

1. Update the VERSION variable in `scripts/setup-thirdparty.sh`
2. Update the download URLs with the new version
3. Delete old binaries from `thirdparty/pocketbase/`
4. Run `pnpm setup:thirdparty`
5. Test the new version
6. Update documentation to reflect the new version

## Troubleshooting

### "Permission Denied" Error

If you get a permission denied error when starting PocketBase:

**macOS/Linux:**
```bash
# Make sure the binary is executable
chmod +x thirdparty/pocketbase/pocketbase-*

# Or run with explicit execution
./thirdparty/pocketbase/pocketbase serve --http=0.0.0.0:8090
```

**Windows:**
The `.exe` binary should not need special permissions. Ensure you're using Command Prompt or PowerShell with appropriate privileges.

### "Binary Not Found" Error

If the binary is not found:

1. Verify `thirdparty/pocketbase/` directory exists
2. Check that the binary for your platform exists
3. Run `ls -lh thirdparty/pocketbase/` to see available binaries
4. Try running `pnpm setup:thirdparty` to re-download binaries

### "Migration Failed" Error

1. Make sure PocketBase server is STOPPED
2. Check that `migrations/` directory exists and contains `.js` files
3. Try running the migration command with `--dev` flag to see details:
   ```bash
   ./thirdparty/pocketbase/pocketbase migrate up --migrationsDir ./migrations --dev
   ```
4. Check for error messages in the output
5. Verify the binary is v0.36.1 or newer

### Network Issues During Download

If the setup script fails to download binaries:

1. Check your internet connection
2. Try manually downloading from [GitHub Releases](https://github.com/pocketbase/pocketbase/releases/tag/v0.36.1)
3. Check GitHub status: https://www.githubstatus.com/
4. Try using a different network or VPN

## Version Information

- **Current Version:** 0.36.1
- **Release Date:** January 18, 2026
- **Migration System:** Supported (migrate up/down/create/collections)
- **API Support:** Full API for collections management
- **Platform Support:** macOS (ARM64/Intel), Linux x64, Windows x64

## Additional Resources

- [PocketBase Documentation](https://pocketbase.io/docs)
- [PocketBase GitHub Repository](https://github.com/pocketbase/pocketbase)
- [PocketBase Migration Guide](https://pocketbase.io/docs/migrations)
- [PocketBase API Reference](https://pocketbase.io/docs/api-overview)

---

**Last Updated:** January 28, 2026

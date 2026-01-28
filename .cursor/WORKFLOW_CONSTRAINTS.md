# Workflow Constraints

**Version:** 1.0.0  
**Purpose:** Comprehensive workflow and operational constraints for CouponManager  
**Last Updated:** 2025-01-23

---

## Development Mode Constraints

### In-Memory Database Usage

**Constraint:** Development mode uses an in-memory database for fast iteration.

**Configuration:**
```bash
# Enable in-memory database
VITE_USE_MEMORY_DB=true

# Enable auto-injection of mock data
VITE_AUTO_MOCK_DATA=true
```

**Command:**
```bash
pnpm dev
```

**Constraints:**
- Data is lost when the application restarts
- No persistent storage across sessions
- Mock services are dynamically imported (not bundled in production)
- All operations are synchronous for immediate feedback

**Files Affected:**
- [`CouponService.ts`](../src/services/CouponService.ts:1) - In-memory coupon storage
- [`../mocks/services/AuthService.js`](../src/mocks/services/AuthService.js:1) - Mock authentication
- [`../mocks/services/RoleService.js`](../src/mocks/services/RoleService.js:1) - Mock role management

### Mock Data Injection

**Constraint:** Mock data can be auto-injected on application startup.

**Configuration:**
```bash
VITE_AUTO_MOCK_DATA=true
```

**Mock Data Sources:**
- [`../mocks/data/coupons.js`](../src/mocks/data/coupons.js:1) - Sample coupons
- [`../mocks/data/users.js`](../src/mocks/data/users.js:1) - Sample users

**Constraints:**
- Mock data is only injected in development mode
- Data is reset on each application restart
- Mock data follows the same schema as production data

### Environment Variables Required for Development

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_USE_MEMORY_DB` | No | `false` | Enable in-memory database |
| `VITE_AUTO_MOCK_DATA` | No | `false` | Auto-inject mock data |
| `VITE_SUPABASE_URL` | No* | - | Supabase URL (for dev:supabase mode) |
| `VITE_SUPABASE_KEY` | No* | - | Supabase anon key (for dev:supabase mode) |

*Required only when using `pnpm dev:supabase`

---

## Production Mode Constraints

### Supabase Connection Required

**Constraint:** Production mode requires a valid Supabase connection.

**Configuration:**
```bash
VITE_USE_MEMORY_DB=false
```

**Command:**
```bash
pnpm dev:supabase
```

**Constraints:**
- All data operations go through Supabase PostgreSQL
- Network latency affects operation speed
- Connection errors must be handled gracefully
- RLS policies are enforced at the database level

**Files Affected:**
- [`SupabaseClient.ts`](../src/services/SupabaseClient.ts:1) - Supabase client configuration
- [`SupabaseCouponService.ts`](../src/services/SupabaseCouponService.ts:1) - Supabase coupon service
- [`RoleService.ts`](../src/services/RoleService.ts:1) - Role-based permission checks

### RLS Policies Must Be Enforced

**Constraint:** Row-Level Security (RLS) policies must be active in production.

**RLS Policy Files:**
- [`../migrations/sql/20250306100002-enable_rls_for_coupons.sql`](../migrations/sql/20250306100002-enable_rls_for_coupons.sql:1)
- [`../migrations/sql/20250306100003-enable_rls_for_user_roles.sql`](../migrations/sql/20250306100003-enable_rls_for_user_roles.sql:1)
- [`../migrations/sql/20250306100004-add_foreign_keys_for_rls.sql`](../migrations/sql/20250306100004-add_foreign_keys_for_rls.sql:1)

**Constraints:**
- Users can only access their own data (user role)
- Managers can access all data (manager role)
- Demo users have read-only access to sample data
- Ownership is verified via `user_id` foreign key

**Verification:**
```bash
# Test database connection
pnpm db:test

# Run migrations
pnpm migrate:up
```

### Environment Variables Required for Production

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | **Yes** | Supabase project URL |
| `VITE_SUPABASE_KEY` | **Yes** | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key (for migrations) |
| `SUPABASE_DB_HOST` | **Yes** | Database host |
| `SUPABASE_DB_PORT` | **Yes** | Database port (typically 5432) |
| `SUPABASE_DB_NAME` | **Yes** | Database name (typically postgres) |
| `SUPABASE_DB_USER` | **Yes** | Database user |
| `SUPABASE_DB_PASSWORD` | **Yes** | Database password |

---

## Permission System Constraints

### Role-Based Access Control

**Constraint:** Three user roles with distinct permissions.

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **user** | Own data only | Create, read, update, delete own coupons |
| **manager** | Full system access | All user permissions + manage users, view all coupons |
| **demo** | Read-only sample data | View sample coupons only, no modifications |

**Permission Matrix:** See [`../docs/permission-matrix.md`](../docs/permission-matrix.md:1)

### Ownership Checks for User Role

**Constraint:** User role can only access their own data.

**Implementation:**
```typescript
// In services, verify ownership before operations
if (user.role === 'user' && coupon.userId !== user.id) {
  throw new Error('Access denied: You can only access your own coupons');
}
```

**Constraints:**
- All coupon operations must check `userId` ownership
- Ownership check must be performed in service layer
- RLS policies provide server-side enforcement

### Manager Permissions

**Constraint:** Manager role has full system access.

**Capabilities:**
- View all coupons across all users
- Manage user roles
- Access user management interface
- Override ownership restrictions

**Constraints:**
- Manager role cannot be assigned via public API
- Only existing managers can assign manager role
- Manager actions should be logged for audit

### Demo User Restrictions

**Constraint:** Demo users have limited, read-only access.

**Restrictions:**
- Cannot create, update, or delete coupons
- Cannot modify user accounts
- Cannot access management features
- Only sees sample/mock data

**Implementation:**
```typescript
if (user.role === 'demo') {
  // Return read-only sample data
  return getSampleCoupons();
}
```

---

## Migration System Constraints

### SQL Migration Format

**Constraint:** All migrations must be SQL files.

**File Format:**
```
migrations/sql/YYYYMMDDHHMMSS-description.sql
```

**Naming Convention:**
- Prefix: `YYYYMMDDHHMMSS` (timestamp)
- Separator: `-`
- Description: lowercase_with_underscores
- Extension: `.sql`

**Example:**
```
20250306100000-create_coupons_table.sql
20250306100001-add_user_roles_and_coupon_ownership.sql
```

### Migration Naming Convention

**Constraint:** Migrations must follow strict naming conventions.

**Pattern:**
```
{timestamp}-{action}_{entity}_{detail}.sql
```

**Actions:**
- `create` - Create new table/view
- `add` - Add column/index/constraint
- `remove` - Remove column/index/constraint
- `alter` - Modify existing structure
- `enable` - Enable feature (e.g., RLS)
- `disable` - Disable feature

**Examples:**
- `create_coupons_table.sql`
- `add_notes_to_coupons.sql`
- `enable_rls_for_coupons.sql`
- `add_foreign_keys_for_rls.sql`

### Migration Dependencies

**Constraint:** Migrations must be executed in timestamp order.

**Dependencies:**
- Each migration depends on all previous migrations
- Cannot skip migrations
- Migration order is determined by timestamp prefix

**Verification:**
```bash
# List pending migrations
pnpm migrate:list

# Check migration status
pnpm migrate:status
```

### Rollback Procedures

**Constraint:** Rollbacks must be done manually via SQL.

**Rollback Process:**
1. Identify the migration to rollback
2. Write the inverse SQL statements
3. Execute rollback statements manually
4. Update migration tracking if needed

**Warning:** There is no automated rollback system. Plan migrations carefully.

**Example Rollback:**
```sql
-- Original migration
ALTER TABLE coupons ADD COLUMN notes TEXT;

-- Rollback
ALTER TABLE coupons DROP COLUMN notes;
```

---

## Testing Constraints

### 80% Coverage Threshold

**Constraint:** All code must have ≥ 80% test coverage.

**Enforcement:**
- CI/CD pipeline checks coverage on every PR
- PRs with < 80% coverage are rejected
- Coverage is calculated from all test files combined

**Check Coverage:**
```bash
pnpm test:coverage
```

**Coverage Report Location:**
- HTML report: `coverage/index.html`
- Badge SVGs: `badges/coverage/`

### Test File Organization

**Constraint:** Tests must be organized in a specific structure.

```
src/test/
├── components/          # Component tests
│   ├── AddCouponForm.test.jsx
│   ├── CouponList.test.jsx
│   └── ...
├── services/           # Service tests
│   ├── AuthService.test.js
│   ├── CouponService.test.js
│   └── ...
└── util/              # Test utilities
    └── test-utils.jsx
```

**Naming Conventions:**
- Component tests: `ComponentName.test.tsx`
- Service tests: `ServiceName.test.ts`
- Real backend tests: `*.real.test.tsx` or `*.real.test.ts`
- Mobile-specific tests: `*.mobile.test.tsx`

### Mobile-Specific Tests

**Constraint:** Mobile-specific features must have dedicated tests.

**Mobile Test Files:**
- [`CouponList.mobile.test.jsx`](../src/test/components/CouponList.mobile.test.jsx:1)
- [`RetailerList.mobile.test.jsx`](../src/test/components/RetailerList.mobile.test.jsx:1)

**Mobile Testing Constraints:**
- Test responsive layouts
- Test touch interactions
- Test viewport size variations
- Use viewport mocking utilities

### Real vs Mock Tests

**Constraint:** Separate tests for mock and real backend.

**Mock Tests:**
- Use MSW for API mocking
- Fast, reliable, no external dependencies
- Default for most tests
- File pattern: `*.test.tsx` or `*.test.ts`

**Real Tests:**
- Connect to actual backend (Supabase)
- Slower, require valid credentials
- Used for integration testing
- File pattern: `*.real.test.tsx` or `*.real.test.ts`

**Example Real Test:**
```typescript
// LanguageSelector.real.test.jsx
// Tests actual i18n behavior with real translation files
```

---

## Documentation Constraints

### When to Update Docs

**Constraint:** Documentation must be updated with code changes.

**Update Triggers:**
- New feature added
- Existing feature modified
- Bug fix that changes behavior
- Architecture change
- New dependency added
- Configuration change

**Priority:**
1. Update authoritative documents first:
   - [`ARCHITECTURE.md`](../docs/ARCHITECTURE.md:1)
   - [`CODING_STANDARDS.md`](../docs/CODING_STANDARDS.md:1)
   - [`CONTRIBUTING.md`](../docs/CONTRIBUTING.md:1)
2. Update feature documentation
3. Update relevant guides

### Documentation Format

**Constraint:** All documentation must be in Markdown format.

**Markdown Requirements:**
- Use proper heading hierarchy (H1-H6)
- Include table of contents for long documents
- Use code blocks with syntax highlighting
- Include code examples where applicable
- Use tables for structured data
- Include cross-references to related docs

**Example Structure:**
```markdown
# Document Title

**Version:** 1.0.0
**Last Updated:** YYYY-MM-DD

## Table of Contents

1. [Section 1](#section-1)
2. [Section 2](#section-2)

## Section 1

Content...

## Section 2

Content...
```

### Cross-Reference Requirements

**Constraint:** All related documents must be cross-referenced.

**Cross-Reference Patterns:**
- Link to related docs: `[Document Name](path/to/file.md:1)`
- Link to specific sections: `[Section Name](path/to/file.md#section-name)`
- Link to code: [`FileName`](path/to/file.ts:1)

**Required Cross-References:**
- All AI config files must reference each other
- Feature docs must reference architecture docs
- Code examples must reference actual files

### Version Control

**Constraint:** Documentation changes must follow version control rules.

**Commit Message Format:**
```
docs(topic): brief description

Detailed explanation of changes.

Refs #issue-number
```

**Documentation Status:**
- **Authoritative** - Primary reference, always accurate
- **Current** - Updated and accurate
- **Draft** - Work in progress
- **Legacy** - Superseded by other docs
- **Duplicate** - Duplicate content

---

## Build and Deployment Constraints

### Build Requirements

**Constraint:** Production builds must pass all checks.

**Build Process:**
```bash
pnpm build
```

**Build Constraints:**
- All TypeScript errors must be resolved
- All tests must pass
- Coverage must be ≥ 80%
- Linting must pass
- No console warnings in production build

### Environment-Specific Builds

**Development Build:**
- Includes source maps
- Includes development tools
- No minification
- Fast rebuilds

**Production Build:**
- Minified code
- Optimized assets
- No source maps (or external)
- Tree-shaking enabled

### Deployment Constraints

**Constraint:** Deployments require specific environment variables.

**Required Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`
- All Supabase database credentials

**Deployment Steps:**
1. Set environment variables
2. Run database migrations
3. Build application
4. Deploy to hosting platform
5. Verify deployment

---

## Security Constraints

### API Key Protection

**Constraint:** API keys must never be committed to version control.

**Protected Keys:**
- `VITE_SUPABASE_KEY` - Anon key (public but tracked)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (NEVER commit)

**Best Practices:**
- Use `.env` files for local development
- Use environment variables in production
- Never log sensitive data
- Rotate keys regularly

### RLS Policy Enforcement

**Constraint:** Database-level security must be enforced.

**RLS Requirements:**
- All tables must have RLS enabled
- Policies must be tested before deployment
- Ownership checks must be server-side
- No client-side security bypasses

### Input Validation

**Constraint:** All user inputs must be validated.

**Validation Requirements:**
- Validate on client side for UX
- Validate on server side for security
- Sanitize data before storage
- Use prepared statements for SQL

---

## Performance Constraints

### Bundle Size

**Constraint:** Production bundle must be optimized.

**Optimization Requirements:**
- Code splitting for routes
- Lazy loading for heavy components
- Tree-shaking for unused code
- Minification enabled

**Check Bundle Size:**
```bash
pnpm build
# Check output in dist/ directory
```

### Lazy Loading

**Constraint:** Heavy components must be lazy loaded.

**Example:**
```typescript
const BarcodeScanner = lazy(() => import('./components/BarcodeScanner'));
```

### Caching Strategy

**Constraint:** Appropriate caching must be implemented.

**Caching Layers:**
- Browser caching for static assets
- Service worker for offline support
- Context caching for user data
- Supabase query caching where appropriate

---

## Cross-References

- **Project Context:** [`.cursor/PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md:1)
- **Agent Instructions:** [`.cursor/AGENT_INSTRUCTIONS.md`](AGENT_INSTRUCTIONS.md:1)
- **Dependency Mapping:** [`.cursor/DEPENDENCY_MAPPING.md`](DEPENDENCY_MAPPING.md:1)
- **Quick Reference:** [`.cursor/QUICK_REFERENCE.md`](QUICK_REFERENCE.md:1)
- **Permission Matrix:** [`../docs/permission-matrix.md`](../docs/permission-matrix.md:1)
- **Migration System:** [`../docs/migration-system.md`](../docs/migration-system.md:1)
- **Testing Standards:** [`../docs/testing-standards.md`](../docs/testing-standards.md:1)

---

**End of Workflow Constraints**

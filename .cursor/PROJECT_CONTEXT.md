# Project Context Configuration

**Version:** 1.0.0  
**Purpose:** Comprehensive project context for autonomous AI agents  
**Last Updated:** 2025-01-23

---

## Project Overview

### Project Information

| Property | Value |
|----------|-------|
| **Project Name** | CouponManager |
| **Description** | A web application to manage vouchers and coupons with role-based access control |
| **Version** | 1.0.0 |
| **Type** | React Web Application |
| **Package Manager** | pnpm |

### Technology Stack Summary

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend Framework** | React | 18.2.0 |
| **Language** | TypeScript | 5.x |
| **UI Library** | Material-UI (MUI) | 5.15.0 |
| **Build Tool** | Vite | 5.0.0 |
| **Testing Framework** | Vitest | 3.0.7 |
| **Backend** | Supabase | 2.49.1 |
| **i18n** | i18next | 24.2.2 |
| **Barcode Scanning** | react-qr-reader | 3.0.0-beta-1 |
| **Date Utilities** | date-fns | 2.30.0 |

### Key Features and Functionality

1. **Coupon Management**
   - Add, edit, and delete coupons
   - Track coupon values (initial and current)
   - Mark coupons as used or partially used
   - Filter and sort coupons by retailer, value, and expiration

2. **Barcode Scanning**
   - Scan QR codes and barcodes using device camera
   - Auto-populate coupon data from scanned codes

3. **Role-Based Access Control**
   - Three user roles: `user`, `manager`, `demo`
   - Attribute-based permissions
   - Ownership-based access control

4. **Multi-Language Support**
   - 4 supported languages: English, French, German, Spanish
   - Namespace-based translation structure

5. **Dual Storage Modes**
   - In-memory database for development
   - Supabase PostgreSQL for production with RLS

6. **Retailer Statistics**
   - View coupon counts and total values per retailer
   - Active vs expired coupon breakdown

---

## Architecture Overview

### Layered Architecture

The application follows a four-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Components: CouponList, AddCouponForm, etc.)        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Context Layer                           │
│  (AuthContext, LanguageContext - State Management)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  (AuthService, CouponService, RoleService + Factories)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  (In-Memory DB / Supabase PostgreSQL + RLS)                 │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

| Pattern | Implementation | Purpose |
|---------|----------------|---------|
| **Factory Pattern** | [`AuthServiceFactory.ts`](src/services/AuthServiceFactory.ts:1), [`CouponServiceFactory.ts`](src/services/CouponServiceFactory.ts:1), [`RoleServiceFactory.ts`](src/services/RoleServiceFactory.ts:1) | Service abstraction and environment-based switching |
| **Singleton Pattern** | Context providers (AuthContext, LanguageContext) | Single source of truth for global state |
| **Context API** | [`AuthContext.tsx`](src/services/AuthContext.tsx:1), [`LanguageContext.tsx`](src/services/LanguageContext.tsx:1) | React state management and prop drilling avoidance |
| **Repository Pattern** | Service implementations (CouponService, SupabaseCouponService) | Data access abstraction |
| **Adapter Pattern** | Mock services adapting to service interfaces | Development/production environment adaptation |

### Component Hierarchy

```
App.tsx
├── AuthContext.Provider
│   ├── LoginForm
│   ├── UserManagement (manager only)
│   └── LanguageContext.Provider
│       ├── LanguageSelector
│       └── Main Content
│           ├── CouponList
│           ├── AddCouponForm
│           ├── BarcodeScanner
│           └── RetailerList
```

### Data Flow

1. **User Interaction** → Component captures user action
2. **Component** → Calls service method via factory
3. **Factory** → Returns appropriate service implementation (mock/real)
4. **Service** → Executes business logic and interacts with data layer
5. **Data Layer** → Returns data to service
6. **Service** → Returns processed data to component
7. **Component** → Updates state via Context or local state
8. **Context** → Propagates changes to consuming components

---

## Key Technical Decisions

### Factory Pattern for Service Abstraction

**Decision:** All services use the Factory pattern for environment-based switching.

**Rationale:**
- Enables seamless switching between in-memory (development) and Supabase (production) backends
- Mock services are dynamically imported to avoid production bundle bloat
- Single point of control for service instantiation

**Implementation:**
- [`AuthServiceFactory.ts`](src/services/AuthServiceFactory.ts:1) - Authentication service factory
- [`CouponServiceFactory.ts`](src/services/CouponServiceFactory.ts:1) - Coupon service factory
- [`RoleServiceFactory.ts`](src/services/RoleServiceFactory.ts:1) - Role service factory

### In-Memory DB for Development

**Decision:** Use in-memory database for development with optional auto-injection of mock data.

**Rationale:**
- Fast development cycle without external dependencies
- Isolated testing environment
- Easy state reset for testing

**Configuration:**
- Environment variable: `VITE_USE_MEMORY_DB=true`
- Auto-mock data: `VITE_AUTO_MOCK_DATA=true`
- Command: `pnpm dev` (uses memory DB by default)

### Supabase RLS for Security

**Decision:** Use Supabase Row-Level Security (RLS) for production data access control.

**Rationale:**
- Server-side security enforcement
- Fine-grained access control per row
- Ownership-based permissions
- Attribute-based access control (ABAC) support

**Implementation:**
- RLS policies defined in [`migrations/sql/`](migrations/sql/)
- See [`docs/supabase-rls.md`](docs/supabase-rls.md:1) for details

### TypeScript Strict Mode

**Decision:** Enable TypeScript strict mode for type safety.

**Rationale:**
- Catch errors at compile time
- No implicit any types
- Explicit null checks required
- Better IDE support and autocomplete

**Configuration:**
- [`tsconfig.json`](tsconfig.json:10) - `"strict": true`

### i18n with Namespace Structure

**Decision:** Use i18next with namespace-based translation organization.

**Rationale:**
- Scalable translation management
- Lazy loading of language files
- Type-safe translation keys
- Easy addition of new languages

**Implementation:**
- Configuration: [`src/i18n.ts`](src/i18n.ts:1)
- Translation files: [`src/locales/`](src/locales/)
- Supported: en, fr, de, es

---

## Important Constraints

### TypeScript Strict Mode Constraints

1. **No implicit any types** - All variables must have explicit types
2. **Explicit null checks** - Use optional chaining or null checks before accessing properties
3. **Initialized variables** - All variables must be initialized before use
4. **Correct return types** - Function return types must match declared types

### 80% Test Coverage Requirement

- All new code must have ≥ 80% test coverage
- Coverage is enforced via CI/CD pipeline
- Use Vitest for unit and integration tests
- Use React Testing Library for component tests

### Role-Based Permissions Enforcement

- All service methods must enforce role-based permissions
- User role can only access their own coupons
- Manager role has full system access
- Demo role has read-only access to sample data
- See [`docs/permission-matrix.md`](docs/permission-matrix.md:1) for details

### Factory Pattern Requirement

- All services must be accessed via their respective factories
- Never directly instantiate service implementations in components
- Use `getService()` methods from factories

### No Direct Database Access Outside Services

- Components must only interact with services, never directly with database
- All data access logic must be encapsulated in service layer
- Services provide the abstraction layer between UI and data

### Environment Variable Requirements

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_USE_MEMORY_DB` | Enable in-memory database | Optional (defaults to false) |
| `VITE_AUTO_MOCK_DATA` | Auto-inject mock data | Optional (defaults to false) |
| `VITE_SUPABASE_URL` | Supabase project URL | Required for production |
| `VITE_SUPABASE_KEY` | Supabase anon key | Required for production |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required for migrations |

---

## File Structure Reference

```
CouponManager/
├── .cursor/                    # AI agent configuration (this directory)
├── src/
│   ├── components/             # React components (7 files)
│   │   ├── AddCouponForm.tsx
│   │   ├── BarcodeScanner.tsx
│   │   ├── CouponList.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RetailerList.tsx
│   │   └── UserManagement.tsx
│   ├── services/               # Business logic (7 files)
│   │   ├── AuthService.ts
│   │   ├── AuthServiceFactory.ts
│   │   ├── AuthContext.tsx
│   │   ├── CouponService.ts
│   │   ├── CouponServiceFactory.ts
│   │   ├── RoleService.ts
│   │   ├── RoleServiceFactory.ts
│   │   ├── SupabaseClient.ts
│   │   ├── SupabaseCouponService.ts
│   │   ├── LanguageContext.tsx
│   │   └── LanguageService.ts
│   ├── types/                  # Type definitions
│   │   └── index.ts
│   ├── locales/                # i18n translations
│   │   ├── en/
│   │   ├── fr/
│   │   ├── de/
│   │   └── es/
│   ├── mocks/                  # Mock data and services
│   │   ├── data/
│   │   └── services/
│   └── test/                   # Test files
│       ├── components/
│       ├── services/
│       └── util/
├── migrations/                 # SQL migrations (6 files)
│   ├── migrations.json
│   └── sql/
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
└── public/                     # Static assets
```

---

## Related Documentation

- **Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md:1)
- **Coding Standards:** [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md:1)
- **Contribution Guidelines:** [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md:1)
- **Permission Matrix:** [`docs/permission-matrix.md`](docs/permission-matrix.md:1)
- **Migration System:** [`docs/migration-system.md`](docs/migration-system.md:1)
- **Testing Standards:** [`docs/testing-standards.md`](docs/testing-standards.md:1)

---

**End of Project Context**

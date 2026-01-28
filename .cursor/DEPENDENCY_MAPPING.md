# Dependency Mapping

**Version:** 1.0.0  
**Purpose:** Comprehensive mapping of all project dependencies  
**Last Updated:** 2025-01-23

---

## Core Dependencies

### Frontend Framework

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **react** | 18.2.0 | UI framework | Core React library for building user interfaces |
| **react-dom** | 18.2.0 | React DOM renderer | DOM rendering for React components |
| **@types/react** | 18.x | TypeScript types | Type definitions for React |
| **@types/react-dom** | 18.x | TypeScript types | Type definitions for React DOM |

### TypeScript

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **typescript** | 5.x | TypeScript compiler | Type checking and compilation |
| **@types/node** | 20.x | Node.js types | Type definitions for Node.js APIs |

### UI Components

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **@mui/material** | 5.15.0 | Material-UI components | Pre-built React components following Material Design |
| **@mui/icons-material** | 5.15.0 | Material icons | Icon components from Material Design |
| **@mui/x-date-pickers** | 6.19.0 | Date picker components | Date and time picker components |
| **@emotion/react** | 11.11.0 | CSS-in-JS library | Styling engine for Material-UI |
| **@emotion/styled** | 11.11.0 | Styled components | Styled utility for Material-UI |

### Build Tools

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **vite** | 5.0.0 | Build tool and dev server | Fast development server and production bundler |
| **@vitejs/plugin-react** | 4.2.0 | Vite React plugin | React support for Vite |
| **cross-env** | 7.0.3 | Environment variable utility | Cross-platform environment variable setting |

### Testing Framework

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **vitest** | 3.0.7 | Testing framework | Unit and integration testing |
| **@vitest/coverage-v8** | 3.0.7 | Code coverage | Test coverage reporting |
| **@testing-library/react** | 16.2.0 | React testing utilities | Component testing utilities |
| **@testing-library/jest-dom** | 6.6.3 | Jest DOM matchers | Custom DOM matchers for assertions |
| **@testing-library/user-event** | 14.6.1 | User event simulation | Simulate user interactions in tests |
| **jsdom** | 26.0.0 | DOM implementation | DOM environment for Node.js testing |

### Backend

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **@supabase/supabase-js** | 2.49.1 | Supabase client | Database and authentication client |
| **pg** | 8.11.3 | PostgreSQL client | Database connection for migrations |
| **@types/pg** | 8.10.9 | PostgreSQL types | TypeScript types for pg |

### Internationalization

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **i18next** | 24.2.2 | i18n framework | Internationalization framework |
| **react-i18next** | 15.4.1 | React i18n bindings | React integration for i18next |
| **i18next-browser-languagedetector** | 8.0.4 | Language detector | Browser language detection |

### Utilities

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **date-fns** | 2.30.0 | Date utilities | Date manipulation and formatting |
| **uuid** | 11.1.0 | UUID generator | Unique identifier generation |
| **@types/uuid** | 10.0.0 | UUID types | TypeScript types for uuid |
| **prop-types** | 15.8.1 | Runtime type checking | React prop type validation |
| **dotenv** | 16.4.7 | Environment variables | Load environment variables from .env files |

### Barcode Scanning

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **react-qr-reader** | 3.0.0-beta-1 | QR/barcode scanner | Camera-based QR code and barcode scanning |

### API Mocking

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **msw** | 2.7.3 | API mocking | Mock Service Worker for API mocking |

### Code Quality

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **eslint** | 8.x | Linting | Code quality and style checking |
| **eslint-config-next** | 14.0.4 | ESLint config | Next.js ESLint configuration (shared rules) |

### Documentation

| Dependency | Version | Purpose | Usage |
|------------|---------|---------|-------|
| **@mermaid-js/mermaid-cli** | 11.4.2 | Diagram generation | Generate architecture diagrams from markdown |

---

## Service Layer Dependencies

### AuthService

| File | Dependencies | Description |
|------|--------------|-------------|
| [`AuthService.ts`](../src/services/AuthService.ts:1) | None | In-memory auth implementation |
| [`AuthServiceFactory.ts`](../src/services/AuthServiceFactory.ts:1) | `@supabase/supabase-js`, [`../mocks/services/AuthService.js`](../src/mocks/services/AuthService.js:1) | Factory for auth service selection |
| [`SupabaseClient.ts`](../src/services/SupabaseClient.ts:1) | `@supabase/supabase-js` | Supabase client configuration |
| [`AuthContext.tsx`](../src/services/AuthContext.tsx:1) | `react`, [`AuthServiceFactory.ts`](../src/services/AuthServiceFactory.ts:1), [`../types/index.ts`](../src/types/index.ts:1) | React context for authentication state |

### CouponService

| File | Dependencies | Description |
|------|--------------|-------------|
| [`CouponService.ts`](../src/services/CouponService.ts:1) | [`../types/index.ts`](../src/types/index.ts:1) | In-memory coupon service implementation |
| [`CouponServiceFactory.ts`](../src/services/CouponServiceFactory.ts:1) | [`CouponService.ts`](../src/services/CouponService.ts:1), [`SupabaseCouponService.ts`](../src/services/SupabaseCouponService.ts:1), [`../mocks/data/coupons.js`](../src/mocks/data/coupons.js:1) | Factory for coupon service selection |
| [`SupabaseCouponService.ts`](../src/services/SupabaseCouponService.ts:1) | `@supabase/supabase-js`, [`SupabaseClient.ts`](../src/services/SupabaseClient.ts:1), [`../types/index.ts`](../src/types/index.ts:1) | Supabase coupon service implementation |

### RoleService

| File | Dependencies | Description |
|------|--------------|-------------|
| [`RoleService.ts`](../src/services/RoleService.ts:1) | [`../types/index.ts`](../src/types/index.ts:1) | Role and permission management |
| [`RoleServiceFactory.ts`](../src/services/RoleServiceFactory.ts:1) | [`RoleService.ts`](../src/services/RoleService.ts:1), [`../mocks/services/RoleService.js`](../src/mocks/services/RoleService.js:1) | Factory for role service selection |

### LanguageService

| File | Dependencies | Description |
|------|--------------|-------------|
| [`LanguageService.ts`](../src/services/LanguageService.ts:1) | `i18next`, `react-i18next`, `i18next-browser-languagedetector` | Language and translation management |
| [`LanguageContext.tsx`](../src/services/LanguageContext.tsx:1) | `react`, [`LanguageService.ts`](../src/services/LanguageService.ts:1) | React context for language state |

---

## Component Dependencies

### Component Dependency Graph

```
App.tsx
├── AuthContext.tsx
│   ├── LoginForm.tsx
│   └── UserManagement.tsx
└── LanguageContext.tsx
    ├── LanguageSelector.tsx
    └── Main Content
        ├── CouponList.tsx
        ├── AddCouponForm.tsx
        ├── BarcodeScanner.tsx
        └── RetailerList.tsx
```

### Component Dependencies Table

| Component | File | External Dependencies | Internal Dependencies |
|-----------|------|----------------------|----------------------|
| **AddCouponForm** | [`../src/components/AddCouponForm.tsx`](../src/components/AddCouponForm.tsx:1) | `@mui/material`, `date-fns` | `AuthContext`, `CouponServiceFactory`, `LanguageContext` |
| **BarcodeScanner** | [`../src/components/BarcodeScanner.tsx`](../src/components/BarcodeScanner.tsx:1) | `react-qr-reader`, `@mui/material` | `AuthContext`, `LanguageContext` |
| **CouponList** | [`../src/components/CouponList.tsx`](../src/components/CouponList.tsx:1) | `@mui/material`, `date-fns` | `AuthContext`, `CouponServiceFactory`, `LanguageContext` |
| **LanguageSelector** | [`../src/components/LanguageSelector.tsx`](../src/components/LanguageSelector.tsx:1) | `@mui/material` | `LanguageContext` |
| **LoginForm** | [`../src/components/LoginForm.tsx`](../src/components/LoginForm.tsx:1) | `@mui/material` | `AuthContext`, `AuthServiceFactory`, `LanguageContext` |
| **RetailerList** | [`../src/components/RetailerList.tsx`](../src/components/RetailerList.tsx:1) | `@mui/material` | `AuthContext`, `CouponServiceFactory`, `LanguageContext` |
| **UserManagement** | [`../src/components/UserManagement.tsx`](../src/components/UserManagement.tsx:1) | `@mui/material` | `AuthContext`, `RoleServiceFactory`, `LanguageContext` |

---

## Context Dependencies

### AuthContext

| Property | Type | Source |
|----------|------|--------|
| `user` | `User \| null` | [`../types/index.ts`](../src/types/index.ts:6) |
| `login` | `(email: string, password: string) => Promise<void>` | [`AuthServiceFactory.ts`](../src/services/AuthServiceFactory.ts:1) |
| `logout` | `() => Promise<void>` | [`AuthServiceFactory.ts`](../src/services/AuthServiceFactory.ts:1) |
| `signUp` | `(email: string, password: string) => Promise<void>` | [`AuthServiceFactory.ts`](../src/services/AuthServiceFactory.ts:1) |

### LanguageContext

| Property | Type | Source |
|----------|------|--------|
| `language` | `string` | [`LanguageService.ts`](../src/services/LanguageService.ts:1) |
| `changeLanguage` | `(lang: string) => void` | [`LanguageService.ts`](../src/services/LanguageService.ts:1) |
| `t` | `(key: string, options?: any) => string` | `i18next` |

---

## Type Dependencies

### Type Definitions

| Type | Source | Used By |
|------|--------|---------|
| `User` | [`../src/types/index.ts:6`](../src/types/index.ts:6) | All components, services |
| `UserRole` | [`../src/types/index.ts:14`](../src/types/index.ts:14) | RoleService, AuthContext |
| `Coupon` | [`../src/types/index.ts:17`](../src/types/index.ts:17) | CouponList, AddCouponForm, CouponService |
| `CouponFormData` | [`../src/types/index.ts:33`](../src/types/index.ts:33) | AddCouponForm, CouponService |
| `CouponData` | [`../src/types/index.ts:46`](../src/types/index.ts:46) | BarcodeScanner |
| `SortConfig` | [`../src/types/index.ts:60`](../src/types/index.ts:60) | CouponList |
| `FilterConfig` | [`../src/types/index.ts:65`](../src/types/index.ts:65) | CouponList |
| `RetailerStat` | [`../src/types/index.ts:75`](../src/types/index.ts:75) | RetailerList |
| `Language` | [`../src/types/index.ts:86`](../src/types/index.ts:86) | LanguageSelector |
| `ApiResponse<T>` | [`../src/types/index.ts:92`](../src/types/index.ts:92) | Services |

---

## Testing Dependencies

### Test File Dependencies

| Test File | Tested Component/Service | Dependencies |
|-----------|---------------------------|--------------|
| [`../src/test/components/AddCouponForm.test.jsx`](../src/test/components/AddCouponForm.test.jsx:1) | AddCouponForm | `@testing-library/react`, `vitest`, `msw` |
| [`../src/test/components/BarcodeScanner.test.jsx`](../src/test/components/BarcodeScanner.test.jsx:1) | BarcodeScanner | `@testing-library/react`, `vitest` |
| [`../src/test/components/CouponList.test.jsx`](../src/test/components/CouponList.test.jsx:1) | CouponList | `@testing-library/react`, `vitest`, `msw` |
| [`../src/test/components/CouponList.mobile.test.jsx`](../src/test/components/CouponList.mobile.test.jsx:1) | CouponList (mobile) | `@testing-library/react`, `vitest` |
| [`../src/test/components/LanguageSelector.test.jsx`](../src/test/components/LanguageSelector.test.jsx:1) | LanguageSelector | `@testing-library/react`, `vitest` |
| [`../src/test/components/LanguageSelector.real.test.jsx`](../src/test/components/LanguageSelector.real.test.jsx:1) | LanguageSelector (real) | `@testing-library/react`, `vitest` |
| [`../src/test/components/LoginForm.test.jsx`](../src/test/components/LoginForm.test.jsx:1) | LoginForm | `@testing-library/react`, `vitest`, `msw` |
| [`../src/test/components/RetailerList.test.jsx`](../src/test/components/RetailerList.test.jsx:1) | RetailerList | `@testing-library/react`, `vitest`, `msw` |
| [`../src/test/components/RetailerList.mobile.test.jsx`](../src/test/components/RetailerList.mobile.test.jsx:1) | RetailerList (mobile) | `@testing-library/react`, `vitest` |
| [`../src/test/services/AuthContext.test.jsx`](../src/test/services/AuthContext.test.jsx:1) | AuthContext | `@testing-library/react`, `vitest` |
| [`../src/test/services/AuthService.test.js`](../src/test/services/AuthService.test.js:1) | AuthService | `vitest` |
| [`../src/test/services/CouponService.test.js`](../src/test/services/CouponService.test.js:1) | CouponService | `vitest` |
| [`../src/test/services/SupabaseCouponService.test.js`](../src/test/services/SupabaseCouponService.test.js:1) | SupabaseCouponService | `vitest` |
| [`../src/test/services/RoleService.test.js`](../src/test/services/RoleService.test.js:1) | RoleService | `vitest` |
| [`../src/test/services/LanguageContext.test.jsx`](../src/test/services/LanguageContext.test.jsx:1) | LanguageContext | `@testing-library/react`, `vitest` |
| [`../src/test/services/LanguageContext.real.test.jsx`](../src/test/services/LanguageContext.real.test.jsx:1) | LanguageContext (real) | `@testing-library/react`, `vitest` |
| [`../src/test/services/LanguageService.test.js`](../src/test/services/LanguageService.test.js:1) | LanguageService | `vitest` |
| [`../src/test/services/i18n.test.js`](../src/test/services/i18n.test.js:1) | i18n configuration | `vitest` |

### Mock Dependencies

| Mock File | Purpose |
|-----------|---------|
| [`../src/mocks/browser.js`](../src/mocks/browser.js:1) | MSW browser worker setup |
| [`../src/mocks/handlers.js`](../src/mocks/handlers.js:1) | MSW API request handlers |
| [`../src/mocks/data/coupons.js`](../src/mocks/data/coupons.js:1) | Mock coupon data |
| [`../src/mocks/data/users.js`](../src/mocks/data/users.js:1) | Mock user data |
| [`../src/mocks/data/index.js`](../src/mocks/data/index.js:1) | Mock data exports |
| [`../src/mocks/services/AuthService.js`](../src/mocks/services/AuthService.js:1) | Mock auth service |
| [`../src/mocks/services/RoleService.js`](../src/mocks/services/RoleService.js:1) | Mock role service |

---

## Development Tools Dependencies

### Linting and Formatting

| Tool | Configuration File | Purpose |
|------|-------------------|---------|
| **ESLint** | `eslint.config.js` (implicit) | Code linting and style checking |
| **Prettier** | `.prettierrc` (implicit) | Code formatting |

### Package Manager

| Tool | Version | Purpose |
|------|---------|---------|
| **pnpm** | Latest | Fast, disk space efficient package manager |

### Environment Configuration

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable template |
| `.env` | Local environment variables (not in repo) |
| `.cursorignore` | Files to ignore for Cursor AI |

---

## Configuration File Dependencies

### TypeScript Configuration

| File | Purpose |
|------|---------|
| [`tsconfig.json`](../tsconfig.json:1) | TypeScript compiler configuration |
| [`tsconfig.node.json`](../tsconfig.node.json:1) | TypeScript config for Node.js scripts |

### Build Configuration

| File | Purpose |
|------|---------|
| [`vite.config.ts`](../vite.config.ts:1) | Vite build tool configuration |
| [`vitest.config.ts`](../vitest.config.ts:1) | Vitest testing framework configuration |
| [`vitest.config.js`](../vitest.config.js:1) | Vitest configuration (legacy) |

### Package Configuration

| File | Purpose |
|------|---------|
| [`package.json`](../package.json:1) | Project metadata and scripts |

---

## Migration System Dependencies

### Migration Files

| File | Description |
|------|-------------|
| [`../migrations/migrations.json`](../migrations/migrations.json:1) | Migration tracking metadata |
| [`../migrations/sql/20250306100000-create_coupons_table.sql`](../migrations/sql/20250306100000-create_coupons_table.sql:1) | Create coupons table |
| [`../migrations/sql/20250306100001-add_user_roles_and_coupon_ownership.sql`](../migrations/sql/20250306100001-add_user_roles_and_coupon_ownership.sql:1) | Add user roles and ownership |
| [`../migrations/sql/20250306100002-enable_rls_for_coupons.sql`](../migrations/sql/20250306100002-enable_rls_for_coupons.sql:1) | Enable RLS for coupons |
| [`../migrations/sql/20250306100003-enable_rls_for_user_roles.sql`](../migrations/sql/20250306100003-enable_rls_for_user_roles.sql:1) | Enable RLS for user roles |
| [`../migrations/sql/20250306100004-add_foreign_keys_for_rls.sql`](../migrations/sql/20250306100004-add_foreign_keys_for_rls.sql:1) | Add foreign keys for RLS |
| [`../migrations/sql/20250306100005-add_notes_to_coupons.sql`](../migrations/sql/20250306100005-add_notes_to_coupons.sql:1) | Add notes field to coupons |

### Migration Scripts

| Script | Purpose | Dependencies |
|--------|---------|--------------|
| [`../scripts/create-migration.js`](../scripts/create-migration.js:1) | Create new migration file | `fs`, `path` |
| [`../scripts/run-sql-migrations.js`](../scripts/run-sql-migrations.js:1) | Run SQL migrations | `pg`, `dotenv` |
| [`../scripts/test-db-connection.js`](../scripts/test-db-connection.js:1) | Test database connection | `pg`, `dotenv` |
| [`../scripts/add-mock-data.js`](../scripts/add-mock-data.js:1) | Add mock data to database | `pg`, `dotenv` |
| [`../scripts/generate-diagrams.js`](../scripts/generate-diagrams.js:1) | Generate documentation diagrams | `@mermaid-js/mermaid-cli` |

---

## i18n Translation Dependencies

### Translation Files

| Language | File | Status |
|----------|------|--------|
| English | [`../src/locales/en/common.json`](../src/locales/en/common.json:1) | Complete |
| French | [`../src/locales/fr/common.json`](../src/locales/fr/common.json:1) | Complete |
| German | [`../src/locales/de/common.json`](../src/locales/de/common.json:1) | Complete |
| Spanish | [`../src/locales/es/common.json`](../src/locales/es/common.json:1) | Complete |

### i18n Configuration

| File | Purpose |
|------|---------|
| [`../src/i18n.ts`](../src/i18n.ts:1) | i18next configuration |

---

## Cross-References

- **Project Context:** [`.cursor/PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md:1)
- **Agent Instructions:** [`.cursor/AGENT_INSTRUCTIONS.md`](AGENT_INSTRUCTIONS.md:1)
- **Workflow Constraints:** [`.cursor/WORKFLOW_CONSTRAINTS.md`](WORKFLOW_CONSTRAINTS.md:1)
- **Quick Reference:** [`.cursor/QUICK_REFERENCE.md`](QUICK_REFERENCE.md:1)
- **Package.json:** [`../package.json`](../package.json:1)

---

**End of Dependency Mapping**

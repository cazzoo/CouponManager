# Quick Reference

**Version:** 1.0.0  
**Purpose:** Quick reference guide for common tasks and patterns  
**Last Updated:** 2025-01-23

---

## Common Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with in-memory DB and mock data |
| `pnpm dev:supabase` | Start development server with Supabase connection |
| `pnpm dev:memory` | Start development server with in-memory DB (explicit) |
| `pnpm build` | Build production bundle |
| `pnpm preview` | Preview production build locally |

### Testing Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:ui` | Run Vitest UI (if available) |

### Build Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |

### Migration Commands

| Command | Description |
|---------|-------------|
| `pnpm migrate` | Run all pending migrations |
| `pnpm migrate:up` | Run all pending migrations (alias) |
| `pnpm migrate:list` | List all migrations |
| `pnpm migrate:status` | Check migration status |
| `pnpm migrate:create` | Create a new migration file |
| `pnpm db:test` | Test database connection |
| `pnpm db:mock` | Add mock data to database |

### Documentation Commands

| Command | Description |
|---------|-------------|
| `pnpm generate-diagrams` | Generate documentation diagrams |
| `pnpm docs` | Generate documentation diagrams (alias) |

### Linting Commands

| Command | Description |
|---------|-------------|
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |

---

## File Locations

### Components Directory

| File | Purpose |
|------|---------|
| [`../src/components/AddCouponForm.tsx`](../src/components/AddCouponForm.tsx:1) | Form for adding new coupons |
| [`../src/components/BarcodeScanner.tsx`](../src/components/BarcodeScanner.tsx:1) | QR/barcode scanner component |
| [`../src/components/CouponList.tsx`](../src/components/CouponList.tsx:1) | List and manage coupons |
| [`../src/components/LanguageSelector.tsx`](../src/components/LanguageSelector.tsx:1) | Language selection dropdown |
| [`../src/components/LoginForm.tsx`](../src/components/LoginForm.tsx:1) | User login form |
| [`../src/components/RetailerList.tsx`](../src/components/RetailerList.tsx:1) | Retailer statistics and list |
| [`../src/components/UserManagement.tsx`](../src/components/UserManagement.tsx:1) | User role management (managers only) |

### Services Directory

| File | Purpose |
|------|---------|
| [`../src/services/AuthService.ts`](../src/services/AuthService.ts:1) | In-memory auth implementation |
| [`../src/services/AuthServiceFactory.ts`](../src/services/AuthServiceFactory.ts:1) | Auth service factory |
| [`../src/services/AuthContext.tsx`](../src/services/AuthContext.tsx:1) | React auth context provider |
| [`../src/services/CouponService.ts`](../src/services/CouponService.ts:1) | In-memory coupon service |
| [`../src/services/CouponServiceFactory.ts`](../src/services/CouponServiceFactory.ts:1) | Coupon service factory |
| [`../src/services/SupabaseCouponService.ts`](../src/services/SupabaseCouponService.ts:1) | Supabase coupon service |
| [`../src/services/RoleService.ts`](../src/services/RoleService.ts:1) | Role and permission management |
| [`../src/services/RoleServiceFactory.ts`](../src/services/RoleServiceFactory.ts:1) | Role service factory |
| [`../src/services/SupabaseClient.ts`](../src/services/SupabaseClient.ts:1) | Supabase client configuration |
| [`../src/services/LanguageService.ts`](../src/services/LanguageService.ts:1) | i18n service |
| [`../src/services/LanguageContext.tsx`](../src/services/LanguageContext.tsx:1) | React language context provider |

### Types Directory

| File | Purpose |
|------|---------|
| [`../src/types/index.ts`](../src/types/index.ts:1) | All TypeScript type definitions |

### Test Directory

| Subdirectory | Purpose |
|--------------|---------|
| `../src/test/components/` | Component tests |
| `../src/test/services/` | Service tests |
| `../src/test/util/` | Test utilities and helpers |

### Documentation Directory

| File | Purpose |
|------|---------|
| [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md:1) | System architecture and design patterns |
| [`../docs/CODING_STANDARDS.md`](../docs/CODING_STANDARDS.md:1) | Coding standards and best practices |
| [`../docs/CONTRIBUTING.md`](../docs/CONTRIBUTING.md:1) | Contribution guidelines |
| [`../docs/README.md`](../docs/README.md:1) | Documentation index |
| [`../docs/data-models.md`](../docs/data-models.md:1) | Data models and schemas |
| [`../docs/permission-matrix.md`](../docs/permission-matrix.md:1) | Role-based permissions |
| [`../docs/migration-system.md`](../docs/migration-system.md:1) | Database migration system |
| [`../docs/testing-standards.md`](../docs/testing-standards.md:1) | Testing practices and requirements |

---

## Key Files

### Configuration Files

| File | Purpose |
|------|---------|
| [`../package.json`](../package.json:1) | Project metadata and scripts |
| [`../tsconfig.json`](../tsconfig.json:1) | TypeScript configuration |
| [`../vite.config.ts`](../vite.config.ts:1) | Vite build configuration |
| [`../vitest.config.ts`](../vitest.config.ts:1) | Vitest test configuration |
| [`.env.example`](../.env.example:1) | Environment variable template |
| [`.gitignore`](../.gitignore:1) | Git ignore patterns |
| [`.cursorignore`](../.cursorignore:1) | Cursor AI ignore patterns |

### Entry Points

| File | Purpose |
|------|---------|
| [`../src/index.tsx`](../src/index.tsx:1) | Application entry point |
| [`../src/App.tsx`](../src/App.tsx:1) | Main application component |
| [`../index.html`](../index.html:1) | HTML entry point |

### Service Factories

| File | Purpose |
|------|---------|
| [`../src/services/AuthServiceFactory.ts`](../src/services/AuthServiceFactory.ts:1) | Get auth service instance |
| [`../src/services/CouponServiceFactory.ts`](../src/services/CouponServiceFactory.ts:1) | Get coupon service instance |
| [`../src/services/RoleServiceFactory.ts`](../src/services/RoleServiceFactory.ts:1) | Get role service instance |

### Context Providers

| File | Purpose |
|------|---------|
| [`../src/services/AuthContext.tsx`](../src/services/AuthContext.tsx:1) | Authentication state provider |
| [`../src/services/LanguageContext.tsx`](../src/services/LanguageContext.tsx:1) | Language state provider |

---

## Common Patterns

### Component Structure

```typescript
/**
 * Brief description of component purpose
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../services/LanguageContext';
import { getCouponService } from '../services/CouponServiceFactory';
import type { Coupon } from '../types';

interface ComponentNameProps {
  // Prop definitions
}

export const ComponentName: React.FC<ComponentNameProps> = ({ prop }) => {
  // Hooks
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State
  const [state, setState] = useState<Type>(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### Service Structure

```typescript
/**
 * Brief description of service purpose
 */

import type { Coupon, CouponFormData } from '../types';

class ServiceName {
  private data: Type;
  
  constructor() {
    // Initialization
  }
  
  async method(params: Type): Promise<ReturnType> {
    try {
      // Method logic
      return result;
    } catch (error) {
      console.error('Error in ServiceName.method:', error);
      throw error;
    }
  }
}

export default new ServiceName();
```

### Hook Usage

```typescript
// Auth Hook
const { user, login, logout, signUp } = useAuth();

// Language Hook
const { language, changeLanguage, t } = useLanguage();

// Example usage
const handleLogin = async () => {
  await login(email, password);
};

const translatedText = t('key', { defaultValue: 'Default' });
```

### Test Structure (AAA Pattern)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });
  
  it('should do something', async () => {
    // Arrange - Set up test data
    const mockData = { /* ... */ };
    
    // Act - Execute the function
    render(<ComponentName prop={mockData} />);
    
    // Assert - Verify the expected outcome
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Build fails with TypeScript errors** | Check [`tsconfig.json`](../tsconfig.json:1) and ensure strict mode compliance |
| **Tests fail with coverage < 80%** | Add tests for uncovered code paths |
| **Supabase connection fails** | Verify environment variables in `.env` file |
| **Mock data not loading** | Ensure `VITE_AUTO_MOCK_DATA=true` is set |
| **Translations not showing** | Check translation files in [`src/locales/`](../src/locales/) |
| **RLS policies blocking access** | Verify policies in [`migrations/sql/`](../migrations/sql/) |
| **Factory returns wrong service** | Check `VITE_USE_MEMORY_DB` environment variable |

### Common Solutions

#### Issue: Cannot access Supabase from development

```bash
# Solution: Set environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
pnpm dev:supabase
```

#### Issue: Tests fail with "Cannot find module"

```bash
# Solution: Install dependencies
pnpm install

# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Issue: Build fails with "Module not found"

```bash
# Solution: Check import paths
# Use relative imports: '../services/AuthService'
# Or use path aliases: '@/services/AuthService' (if configured)
```

#### Issue: Coverage not generated

```bash
# Solution: Run coverage command explicitly
pnpm test:coverage

# Check vitest.config.ts for coverage settings
```

#### Issue: Migrations not applying

```bash
# Solution: Check migration status
pnpm migrate:status

# Run migrations manually
pnpm migrate:up

# Test database connection
pnpm db:test
```

### Where to Look for Help

| Topic | Documentation |
|-------|---------------|
| Architecture questions | [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md:1) |
| Coding standards | [`../docs/CODING_STANDARDS.md`](../docs/CODING_STANDARDS.md:1) |
| Contribution workflow | [`../docs/CONTRIBUTING.md`](../docs/CONTRIBUTING.md:1) |
| Permission system | [`../docs/permission-matrix.md`](../docs/permission-matrix.md:1) |
| Migration system | [`../docs/migration-system.md`](../docs/migration-system.md:1) |
| Testing practices | [`../docs/testing-standards.md`](../docs/testing-standards.md:1) |
| Supabase setup | [`../docs/supabase-setup.md`](../docs/supabase-setup.md:1) |
| RLS policies | [`../docs/supabase-rls.md`](../docs/supabase-rls.md:1) |
| i18n system | [`../docs/i18n-system.md`](../docs/i18n-system.md:1) |

---

## Environment Variables Reference

### Development Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_MEMORY_DB` | `false` | Use in-memory database instead of Supabase |
| `VITE_AUTO_MOCK_DATA` | `false` | Auto-inject mock data on startup |

### Production Variables (Required)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_KEY` | Supabase anon/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for migrations) |
| `SUPABASE_DB_HOST` | Database host |
| `SUPABASE_DB_PORT` | Database port (typically 5432) |
| `SUPABASE_DB_NAME` | Database name (typically postgres) |
| `SUPABASE_DB_USER` | Database user |
| `SUPABASE_DB_PASSWORD` | Database password |

---

## User Roles Reference

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **user** | Create, read, update, delete own coupons | Own data only |
| **manager** | All user permissions + manage users, view all coupons | Full system access |
| **demo** | View sample coupons only | Read-only sample data |

**See:** [`../docs/permission-matrix.md`](../docs/permission-matrix.md:1) for detailed permission matrix

---

## Supported Languages

| Code | Language | Translation File |
|------|----------|------------------|
| `en` | English | [`../src/locales/en/common.json`](../src/locales/en/common.json:1) |
| `fr` | French | [`../src/locales/fr/common.json`](../src/locales/fr/common.json:1) |
| `de` | German | [`../src/locales/de/common.json`](../src/locales/de/common.json:1) |
| `es` | Spanish | [`../src/locales/es/common.json`](../src/locales/es/common.json:1) |

---

## Quick Type Reference

### Core Types

```typescript
// User
interface User {
  id: string;
  email: string;
  role: 'user' | 'manager' | 'demo';
  created_at?: string;
  last_sign_in_at?: string;
}

// Coupon
interface Coupon {
  id: string;
  userId: string;
  retailer: string;
  initialValue: string;
  currentValue: string;
  expirationDate?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  barcode?: string;
  reference?: string;
  activationCode?: string;
  pin?: string;
}

// Coupon Form Data
interface CouponFormData {
  retailer: string;
  initialValue: string;
  currentValue?: string;
  expirationDate?: string;
  notes?: string;
  barcode?: string;
  reference?: string;
  activationCode?: string;
  pin?: string;
}
```

**See:** [`../src/types/index.ts`](../src/types/index.ts:1) for complete type definitions

---

## Cross-References

- **Project Context:** [`.cursor/PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md:1)
- **Agent Instructions:** [`.cursor/AGENT_INSTRUCTIONS.md`](AGENT_INSTRUCTIONS.md:1)
- **Dependency Mapping:** [`.cursor/DEPENDENCY_MAPPING.md`](DEPENDENCY_MAPPING.md:1)
- **Workflow Constraints:** [`.cursor/WORKFLOW_CONSTRAINTS.md`](WORKFLOW_CONSTRAINTS.md:1)
- **Architecture:** [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md:1)
- **Coding Standards:** [`../docs/CODING_STANDARDS.md`](../docs/CODING_STANDARDS.md:1)
- **Contribution Guidelines:** [`../docs/CONTRIBUTING.md`](../docs/CONTRIBUTING.md:1)

---

**End of Quick Reference**

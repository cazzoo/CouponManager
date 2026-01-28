# AI Agent Configuration for CouponManager

**Version:** 1.0.0
**Purpose:** Comprehensive configuration for AI coding agents (Kilo Code, OpenCode, etc.)
**Last Updated:** 2025-01-27
**Project:** CouponManager - React-based coupon management application

---

## Quick Start for AI Agents

### Essential Commands
```bash
# Development (in-memory DB with mock data)
pnpm dev

# Development with Supabase
pnpm dev:supabase

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# Build
pnpm build

# Database operations
pnpm db:test
pnpm migrate:up
pnpm db:mock
```

### Critical Constraints
- **Strict TypeScript mode enabled** - All code must have explicit types
- **80% test coverage required** - Enforced via CI/CD
- **Factory pattern mandatory** - Always access services via factories, never directly instantiate
- **pnpm only** - Use pnpm for all package operations
- **TDD approach** - Write tests first, then implement
- **Run from root** - All commands executed from project root directory

---

## Project Overview

### Project Information
- **Name:** CouponManager
- **Type:** React 18 + TypeScript web application
- **Purpose:** Manage vouchers and coupons with role-based access control
- **Package Manager:** pnpm
- **Build Tool:** Vite
- **Backend:** Supabase (PostgreSQL with RLS)

### Technology Stack
| Category | Technology | Version |
|----------|------------|---------|
| Frontend Framework | React | 18.2.0 |
| Language | TypeScript | 5.x |
| UI Library | Material-UI (MUI) | 5.15.0 |
| Build Tool | Vite | 5.0.0 |
| Testing | Vitest | 3.0.7 |
| Testing Library | React Testing Library | 16.2.0 |
| Backend | Supabase | 2.49.1 |
| i18n | i18next | 24.2.2 |
| Barcode Scanning | react-qr-reader | 3.0.0-beta-1 |

### Key Features
- Add, edit, delete coupons with detailed tracking
- QR/barcode scanning for quick entry
- Role-based access control (user, manager, demo)
- Multi-language support (en, fr, de, es)
- Retailer statistics and filtering
- In-memory DB for development, Supabase for production
- Row-Level Security (RLS) for data access control

---

## Architecture

### Layered Architecture
```
Presentation Layer (React Components)
    ↓
Context Layer (AuthContext, LanguageContext)
    ↓
Service Layer (AuthService, CouponService, RoleService + Factories)
    ↓
Data Layer (In-Memory DB / Supabase PostgreSQL + RLS)
```

### Design Patterns
- **Factory Pattern:** Service abstraction and environment-based switching
- **Context API:** State management and prop drilling avoidance
- **Repository Pattern:** Data access abstraction
- **Adapter Pattern:** Mock services adapting to service interfaces

### Critical Pattern: Factory Pattern
**MUST ALWAYS USE:** All services are accessed via factory methods:

```typescript
// ✅ Correct - Use factory
import { getCouponService } from './services/CouponServiceFactory';
const service = getCouponService();

// ❌ Incorrect - Never instantiate directly
import CouponService from './services/CouponService';
const service = new CouponService();
```

**Factory Files:**
- `src/services/AuthServiceFactory.ts`
- `src/services/CouponServiceFactory.ts`
- `src/services/RoleServiceFactory.ts`

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

---

## File Structure

```
CouponManager/
├── src/
│   ├── components/          # React components (7 files)
│   │   ├── AddCouponForm.tsx
│   │   ├── BarcodeScanner.tsx
│   │   ├── CouponList.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RetailerList.tsx
│   │   └── UserManagement.tsx
│   ├── services/           # Business logic (11 files)
│   │   ├── AuthService.ts
│   │   ├── AuthServiceFactory.ts
│   │   ├── AuthContext.tsx
│   │   ├── CouponService.ts
│   │   ├── CouponServiceFactory.ts
│   │   ├── SupabaseCouponService.ts
│   │   ├── RoleService.ts
│   │   ├── RoleServiceFactory.ts
│   │   ├── SupabaseClient.ts
│   │   ├── LanguageService.ts
│   │   └── LanguageContext.tsx
│   ├── types/              # Type definitions
│   │   └── index.ts
│   ├── locales/            # i18n translations (en, fr, de, es)
│   ├── mocks/              # Mock data and services
│   └── test/               # Test files
│       ├── components/
│       ├── services/
│       └── util/
├── docs/                   # Documentation
├── migrations/             # SQL migrations
├── scripts/                # Utility scripts
└── public/                 # Static assets
```

---

## Coding Standards

### TypeScript Strict Mode Compliance
```typescript
// ✅ Correct - Explicit types
const formatDate = (date: string, locale: string = 'en-US'): string => {
  return new Date(date).toLocaleDateString(locale);
};

// ❌ Incorrect - Implicit any
function processData(data) {
  return data.map(item => item.value);
}

// ✅ Correct - Explicit null check
const coupon = coupons.find(c => c.id === id);
if (coupon) {
  console.log(coupon.retailer);
}

// ❌ Incorrect - Potential null reference
const coupon = coupons.find(c => c.id === id);
console.log(coupon.retailer);
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CouponList`, `AddCouponForm` |
| Services | PascalCase | `CouponService`, `AuthService` |
| Factories | PascalCase + Factory suffix | `CouponServiceFactory` |
| Contexts | PascalCase + Context suffix | `AuthContext` |
| Hooks | use + PascalCase | `useCoupons`, `useAuth` |
| Types/Interfaces | PascalCase | `Coupon`, `CouponFormData` |
| Variables | camelCase | `userId`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |

### Component Structure Template
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

### Service Structure Template
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

---

## Testing Standards

### Test-Driven Development (TDD)
1. **RED:** Write failing tests first that define expected behavior
2. **GREEN:** Implement minimal code to make tests pass
3. **REFACTOR:** Clean up code while keeping tests passing

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Service tests: `ServiceName.test.ts`
- Real backend tests: `*.real.test.tsx` or `*.real.test.ts`
- Mobile-specific tests: `*.mobile.test.tsx`

### Test Structure (AAA Pattern)
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
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

### Coverage Requirements
- **Minimum 80% coverage** (enforced via CI/CD)
- All critical paths must be tested
- Edge cases should be covered
- Check coverage: `pnpm test:coverage`

---

## Role-Based Access Control

### User Roles
| Role | Permissions | Access Level |
|------|-------------|--------------|
| **user** | Create, read, update, delete own coupons | Own data only |
| **manager** | All user permissions + manage users, view all coupons | Full system access |
| **demo** | View sample coupons only | Read-only sample data |

### Permission Enforcement
```typescript
// In services, verify ownership before operations
if (user.role === 'user' && coupon.userId !== user.id) {
  throw new Error('Access denied: You can only access your own coupons');
}
```

### Ownership Checks
- All coupon operations must check `userId` ownership
- Ownership check must be performed in service layer
- RLS policies provide server-side enforcement

---

## Environment Configuration

### Development Mode
```bash
# In-memory database with mock data
pnpm dev
# Equivalent to: VITE_USE_MEMORY_DB=true VITE_AUTO_MOCK_DATA=true
```

### Production Mode
```bash
# Supabase connection required
pnpm dev:supabase
```

### Environment Variables
| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `VITE_USE_MEMORY_DB` | Enable in-memory database | No | false |
| `VITE_AUTO_MOCK_DATA` | Auto-inject mock data | No | false |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes (prod) | - |
| `VITE_SUPABASE_KEY` | Supabase anon key | Yes (prod) | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes (prod) | - |

---

## Database & Migrations

### Migration Commands
```bash
# Test database connection
pnpm db:test

# Run all pending migrations
pnpm migrate:up

# List all migrations
pnpm migrate:list

# Check migration status
pnpm migrate:status

# Create new migration
pnpm migrate:create migration_name "Optional description"

# Add mock data
pnpm db:mock
```

### Migration Format
```
migrations/sql/YYYYMMDDHHMMSS-description.sql
```

### RLS Policies
- Row-Level Security enabled for production
- Users can only access their own data
- Managers have full system access
- Defined in: `migrations/sql/`

---

## Internationalization

### Supported Languages
| Code | Language | Translation File |
|------|----------|------------------|
| `en` | English | `src/locales/en/common.json` |
| `fr` | French | `src/locales/fr/common.json` |
| `de` | German | `src/locales/de/common.json` |
| `es` | Spanish | `src/locales/es/common.json` |

### Usage Pattern
```typescript
const { language, changeLanguage, t } = useLanguage();

// Change language
changeLanguage('fr');

// Translate
const text = t('key', { defaultValue: 'Default text' });
```

---

## File Modification Rules

### Files That CAN Be Modified
| Directory/File | Notes |
|----------------|-------|
| `src/components/*.tsx` | React components |
| `src/services/*.ts` | Service implementations |
| `src/services/*.tsx` | Context providers |
| `src/types/index.ts` | Type definitions |
| `src/locales/**/*.json` | Translation files |
| `src/test/**/*.test.tsx` | Test files |
| `src/test/**/*.test.ts` | Test files |
| `docs/*.md` | Documentation |
| `AGENTS.md` | This file |

### Files That SHOULD NOT Be Modified
| Directory/File | Reason |
|----------------|--------|
| `.gitignore` | Version control configuration |
| `package.json` | Dependency management (maintainers only) |
| `pnpm-lock.yaml` | Lock file (auto-generated) |
| `.env` | Contains sensitive data |
| `.env.example` | Environment template |
| `tsconfig.json` | TypeScript configuration (maintainers only) |
| `vite.config.ts` | Build configuration (maintainers only) |
| `.github/workflows/*` | CI/CD workflows (maintainers only) |
| `migrations/sql/*.sql` | Database migrations (maintainers only) |

---

## Common Workflows

### Adding a New Feature
1. Understand requirements
2. Identify affected components and services
3. Follow layered architecture (data → service → component)
4. Use factory pattern to access services
5. Write tests first (TDD)
6. Implement code
7. Update documentation
8. Verify 80% coverage

### Fixing a Bug
1. Reproduce and understand the issue
2. Identify the root cause
3. Check related tests
4. Make minimal changes to fix
5. Add/update tests
6. Verify no side effects
7. Run all tests

### Refactoring Code
1. Understand existing implementation
2. Identify code smells or violations
3. Break down into small, safe changes
4. Ensure tests exist before refactoring
5. Make one change at a time
6. Run tests after each change
7. Update tests if API changes

---

## Error Handling Guidelines

### Service Error Handling
```typescript
async addCoupon(couponData: CouponFormData, userId?: string | null): Promise<Coupon> {
  try {
    // Validate input
    if (!couponData.retailer || !couponData.initialValue) {
      throw new Error('Retailer and initial value are required');
    }

    // Execute operation
    const result = await this.db.insert(couponData);
    return result;
  } catch (error) {
    console.error('Error adding coupon:', error);
    throw new Error(`Failed to add coupon: ${error.message}`);
  }
}
```

### Component Error Handling
```typescript
const handleSubmit = async () => {
  try {
    await service.addCoupon(couponData, user.id);
    // Show success message
  } catch (error) {
    // Show error message to user
    setError(error.message);
  }
};
```

### Async Error Handling
```typescript
// ✅ Correct - Always await
const coupon = await service.getCoupon(id);

// ❌ Incorrect - Promise not awaited
const coupon = service.getCoupon(id);

// ✅ Correct - Try-catch
try {
  const result = await service.operation();
} catch (error) {
  // Handle error
}
```

---

## Troubleshooting

### Common Issues
| Issue | Solution |
|-------|----------|
| Build fails with TypeScript errors | Check tsconfig.json and ensure strict mode compliance |
| Tests fail with coverage < 80% | Add tests for uncovered code paths |
| Supabase connection fails | Verify environment variables in `.env` file |
| Mock data not loading | Ensure `VITE_AUTO_MOCK_DATA=true` is set |
| Translations not showing | Check translation files in `src/locales/` |
| RLS policies blocking access | Verify policies in `migrations/sql/` |
| Factory returns wrong service | Check `VITE_USE_MEMORY_DB` environment variable |

### Where to Look for Help
| Topic | Documentation |
|-------|---------------|
| Architecture questions | `ARCHITECTURE.md` |
| Coding standards | `docs/CODING_STANDARDS.md` |
| Contribution workflow | `docs/CONTRIBUTING.md` |
| Permission system | `docs/permission-matrix.md` |
| Migration system | `docs/migration-system.md` |
| Testing practices | `docs/testing-standards.md` |
| Supabase setup | `docs/supabase-setup.md` |
| RLS policies | `docs/supabase-rls.md` |
| i18n system | `docs/i18n-system.md` |

---

## Critical Reminders for AI Agents

### ✅ DO:
- Follow TDD - write tests first
- Use factory pattern for service access
- Maintain 80%+ test coverage
- Run commands from project root (no cd)
- Use pnpm for all package operations
- Follow TypeScript strict mode
- Enforce role-based permissions
- Handle errors gracefully
- Update documentation with changes
- Use explicit types everywhere

### ❌ DO NOT:
- Modify .gitignore, package.json, tsconfig.json, vite.config.ts
- Create new database migrations
- Modify CI/CD workflows
- Access external APIs directly (only via Supabase)
- Modify environment files (.env)
- Bypass factory pattern
- Create new design patterns
- Access database outside services
- Use npm or yarn (use pnpm only)

---

## Type References

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

See `src/types/index.ts` for complete type definitions.

---

## Related Documentation

- **Architecture:** `ARCHITECTURE.md`
- **Coding Standards:** `docs/CODING_STANDARDS.md`
- **Contribution Guidelines:** `docs/CONTRIBUTING.md`
- **Permission Matrix:** `docs/permission-matrix.md`
- **Migration System:** `docs/migration-system.md`
- **Testing Standards:** `docs/testing-standards.md`
- **Supabase Setup:** `docs/supabase-setup.md`
- **i18n System:** `docs/i18n-system.md`

---

**End of AI Agent Configuration**

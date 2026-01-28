# Coding Standards for CouponManager

**Version:** 2.0.0
**Status:** Authoritative Reference
**Last Updated:** 2026-01-26

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [File and Directory Structure](#file-and-directory-structure)
4. [Naming Conventions](#naming-conventions)
5. [Component Standards](#component-standards)
6. [Service Layer Standards](#service-layer-standards)
7. [Context Standards](#context-standards)
8. [Testing Standards](#testing-standards)
9. [Code Organization](#code-organization)
10. [React Best Practices](#react-best-practices)
11. [TypeScript Best Practices](#typescript-best-practices)
12. [Security Best Practices](#security-best-practices)
13. [Performance Best Practices](#performance-best-practices)
14. [Code Review Guidelines](#code-review-guidelines)
15. [Linting and Formatting](#linting-and-formatting)

---

## General Principles

### Code Philosophy

The CouponManager application follows these core principles:

1. **Readability First:** Code should be self-documenting and easy to understand at a glance
2. **Maintainability:** Code should be easy to modify and extend without breaking existing functionality
3. **Type Safety:** Leverage TypeScript's type system to catch errors at compile time
4. **Consistency:** Follow established patterns throughout the codebase
5. **Simplicity:** Avoid over-engineering; solve problems with the simplest effective solution

### DRY (Don't Repeat Yourself)

Avoid code duplication by:

- Extracting common logic into reusable functions
- Using shared types and interfaces
- Creating custom hooks for repeated stateful logic
- Leveraging utility functions for common operations

**Example:**
```typescript
// ❌ Don't repeat logic
const formatDate1 = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US');
};

const formatDate2 = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US');
};

// ✅ Do extract to reusable function
const formatDate = (date: string, locale: string = 'en-US'): string => {
  const d = new Date(date);
  return d.toLocaleDateString(locale);
};
```

### KISS (Keep It Simple, Stupid)

- Prefer simple solutions over complex ones
- Avoid premature optimization
- Write code that is easy to understand and modify
- Use clear, descriptive names instead of clever abbreviations

### SOLID Principles Applied to React/TypeScript

#### Single Responsibility Principle
Each component, service, or function should have one reason to change.

**Example:**
```typescript
// ❌ Component doing too much
const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('en');
  // ... 500 lines of mixed concerns
};

// ✅ Separated concerns
const CouponList = ({ coupons }: { coupons: Coupon[] }) => { /* ... */ };
const CouponForm = ({ onSubmit }: { onSubmit: (data: CouponFormData) => void }) => { /* ... */ };
const CouponManager = () => {
  const { coupons } = useCoupons();
  return (
    <>
      <CouponList coupons={coupons} />
      <CouponForm onSubmit={handleAddCoupon} />
    </>
  );
};
```

#### Open/Closed Principle
Classes and modules should be open for extension but closed for modification.

**Example:**
```typescript
// ✅ Use interfaces for extensibility
export interface ICouponService {
  getAllCoupons(): Promise<Coupon[]>;
  addCoupon(coupon: CouponFormData, userId?: string | null): Promise<Coupon>;
  // ... other methods
}

// New implementations can be added without modifying existing code
class MockCouponService implements ICouponService { /* ... */ }
class SupabaseCouponService implements ICouponService { /* ... */ }
```

#### Liskov Substitution Principle
Derived classes must be substitutable for their base classes.

**Example:**
```typescript
// ✅ Any ICouponService implementation can be used interchangeably
const service: ICouponService = shouldUseMemoryDb() 
  ? new MockCouponService() 
  : new SupabaseCouponService();

const coupons = await service.getAllCoupons(); // Works for both implementations
```

#### Interface Segregation Principle
Clients should not depend on interfaces they don't use.

**Example:**
```typescript
// ❌ Too broad interface
interface IUserService {
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  resetPassword(id: string): Promise<void>;
  sendEmail(id: string, template: string): Promise<void>;
}

// ✅ Segregated interfaces
interface IUserService {
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

interface IPasswordService {
  resetPassword(id: string): Promise<void>;
}

interface IEmailService {
  sendEmail(userId: string, template: string): Promise<void>;
}
```

#### Dependency Inversion Principle
Depend on abstractions, not concretions.

**Example:**
```typescript
// ❌ Direct dependency on concrete implementation
import CouponService from './CouponService';

const CouponList = () => {
  const service = new CouponService(); // Tightly coupled
  // ...
};

// ✅ Dependency on abstraction via factory
import { getCouponService } from './CouponServiceFactory';

const CouponList = () => {
  const service = getCouponService(); // Loosely coupled
  // ...
};
```

---

## TypeScript Standards

### Type Annotations

#### Explicit vs Inferred Types

- **Use explicit types** for function parameters and return values
- **Use inferred types** for simple variable declarations
- **Use explicit types** for complex object literals
- **Use explicit types** for public API surfaces

**Examples:**
```typescript
// ✅ Explicit types for function parameters and returns
const formatDate = (date: string, locale: string = 'en-US'): string => {
  return new Date(date).toLocaleDateString(locale);
};

// ✅ Inferred types for simple variables
const count = 0;
const isActive = true;
const userName = 'John';

// ✅ Explicit types for complex objects
const coupon: Coupon = {
  id: '1',
  userId: 'user-123',
  retailer: 'Amazon',
  initialValue: '50',
  currentValue: '50',
  expirationDate: '2024-12-31'
};

// ✅ Explicit types for public API
export interface ICouponService {
  getAllCoupons(): Promise<Coupon[]>;
  addCoupon(coupon: CouponFormData, userId?: string | null): Promise<Coupon>;
}
```

### Interface vs Type Alias

**Use Interfaces for:**
- Object shapes that can be extended
- Class contracts
- Public API definitions

**Use Type Aliases for:**
- Union types
- Intersection types
- Primitive types
- Function types
- Complex type transformations

**Examples:**
```typescript
// ✅ Use interfaces for object shapes
export interface Coupon {
  id: string;
  userId: string;
  retailer: string;
  initialValue: string;
  currentValue: string;
  expirationDate?: string;
}

// ✅ Interfaces can be extended
export interface CouponFormData extends Partial<Coupon> {
  retailer: string;
  initialValue: string;
}

// ✅ Use type aliases for unions
type UserRole = 'user' | 'manager' | 'demo';
type SortOrder = 'asc' | 'desc';
type ThemeMode = 'light' | 'dark';

// ✅ Use type aliases for function types
type EventHandler = (event: Event) => void;
type AsyncCallback<T> = (data: T) => Promise<void>;

// ✅ Use type aliases for complex transformations
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### Enum vs Union Type

**Prefer Union Types** for string enums in TypeScript because:
- They are more type-safe
- They work better with type narrowing
- They have better tree-shaking support
- They are more flexible

**Examples:**
```typescript
// ❌ Avoid string enums (less type-safe, larger bundle)
enum UserRole {
  USER = 'user',
  MANAGER = 'manager',
  DEMO = 'demo'
}

// ✅ Use union types instead
type UserRole = 'user' | 'manager' | 'demo';

// ✅ Use const assertions for enum-like behavior
const UserRole = {
  USER: 'user',
  MANAGER: 'manager',
  DEMO: 'demo'
} as const;

type UserRole = typeof UserRole[keyof typeof UserRole];
```

### Generic Type Usage

**Use Generics for:**
- Reusable components
- Utility functions
- Service abstractions
- Type-safe data structures

**Examples:**
```typescript
// ✅ Generic component
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  // ...
}

// ✅ Generic utility function
function first<T>(array: T[]): T | undefined {
  return array[0];
}

// ✅ Generic service interface
export interface IService<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ✅ Generic with constraints
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}
```

### Strict Mode Compliance

The project uses TypeScript strict mode ([`tsconfig.json`](tsconfig.json:10)). Always ensure:

1. **No implicit any types**
2. **All variables are initialized before use**
3. **Null checks are explicit**
4. **Function return types are correct**

**Examples:**
```typescript
// ❌ Implicit any
function processData(data) {
  return data.map(item => item.value);
}

// ✅ Explicit types
function processData(data: Array<{ value: string }>): string[] {
  return data.map(item => item.value);
}

// ❌ Potential null reference
const coupon = coupons.find(c => c.id === id);
console.log(coupon.retailer); // Error: Object is possibly 'undefined'

// ✅ Explicit null check
const coupon = coupons.find(c => c.id === id);
if (coupon) {
  console.log(coupon.retailer);
}

// ✅ Optional chaining
const retailer = coupons.find(c => c.id === id)?.retailer;
```

### Type Imports vs Value Imports

Use type-only imports when importing types to avoid runtime dependencies.

**Examples:**
```typescript
// ✅ Type-only import
import type { Coupon, CouponFormData, UserRole } from '../types';

// ✅ Mixed import (type and value)
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// ✅ Export type
export type { Coupon, CouponFormData };

// ❌ Avoid importing types as values
import { Coupon } from '../types'; // If only used as a type
```

---

## File and Directory Structure

### Directory Organization

```
src/
├── components/          # React components (.tsx)
│   ├── CouponList.tsx
│   ├── AddCouponForm.tsx
│   └── ...
├── services/           # Business logic and services (.ts, .tsx)
│   ├── CouponService.ts
│   ├── CouponServiceFactory.ts
│   ├── AuthContext.tsx
│   └── ...
├── types/              # Type definitions (.ts)
│   └── index.ts
├── locales/            # i18n translation files
│   ├── en/
│   ├── fr/
│   └── ...
├── mocks/              # Mock data and services
│   ├── data/
│   └── services/
├── test/               # Test files
│   ├── components/
│   ├── services/
│   └── util/
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── i18n.ts             # i18n configuration
```

### File Naming Conventions

| File Type | Naming Convention | Example |
|-----------|-------------------|---------|
| React Components | PascalCase | `CouponList.tsx` |
| Services | PascalCase | `CouponService.ts` |
| Factories | PascalCase + Factory suffix | `CouponServiceFactory.ts` |
| Contexts | PascalCase + Context suffix | `AuthContext.tsx` |
| Hooks | use + PascalCase | `useCoupons.ts` |
| Types | PascalCase | `CouponTypes.ts` |
| Utilities | camelCase | `dateUtils.ts` |
| Constants | camelCase | `constants.ts` |
| Test Files | Same name + `.test.tsx` or `.test.ts` | `CouponList.test.tsx` |

### File Extension Usage

| Extension | Usage |
|-----------|-------|
| `.tsx` | React components with JSX |
| `.ts` | TypeScript files without JSX (services, utilities, types) |
| `.test.tsx` | Test files for React components |
| `.test.ts` | Test files for non-React code |
| `.d.ts` | Type declaration files (rarely needed) |

### Index File Usage

Use index files to simplify imports and provide clean public APIs.

**Example:**
```typescript
// types/index.ts
export interface Coupon { /* ... */ }
export interface CouponFormData { /* ... */ }
export type UserRole = 'user' | 'manager' | 'demo';

// Usage in other files
import { Coupon, CouponFormData, UserRole } from '../types';
// instead of
import { Coupon } from '../types/coupon';
import { CouponFormData } from '../types/coupon-form-data';
import { UserRole } from '../types/user-role';
```

---

## Naming Conventions

### Components (PascalCase)

```typescript
// ✅ Correct
const CouponList: React.FC<CouponListProps> = ({ coupons }) => { /* ... */ };
const AddCouponForm: React.FC<AddCouponFormProps> = ({ onSubmit }) => { /* ... */ };
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => { /* ... */ };

// ❌ Incorrect
const couponList = () => { /* ... */ };
const add_coupon_form = () => { /* ... */ };
```

### Services (PascalCase)

```typescript
// ✅ Correct
class CouponService implements ICouponService { /* ... */ }
class AuthService implements IAuthService { /* ... */ }
class RoleService implements IRoleService { /* ... */ }

// ❌ Incorrect
class couponService implements ICouponService { /* ... */ }
class auth_service implements IAuthService { /* ... */ }
```

### Factories (PascalCase + Factory suffix)

```typescript
// ✅ Correct
export const getCouponService = () => { /* ... */ };
export const getAuthService = () => { /* ... */ };
export const getRoleService = () => { /* ... */ };

// ❌ Incorrect
export const couponService = () => { /* ... */ };
export const getCoupon = () => { /* ... */ };
```

### Contexts (PascalCase + Context suffix)

```typescript
// ✅ Correct
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => { /* ... */ };
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => { /* ... */ };

// ❌ Incorrect
export const Auth = createContext<AuthContextType | undefined>(undefined);
export const authProvider = ({ children }) => { /* ... */ };
```

### Hooks (use + PascalCase)

```typescript
// ✅ Correct
export const useAuth = (): AuthContextType => { /* ... */ };
export const useLanguage = (): LanguageContextType => { /* ... */ };
export const useCoupons = () => { /* ... */ };

// ❌ Incorrect
export const auth = () => { /* ... */ };
export const getAuth = () => { /* ... */ };
export const use_auth = () => { /* ... */ };
```

### Interfaces (PascalCase, optionally with I prefix)

```typescript
// ✅ Without I prefix (preferred in this codebase)
export interface Coupon { /* ... */ }
export interface CouponFormData { /* ... */ }
export interface AuthContextType { /* ... */ }

// ✅ With I prefix (for service interfaces)
export interface ICouponService { /* ... */ }
export interface IAuthService { /* ... */ }
export interface IRoleService { /* ... */ }

// ❌ Incorrect
export interface coupon { /* ... */ }
export interface ICoupon_Service { /* ... */ }
```

### Types (PascalCase)

```typescript
// ✅ Correct
export type UserRole = 'user' | 'manager' | 'demo';
export type SortOrder = 'asc' | 'desc';
export type ThemeMode = 'light' | 'dark';

// ❌ Incorrect
export type userRole = 'user' | 'manager' | 'demo';
export type sort_order = 'asc' | 'desc';
```

### Variables and Functions (camelCase)

```typescript
// ✅ Correct
const couponList = [];
const isActive = true;
const handleSubmit = () => { /* ... */ };
const formatDate = (date: string) => { /* ... */ };

// ❌ Incorrect
const coupon_list = [];
const is_active = true;
const HandleSubmit = () => { /* ... */ };
const format_date = (date: string) => { /* ... */ };
```

### Constants (UPPER_SNAKE_CASE)

```typescript
// ✅ Correct
const MAX_COUPONS = 100;
const DEFAULT_LOCALE = 'en';
const API_BASE_URL = 'https://api.example.com';

// ❌ Incorrect
const maxCoupons = 100;
const default_locale = 'en';
const apiBaseUrl = 'https://api.example.com';
```

### Private Members (# prefix)

```typescript
// ✅ Correct
class CouponService implements ICouponService {
  #coupons: Coupon[];
  #initialized: boolean = false;

  async getAllCoupons(): Promise<Coupon[]> {
    return [...this.#coupons];
  }

  #transformData(data: any): Coupon {
    // Private method
    return { /* ... */ };
  }
}

// ❌ Incorrect
class CouponService implements ICouponService {
  private coupons: Coupon[];
  private _coupons: Coupon[];
  private $coupons: Coupon[];
}
```

### Event Handlers (handle + Verb)

```typescript
// ✅ Correct
const handleClick = () => { /* ... */ };
const handleSubmit = () => { /* ... */ };
const handleChange = () => { /* ... */ };
const handleInputChange = () => { /* ... */ };

// ❌ Incorrect
const click = () => { /* ... */ };
const submit = () => { /* ... */ };
const onClick = () => { /* ... */ };
```

### Boolean Variables (is/has/should prefix)

```typescript
// ✅ Correct
const isActive = true;
const hasExpired = false;
const shouldShow = true;
const isLoading = false;
const isAuthenticated = true;

// ❌ Incorrect
const active = true;
const expired = false;
const show = true;
```

---

## Component Standards

### Functional Components Only

Use functional components exclusively. Class components are not allowed.

```typescript
// ✅ Correct - Functional component
const CouponList: React.FC<CouponListProps> = ({ coupons, onUpdateCoupon }) => {
  const [filters, setFilters] = useState<FilterState>({ retailer: '' });

  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// ❌ Incorrect - Class component
class CouponList extends React.Component<CouponListProps> {
  constructor(props: CouponListProps) {
    super(props);
    this.state = { filters: { retailer: '' } };
  }

  render() {
    return <div>{/* JSX */}</div>;
  }
}
```

### Props Interface Definition

Always define props interfaces for components.

```typescript
// ✅ Correct
interface CouponListProps {
  coupons: Coupon[];
  onUpdateCoupon: (couponId: string, updatedData: Partial<Coupon>) => void;
  onMarkAsUsed: (couponId: string, newValue?: string) => void;
  retailerFilter?: string;
  setRetailerFilter?: (retailer: string) => void;
  defaultSort?: SortConfig;
}

const CouponList: React.FC<CouponListProps> = ({ 
  coupons, 
  onUpdateCoupon, 
  onMarkAsUsed 
}) => {
  // ...
};

// ❌ Incorrect - No props interface
const CouponList = ({ coupons, onUpdateCoupon }) => {
  // ...
};
```

### Component Structure Order

Follow this consistent structure for all components:

```typescript
// 1. Imports
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Table, TableBody, TableCell } from '@mui/material';
import { useLanguage } from '../services/LanguageContext';
import { Coupon } from '../types';

// 2. Types and interfaces
interface CouponListProps {
  coupons: Coupon[];
  onUpdateCoupon: (couponId: string, updatedData: Partial<Coupon>) => void;
}

interface FilterState {
  retailer: string;
  minAmount: string;
  maxAmount: string;
}

// 3. Constants
const DEFAULT_SORT: SortConfig = { field: 'retailer', order: 'asc' };

// 4. Component definition
const CouponList: React.FC<CouponListProps> = ({ 
  coupons, 
  onUpdateCoupon 
}) => {
  // 5. Hooks
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    retailer: '',
    minAmount: '',
    maxAmount: '',
  });
  
  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 7. Handler functions
  const handleClick = () => {
    // Handler logic
  };
  
  // 8. Helper functions
  const isExpired = (expirationDate?: string): boolean => {
    // Helper logic
    return false;
  };
  
  // 9. Derived values
  const filteredCoupons = coupons.filter(/* ... */);
  
  // 10. Rendering logic
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

// 11. Export
export default CouponList;
```

### Hook Usage Patterns

#### useState

```typescript
// ✅ Correct - Type annotations for state
const [coupons, setCoupons] = useState<Coupon[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ✅ Correct - Functional updates for state derived from previous state
const [count, setCount] = useState(0);
const increment = () => setCount(prev => prev + 1);

// ❌ Incorrect - No type annotations for complex state
const [coupons, setCoupons] = useState([]);

// ❌ Incorrect - Direct mutation of state
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Don't do this
setItems(items); // This won't work as expected
```

#### useEffect

```typescript
// ✅ Correct - Include all dependencies
useEffect(() => {
  const fetchData = async () => {
    const data = await service.getAllCoupons();
    setCoupons(data);
  };
  fetchData();
}, [service]); // Include service in dependencies

// ✅ Correct - Cleanup function
useEffect(() => {
  const subscription = service.subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, [service]);

// ❌ Incorrect - Missing dependencies
useEffect(() => {
  fetchData();
}, []); // Missing service dependency

// ❌ Incorrect - Empty dependency array with dependencies in effect
useEffect(() => {
  fetchData(service); // service is used but not in dependencies
}, []);
```

#### useMemo

```typescript
// ✅ Correct - Memoize expensive calculations
const sortedCoupons = useMemo(() => {
  return [...coupons].sort((a, b) => 
    a.retailer.localeCompare(b.retailer)
  );
}, [coupons]);

// ❌ Incorrect - Memoizing simple values
const isActive = useMemo(() => true, []); // Unnecessary
```

#### useCallback

```typescript
// ✅ Correct - Memoize callbacks passed to optimized child components
const handleClick = useCallback(() => {
  onAction(id);
}, [id, onAction]);

// ✅ Correct - Memoize event handlers
const handleSubmit = useCallback((event: FormEvent) => {
  event.preventDefault();
  onSubmit(formData);
}, [formData, onSubmit]);

// ❌ Incorrect - Not memoizing callbacks passed to child components
const handleClick = () => {
  onAction(id);
};
// When passed to a child component that uses React.memo, this will cause re-renders
```

### State Management Patterns

#### Local State

Use local state for component-specific data.

```typescript
const CouponForm: React.FC<CouponFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CouponFormData>({
    retailer: '',
    initialValue: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return <form>{/* ... */}</form>;
};
```

#### Lifted State

Lift state up when multiple components need access.

```typescript
// Parent component
const App = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const handleAddCoupon = (coupon: Coupon) => {
    setCoupons(prev => [...prev, coupon]);
  };

  return (
    <>
      <CouponList coupons={coupons} />
      <AddCouponForm onSubmit={handleAddCoupon} />
    </>
  );
};
```

#### Context State

Use context for global state that needs to be accessed by many components.

```typescript
// Context definition
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email: string, password: string) => {
    // Sign in logic
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Usage in components
const LoginForm = () => {
  const { signIn, loading } = useAuth();
  // ...
};
```

### Event Handling Patterns

```typescript
// ✅ Correct - Event handlers with proper typing
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
  onAction(id);
};

const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
  const { name, value } = event.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
  event.preventDefault();
  try {
    await onSubmit(formData);
  } catch (error) {
    setError(error.message);
  }
};

// ✅ Correct - Inline event handlers for simple cases
<button onClick={() => onAction(id)}>Action</button>

// ❌ Incorrect - Not preventing default form submission
const handleSubmit = async () => {
  await onSubmit(formData);
};
```

### Conditional Rendering Patterns

```typescript
// ✅ Correct - Ternary operator for simple conditions
{isLoading ? <Spinner /> : <Content />}

// ✅ Correct - Logical AND for optional rendering
{showError && <ErrorMessage message={error} />}

// ✅ Correct - Extract complex conditions to variables
const shouldShowCoupon = coupon && !isExpired(coupon.expirationDate);
{shouldShowCoupon && <CouponCard coupon={coupon} />}

// ✅ Correct - Early returns for complex conditions
const CouponList = ({ coupons }: CouponListProps) => {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (coupons.length === 0) return <EmptyState />;

  return (
    <div>
      {coupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)}
    </div>
  );
};

// ❌ Incorrect - Nested ternary operators
{isLoading 
  ? <Spinner /> 
  : error 
    ? <ErrorMessage message={error} />
    : coupons.length === 0
      ? <EmptyState />
      : <Content />}
```

---

## Service Layer Standards

### Service Interface Definition

All services must implement a well-defined interface.

```typescript
// ✅ Correct - Service interface
export interface ICouponService {
  getAllCoupons(): Promise<Coupon[]>;
  addCoupon(coupon: CouponFormData, userId?: string | null): Promise<Coupon>;
  updateCoupon(updatedCoupon: Partial<Coupon>): Promise<boolean>;
  markCouponAsUsed(couponId: string): Promise<boolean>;
  partiallyUseCoupon(couponId: string, amount: number): Promise<boolean>;
  getUniqueRetailers(): Promise<string[]>;
  getRetailerStats(): Promise<RetailerStat[]>;
}

// ❌ Incorrect - No interface
class CouponService {
  // ...
}
```

### Factory Pattern Implementation

Use factories to provide the appropriate service implementation based on environment.

```typescript
// ✅ Correct - Factory pattern
export interface ICouponService {
  getAllCoupons(): Promise<Coupon[]>;
  addCoupon(coupon: CouponFormData, userId?: string | null): Promise<Coupon>;
  // ...
}

export enum StorageType {
  IN_MEMORY = 'in-memory',
  SUPABASE = 'supabase'
}

const shouldUseMemoryDb = (): boolean => {
  return import.meta.env.VITE_USE_MEMORY_DB === 'true';
};

const getDefaultStorageType = (): StorageType => {
  return shouldUseMemoryDb() ? StorageType.IN_MEMORY : StorageType.SUPABASE;
};

export const getCouponService = (
  storageType: StorageType = getDefaultStorageType()
): ICouponService => {
  switch (storageType) {
    case StorageType.IN_MEMORY:
      return CouponService as unknown as ICouponService;
    case StorageType.SUPABASE:
      return SupabaseCouponService as unknown as ICouponService;
    default:
      return SupabaseCouponService as unknown as ICouponService;
  }
};

export default getCouponService();
```

### Singleton Pattern Usage

Services are exported as singletons to ensure consistent state.

```typescript
// ✅ Correct - Singleton pattern
class CouponService implements ICouponService {
  #coupons: Coupon[] = [];

  async getAllCoupons(): Promise<Coupon[]> {
    return Promise.resolve([...this.#coupons]);
  }

  async addCoupon(coupon: CouponFormData, userId: string | null = null): Promise<Coupon> {
    const newCoupon: Coupon = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      retailer: coupon.retailer,
      initialValue: coupon.initialValue,
      currentValue: coupon.currentValue || coupon.initialValue,
      expirationDate: coupon.expirationDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.#coupons.push(newCoupon);
    return Promise.resolve(newCoupon);
  }
}

export default new CouponService();
```

### Error Handling Patterns

Services should handle errors gracefully and provide meaningful error messages.

```typescript
// ✅ Correct - Error handling in services
class CouponService implements ICouponService {
  async updateCoupon(updatedCoupon: Partial<Coupon>): Promise<boolean> {
    try {
      const index = this.#coupons.findIndex(coupon => coupon.id === updatedCoupon.id);
      
      if (index < 0) {
        throw new Error(`Coupon with id ${updatedCoupon.id} not found`);
      }
      
      this.#coupons[index] = {
        ...this.#coupons[index],
        ...updatedCoupon,
        updated_at: new Date().toISOString()
      };
      
      return true;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw new Error(`Failed to update coupon: ${error.message}`);
    }
  }
}

// ✅ Correct - Error handling in components
const CouponList = ({ coupons, onUpdateCoupon }: CouponListProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (couponId: string, data: Partial<Coupon>) => {
    try {
      setError(null);
      await onUpdateCoupon(couponId, data);
    } catch (err) {
      setError(err.message || 'Failed to update coupon');
    }
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {/* ... */}
    </>
  );
};
```

### Data Transformation Patterns

Transform data between different formats (e.g., snake_case to camelCase).

```typescript
// ✅ Correct - Data transformation
class SupabaseCouponService implements ICouponService {
  #mapToCamelCase(dbCoupon: DBCoupon): Coupon {
    return {
      id: dbCoupon.id || '',
      userId: dbCoupon.user_id || '',
      retailer: dbCoupon.retailer,
      initialValue: dbCoupon.initial_value,
      currentValue: dbCoupon.current_value,
      expirationDate: dbCoupon.expiration_date || undefined,
      activationCode: dbCoupon.activation_code,
      pin: dbCoupon.pin,
      created_at: dbCoupon.created_at,
      updated_at: dbCoupon.updated_at,
      barcode: dbCoupon.barcode,
      reference: dbCoupon.reference,
      notes: dbCoupon.notes
    };
  }

  #mapToSnakeCase(appCoupon: Partial<Coupon>): DBCoupon {
    const result: DBCoupon = {
      retailer: appCoupon.retailer || '',
      initial_value: appCoupon.initialValue || '',
      current_value: appCoupon.currentValue || appCoupon.initialValue || '',
      expiration_date: appCoupon.expirationDate || null,
      activation_code: appCoupon.activationCode,
      pin: appCoupon.pin,
      barcode: appCoupon.barcode,
      reference: appCoupon.reference,
      notes: appCoupon.notes,
      updated_at: new Date().toISOString()
    };
    return result;
  }
}
```

### Async/Await Usage

Always use async/await for asynchronous operations.

```typescript
// ✅ Correct - Async/await
class CouponService implements ICouponService {
  async getAllCoupons(): Promise<Coupon[]> {
    return Promise.resolve([...this.#coupons]);
  }

  async addCoupon(coupon: CouponFormData, userId: string | null = null): Promise<Coupon> {
    const newCoupon: Coupon = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      retailer: coupon.retailer,
      initialValue: coupon.initialValue,
      currentValue: coupon.currentValue || coupon.initialValue,
      expirationDate: coupon.expirationDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.#coupons.push(newCoupon);
    return Promise.resolve(newCoupon);
  }
}

// ❌ Incorrect - Mixing promises and async/await
getAllCoupons(): Promise<Coupon[]> {
  return new Promise((resolve) => {
    resolve([...this.#coupons]);
  });
}
```

---

## Context Standards

### Context Interface Definition

Define clear interfaces for context values.

```typescript
// ✅ Correct - Context interface
interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: string, resource?: Record<string, any>) => Promise<boolean>;
}

// ❌ Incorrect - No interface
const AuthContext = createContext(undefined);
```

### Provider Component Structure

Follow a consistent structure for provider components.

```typescript
// ✅ Correct - Provider structure
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 1. State
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Effects
  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // ... initialization logic
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // 3. Handlers
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      // ... sign in logic
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 4. Context value
  const contextValue: AuthContextType = {
    user,
    userRole,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInAnonymously,
    hasPermission
  };

  // 5. Render
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Custom Hook Creation

Create custom hooks for consuming context.

```typescript
// ✅ Correct - Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Usage in components
const LoginForm = () => {
  const { signIn, loading, error } = useAuth();
  // ...
};
```

### State Management Patterns

#### Loading State

```typescript
// ✅ Correct - Loading state management
const [loading, setLoading] = useState<boolean>(true);

const signIn = async (email: string, password: string) => {
  try {
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await authService.signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
      return { success: false, error: signInError.message };
    }
    
    return { success: true };
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
};
```

#### Error State

```typescript
// ✅ Correct - Error state management
const [error, setError] = useState<string | null>(null);

const signIn = async (email: string, password: string) => {
  try {
    setError(null);
    const { data, error: signInError } = await authService.signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
      return { success: false, error: signInError.message };
    }
    
    return { success: true };
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  }
};
```

---

## Testing Standards

> 🚨 **Note:** This project uses Cypress as the exclusive testing framework. For comprehensive testing documentation, see the [Cypress Testing Guide](./cypress-testing-guide.md).

### Test File Naming and Organization

| File Type | Test File Name | Location |
|-----------|----------------|----------|
| Component Test | `ComponentName.cy.tsx` | `cypress/component/` |
| E2E Test | `feature-name.cy.ts` | `cypress/e2e/` |
| Page Object | `PageName.ts` | `cypress/pages/` |

**Examples:**
```
cypress/
├── component/
│   ├── CouponList.cy.tsx
│   ├── AddCouponForm.cy.tsx
│   └── ...
├── e2e/
│   ├── auth.cy.ts
│   ├── coupon-management.cy.ts
│   └── ...
└── pages/
    ├── LoginPage.ts
    ├── DashboardPage.ts
    └── ...
```

### Test Structure (AAA Pattern)

Follow the Arrange-Act-Assert (AAA) pattern for test organization.

```typescript
// ✅ Correct - AAA pattern with Cypress
describe('CouponList Component', () => {
  it('filters coupons by retailer', () => {
    // Arrange
    const mockCoupons = [
      { id: '1', retailer: 'Amazon', currentValue: '50' },
      { id: '2', retailer: 'Target', currentValue: '75' }
    ];

    mount(
      <ThemeProvider>
        <CouponList coupons={mockCoupons} />
      </ThemeProvider>
    );

    // Act
    cy.get('[data-testid="retailer-filter"]').type('Amazon');

    // Assert
    cy.contains(/Amazon/i).should('be.visible');
    cy.contains(/Target/i).should('not.exist');
  });
});
```

### Component Testing Patterns

```typescript
// ✅ Correct - Cypress component testing
describe('CouponList Component', () => {
  const mockCoupons = [
    {
      id: '1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: '2025-12-31',
      activationCode: 'AMZN2024',
      pin: '1234'
    }
  ];

  it('renders without crashing', () => {
    mount(
      <ThemeProvider>
        <CouponList coupons={mockCoupons} />
      </ThemeProvider>
    );

    cy.contains(/Amazon/i).should('be.visible');
  });

  it('calls onMarkAsUsed when button is clicked', () => {
    const onMarkAsUsed = cy.stub().as('onMarkAsUsed');

    mount(
      <ThemeProvider>
        <CouponList coupons={mockCoupons} onMarkAsUsed={onMarkAsUsed} />
      </ThemeProvider>
    );

    cy.get('[data-testid="mark-as-used-button"]').click();
    cy.get('@onMarkAsUsed').should('have.been.called');
  });
});
```

### E2E Testing Patterns

```typescript
// ✅ Correct - Cypress E2E testing with Page Object Model
describe('Coupon Management Flow', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    cy.login('user@example.com', 'password123');
  });

  it('should add a new coupon', () => {
    cy.visit('/dashboard');

    dashboardPage.clickAddCoupon();
    cy.get('[data-testid="retailer-input"]').type('Amazon');
    cy.get('[data-testid="value-input"]').type('50');
    cy.get('[data-testid="submit-button"]').click();

    cy.contains('Coupon added successfully').should('be.visible');
    cy.contains('Amazon').should('be.visible');
  });
});
```

### Coverage Requirements

The project requires minimum 80% coverage across all metrics:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

> 🚨 **Note:** Cypress does not provide built-in code coverage. Coverage is assessed through:
> - Component tests covering component logic
> - E2E tests covering critical user flows
> - Manual review of test coverage for new features

For detailed testing information, see [Cypress Testing Guide](./cypress-testing-guide.md).

---

## Code Organization

### Import Order

Follow this import order:

1. React and third-party libraries
2. Internal imports (from `src/`)
3. Type imports
4. Relative imports
5. Styles (if applicable)

```typescript
// ✅ Correct - Import order
// 1. React and third-party libraries
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Table, TableBody, TableCell } from '@mui/material';
import { format } from 'date-fns';

// 2. Internal imports
import { useLanguage } from '../services/LanguageContext';
import { getCouponService } from '../services/CouponServiceFactory';

// 3. Type imports
import type { Coupon, CouponFormData, SortConfig } from '../types';

// 4. Relative imports
import { formatDate } from '../utils/dateUtils';

// ❌ Incorrect - Random import order
import { format } from 'date-fns';
import React, { useState } from 'react';
import type { Coupon } from '../types';
import { Table } from '@mui/material';
```

### Export Patterns

```typescript
// ✅ Correct - Named exports for utilities and types
export const formatDate = (date: string): string => { /* ... */ };
export const parseDate = (date: string): Date => { /* ... */ };
export type UserRole = 'user' | 'manager' | 'demo';

// ✅ Correct - Default export for main component/service
const CouponList: React.FC<CouponListProps> = ({ coupons }) => { /* ... */ };
export default CouponList;

// ✅ Correct - Named export for components that need tree-shaking
export const CouponList: React.FC<CouponListProps> = ({ coupons }) => { /* ... */ };

// ❌ Incorrect - Mixing default and named exports confusingly
export default function CouponList() { /* ... */ }
export { CouponList };
```

### Code Grouping

Group related code together using blank lines and comments.

```typescript
// ✅ Correct - Code grouping
const CouponList: React.FC<CouponListProps> = ({ coupons, onUpdateCoupon }) => {
  // State
  const [filters, setFilters] = useState<FilterState>({ retailer: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleClick = () => { /* ... */ };
  const handleSubmit = () => { /* ... */ };

  // Helpers
  const isExpired = (date?: string): boolean => { /* ... */ };
  const formatDate = (date: string): string => { /* ... */ };

  // Derived values
  const filteredCoupons = coupons.filter(/* ... */);

  // Render
  return <div>{/* ... */}</div>;
};
```

### Comment Usage

Use comments sparingly and only when necessary. Code should be self-documenting.

```typescript
// ✅ Correct - Minimal comments for complex logic
const isExpired = (expirationDate?: string): boolean => {
  if (!expirationDate) return false;
  
  const expDate = new Date(expirationDate);
  const today = new Date();
  
  return expDate < today;
};

// ✅ Correct - JSDoc for public APIs
/**
 * Formats a date according to the specified locale
 * @param date - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns The formatted date string
 */
export const formatDate = (date: string, locale: string = 'en-US'): string => {
  return new Date(date).toLocaleDateString(locale);
};

// ❌ Incorrect - Obvious comments
// Get the user
const user = getUser();
// Return the user
return user;
```

---

## React Best Practices

### Prop Drilling vs Context Usage

Use context when:
- Data is needed by many components at different nesting levels
- Data is global (user auth, theme, language)

Use prop drilling when:
- Data is only needed by a few nearby components
- Data is specific to a feature

```typescript
// ✅ Correct - Use context for global state
const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainContent />
      </LanguageProvider>
    </AuthProvider>
  );
};

const MainContent = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  // Both are available without prop drilling
};

// ✅ Correct - Use prop drilling for feature-specific data
const CouponList = ({ coupons, onUpdateCoupon }: CouponListProps) => {
  return (
    <div>
      {coupons.map(coupon => (
        <CouponCard 
          key={coupon.id} 
          coupon={coupon} 
          onUpdate={onUpdateCoupon}
        />
      ))}
    </div>
  );
};
```

### Component Composition

Compose components to build complex UIs.

```typescript
// ✅ Correct - Component composition
const CouponCard = ({ coupon, onEdit, onDelete }: CouponCardProps) => (
  <Card>
    <CardHeader title={coupon.retailer} />
    <CardContent>
      <CouponValue value={coupon.currentValue} />
      <CouponExpiration date={coupon.expirationDate} />
    </CardContent>
    <CardActions>
      <EditButton onClick={() => onEdit(coupon)} />
      <DeleteButton onClick={() => onDelete(coupon.id)} />
    </CardActions>
  </Card>
);

const CouponValue = ({ value }: { value: string }) => (
  <Typography variant="h6">${value}</Typography>
);

const CouponExpiration = ({ date }: { date?: string }) => (
  <Typography variant="body2">{formatDate(date)}</Typography>
);
```

### Custom Hooks Creation

Extract reusable stateful logic into custom hooks.

```typescript
// ✅ Correct - Custom hook for coupon management
export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = getCouponService();

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getAllCoupons();
      setCoupons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCoupon = async (couponData: CouponFormData) => {
    try {
      setLoading(true);
      setError(null);
      const newCoupon = await service.addCoupon(couponData);
      setCoupons(prev => [...prev, newCoupon]);
      return newCoupon;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  return { coupons, loading, error, addCoupon, loadCoupons };
};

// Usage
const CouponManager = () => {
  const { coupons, loading, error, addCoupon } = useCoupons();
  // ...
};
```

### Performance Considerations

#### useMemo

Use `useMemo` for expensive calculations.

```typescript
// ✅ Correct - Memoize expensive calculations
const sortedCoupons = useMemo(() => {
  return [...coupons].sort((a, b) => 
    a.retailer.localeCompare(b.retailer)
  );
}, [coupons]);

const filteredCoupons = useMemo(() => {
  return coupons.filter(coupon => 
    !filters.retailer || coupon.retailer.toLowerCase().includes(filters.retailer.toLowerCase())
  );
}, [coupons, filters]);
```

#### useCallback

Use `useCallback` for callbacks passed to optimized child components.

```typescript
// ✅ Correct - Memoize callbacks
const handleClick = useCallback(() => {
  onAction(id);
}, [id, onAction]);

const handleSubmit = useCallback((event: FormEvent) => {
  event.preventDefault();
  onSubmit(formData);
}, [formData, onSubmit]);
```

#### React.memo

Use `React.memo` for components that render often with the same props.

```typescript
// ✅ Correct - Memoize expensive components
const CouponCard = React.memo(({ coupon, onUpdate }: CouponCardProps) => {
  return (
    <Card>
      <CardHeader title={coupon.retailer} />
      <CardContent>{coupon.currentValue}</CardContent>
    </Card>
  );
});

// With custom comparison function
const CouponCard = React.memo(
  ({ coupon, onUpdate }: CouponCardProps) => {
    return <Card>{/* ... */}</Card>;
  },
  (prevProps, nextProps) => {
    return prevProps.coupon.id === nextProps.coupon.id;
  }
);
```

### Error Boundaries

Use error boundaries to catch errors in component trees.

```typescript
// ✅ Correct - Error boundary component
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert severity="error">
          Something went wrong. Please refresh the page.
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Usage
const App = () => {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
};
```

---

## TypeScript Best Practices

### Type Narrowing

Use type narrowing to work with union types.

```typescript
// ✅ Correct - Type narrowing
type Coupon = {
  id: string;
  retailer: string;
  type: 'gift_card' | 'voucher';
  amount?: string; // Only for gift cards
  code?: string; // Only for vouchers
};

const displayCoupon = (coupon: Coupon) => {
  if (coupon.type === 'gift_card') {
    // TypeScript knows coupon.amount is defined here
    console.log(`Gift card: $${coupon.amount}`);
  } else {
    // TypeScript knows coupon.code is defined here
    console.log(`Voucher: ${coupon.code}`);
  }
};
```

### Type Guards

Create type guards to check types at runtime.

```typescript
// ✅ Correct - Type guard
function isCoupon(obj: any): obj is Coupon {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.retailer === 'string' &&
    typeof obj.initialValue === 'string' &&
    typeof obj.currentValue === 'string'
  );
}

const processData = (data: unknown) => {
  if (isCoupon(data)) {
    // TypeScript knows data is Coupon here
    console.log(data.retailer);
  }
};
```

### Discriminated Unions

Use discriminated unions for type-safe conditional logic.

```typescript
// ✅ Correct - Discriminated union
type CouponAction =
  | { type: 'ADD'; coupon: CouponFormData }
  | { type: 'UPDATE'; id: string; data: Partial<Coupon> }
  | { type: 'DELETE'; id: string };

const couponReducer = (state: Coupon[], action: CouponAction): Coupon[] => {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: uuidv4(), ...action.coupon }];
    case 'UPDATE':
      return state.map(c => c.id === action.id ? { ...c, ...action.data } : c);
    case 'DELETE':
      return state.filter(c => c.id !== action.id);
    default:
      return state;
  }
};
```

### Utility Types Usage

Leverage TypeScript's utility types.

```typescript
// ✅ Correct - Utility types
// Partial - Make all properties optional
type CouponUpdate = Partial<Coupon>;

// Required - Make all properties required
type RequiredCoupon = Required<Coupon>;

// Pick - Select specific properties
type CouponSummary = Pick<Coupon, 'id' | 'retailer' | 'currentValue'>;

// Omit - Remove specific properties
type NewCoupon = Omit<Coupon, 'id' | 'created_at' | 'updated_at'>;

// Record - Create object type with specific keys
type RetailerMap = Record<string, Coupon[]>;

// Readonly - Make all properties readonly
type ReadonlyCoupon = Readonly<Coupon>;
```

### Type Assertions (Avoid When Possible)

Avoid type assertions; use type guards instead.

```typescript
// ❌ Incorrect - Type assertion
const coupon = data as Coupon;
console.log(coupon.retailer); // Could fail at runtime

// ✅ Correct - Type guard
if (isCoupon(data)) {
  console.log(data.retailer); // Safe
}

// ✅ Correct - Type assertion when you know it's safe (rare)
const element = document.getElementById('root') as HTMLElement;
element.innerHTML = ''; // Safe because we know root exists
```

---

## Security Best Practices

### Input Validation

Always validate user input.

```typescript
// ✅ Correct - Input validation
const validateCouponData = (data: CouponFormData): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.retailer || data.retailer.trim().length === 0) {
    errors.retailer = 'Retailer is required';
  }

  if (!data.initialValue || parseFloat(data.initialValue) <= 0) {
    errors.initialValue = 'Initial value must be greater than 0';
  }

  if (data.expirationDate) {
    const expDate = new Date(data.expirationDate);
    if (expDate < new Date()) {
      errors.expirationDate = 'Expiration date must be in the future';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

const CouponForm = ({ onSubmit }: CouponFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (data: CouponFormData) => {
    const validation = validateCouponData(data);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(data);
  };
};
```

### Output Encoding

Encode output to prevent XSS attacks.

```typescript
// ✅ Correct - React automatically encodes output
const CouponCard = ({ coupon }: CouponCardProps) => {
  return (
    <Card>
      <CardHeader title={coupon.retailer} />
      {/* React automatically encodes coupon.retailer */}
    </Card>
  );
};

// ❌ Incorrect - Using dangerouslySetInnerHTML
const CouponCard = ({ coupon }: CouponCardProps) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: coupon.retailer }} />
    // This could allow XSS attacks
  );
};
```

### Permission Checking

Check permissions before allowing actions.

```typescript
// ✅ Correct - Permission checking
const CouponList = ({ coupons, onUpdateCoupon }: CouponListProps) => {
  const { user, userRole, hasPermission } = useAuth();

  const handleUpdate = async (couponId: string, data: Partial<Coupon>) => {
    const canUpdate = await hasPermission('coupon:update', { couponId });
    if (!canUpdate) {
      setError('You do not have permission to update this coupon');
      return;
    }

    await onUpdateCoupon(couponId, data);
  };

  return (
    <div>
      {coupons.map(coupon => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          canEdit={userRole === 'manager' || coupon.userId === user?.id}
          onEdit={handleUpdate}
        />
      ))}
    </div>
  );
};
```

### Environment Variable Usage

Use environment variables for configuration.

```typescript
// ✅ Correct - Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
const USE_MEMORY_DB = import.meta.env.VITE_USE_MEMORY_DB === 'true';

// ❌ Incorrect - Hardcoded values
const API_BASE_URL = 'https://api.example.com';
const USE_MEMORY_DB = false;
```

### Secret Management

Never store secrets in client-side code.

```typescript
// ❌ Incorrect - Secrets in client code
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'secret123';

// ✅ Correct - Use environment variables (server-side only)
const API_KEY = process.env.API_KEY; // Only available on server
const DB_PASSWORD = process.env.DB_PASSWORD; // Only available on server

// For client-side, use Supabase's built-in auth
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Anon key is safe to expose on client
```

---

## Performance Best Practices

### Code Splitting

Use code splitting to reduce bundle size.

```typescript
// ✅ Correct - Code splitting with React.lazy
const CouponList = React.lazy(() => import('./components/CouponList'));
const AddCouponForm = React.lazy(() => import('./components/AddCouponForm'));

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<CouponList />} />
        <Route path="/add" element={<AddCouponForm />} />
      </Routes>
    </Suspense>
  );
};
```

### Lazy Loading

Lazy load components that are not immediately needed.

```typescript
// ✅ Correct - Lazy loading
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const UserManagement = React.lazy(() => import('./components/UserManagement'));

const App = () => {
  const { userRole } = useAuth();

  return (
    <div>
      <CouponList />
      {userRole === 'manager' && (
        <Suspense fallback={<Spinner />}>
          <AdminPanel />
          <UserManagement />
        </Suspense>
      )}
    </div>
  );
};
```

### Memoization

Memoize expensive computations and callbacks.

```typescript
// ✅ Correct - Memoization
const CouponList = ({ coupons, onUpdateCoupon }: CouponListProps) => {
  const [filters, setFilters] = useState<FilterState>({ retailer: '' });

  // Memoize expensive filtering
  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon =>
      !filters.retailer || coupon.retailer.toLowerCase().includes(filters.retailer.toLowerCase())
    );
  }, [coupons, filters]);

  // Memoize expensive sorting
  const sortedCoupons = useMemo(() => {
    return [...filteredCoupons].sort((a, b) =>
      a.retailer.localeCompare(b.retailer)
    );
  }, [filteredCoupons]);

  // Memoize callbacks
  const handleUpdate = useCallback((couponId: string, data: Partial<Coupon>) => {
    onUpdateCoupon(couponId, data);
  }, [onUpdateCoupon]);

  return <div>{/* ... */}</div>;
};
```

### Bundle Size Considerations

Be mindful of bundle size when adding dependencies.

```typescript
// ✅ Correct - Import only what you need
import { Table, TableBody, TableCell } from '@mui/material';

// ❌ Incorrect - Import entire library
import * as MUI from '@mui/material';

// ✅ Correct - Use tree-shakeable imports
import { format } from 'date-fns';

// ❌ Incorrect - Import entire library
import * as dateFns from 'date-fns';
```

---

## Code Review Guidelines

### What to Look for in Code Reviews

1. **Type Safety**
   - Are all types properly defined?
   - Are there any implicit `any` types?
   - Are interfaces used appropriately?

2. **Code Quality**
   - Is the code readable and maintainable?
   - Are there any code duplications?
   - Are functions small and focused?

3. **Best Practices**
   - Are React best practices followed?
   - Are TypeScript best practices followed?
   - Are security best practices followed?

4. **Testing**
   - Are there tests for new functionality?
   - Do tests cover edge cases?
   - Is test coverage adequate?

5. **Performance**
   - Are there any performance concerns?
   - Is memoization used appropriately?
   - Are there unnecessary re-renders?

### Common Anti-Patterns to Avoid

```typescript
// ❌ Anti-pattern: Direct state mutation
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Don't do this
setItems(items);

// ✅ Correct: Create new array
const [items, setItems] = useState([1, 2, 3]);
setItems([...items, 4]);

// ❌ Anti-pattern: Not cleaning up effects
useEffect(() => {
  const subscription = service.subscribe();
}, []);

// ✅ Correct: Clean up effects
useEffect(() => {
  const subscription = service.subscribe();
  return () => subscription.unsubscribe();
}, []);

// ❌ Anti-pattern: Using index as key
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ Correct: Use unique id as key
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

// ❌ Anti-pattern: Not handling errors
const loadData = async () => {
  const data = await service.getData();
  setData(data);
};

// ✅ Correct: Handle errors
const loadData = async () => {
  try {
    const data = await service.getData();
    setData(data);
  } catch (error) {
    setError(error.message);
  }
};
```

### Approval Criteria

A pull request should be approved when:

1. All tests pass
2. Code coverage is maintained or improved
3. No linting errors
4. Code follows the standards in this document
5. At least one reviewer has approved
6. All review comments have been addressed

---

## Linting and Formatting

### ESLint Rules

The project uses ESLint for code linting. Run linting before committing:

```bash
pnpm lint
```

Fix auto-fixable issues:

```bash
pnpm lint:fix
```

### Prettier Configuration

The project uses Prettier for code formatting. Format your code before committing:

```bash
pnpm format
```

### Pre-commit Hooks

Pre-commit hooks should be configured to:
- Run ESLint
- Run Prettier
- Run tests
- Check code coverage

### Configuration Files

- ESLint: `.eslintrc.js` (if exists)
- Prettier: `.prettierrc` (if exists)
- TypeScript: [`tsconfig.json`](tsconfig.json:1)
- Vitest: [`vitest.config.ts`](vitest.config.ts:1)

---

## References

- For architecture details, see [`ARCHITECTURE.md`](ARCHITECTURE.md:1)
- For testing standards, see [`docs/testing-standards.md`](docs/testing-standards.md:1)
- For TypeScript configuration, see [`tsconfig.json`](tsconfig.json:1)
- For testing configuration, see [`vitest.config.ts`](vitest.config.ts:1)

---

## Document Maintenance

This document should be updated when:
- New coding patterns are introduced
- Existing patterns are deprecated
- Technology stack changes
- Best practices evolve

All changes should be reviewed by the team before being merged.

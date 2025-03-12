# TypeScript Migration Guide

**Last Updated:** June 15, 2023  
**Status:** Draft

This document outlines the strategy and approach for migrating the CouponManager application from JavaScript (JSX) to TypeScript (TSX). It provides guidelines, best practices, and steps to ensure a smooth transition.

## Goals

- Improve code quality and maintainability
- Catch type-related bugs at compile time
- Enhance IDE support and developer experience
- Provide better documentation through type definitions
- Enable safer refactoring and code changes

## Migration Strategy

### 1. Preparation Phase

#### Setup TypeScript Configuration

1. Install TypeScript and related dependencies:
   ```bash
   pnpm add -D typescript @types/react @types/react-dom @types/node
   ```

2. Create a basic `tsconfig.json` file:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "skipLibCheck": true,
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true,
       
       /* Bundler mode */
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       
       /* Linting */
       "strict": false, /* Start with less strict settings */
       "noUnusedLocals": false,
       "noUnusedParameters": false,
       "noFallthroughCasesInSwitch": true
     },
     "include": ["src"],
     "references": [{ "path": "./tsconfig.node.json" }]
   }
   ```

3. Create `tsconfig.node.json` for Vite:
   ```json
   {
     "compilerOptions": {
       "composite": true,
       "skipLibCheck": true,
       "module": "ESNext",
       "moduleResolution": "bundler",
       "allowSyntheticDefaultImports": true
     },
     "include": ["vite.config.ts"]
   }
   ```

4. Update Vite configuration to support TypeScript:
   - Rename `vite.config.js` to `vite.config.ts`
   - Add TypeScript plugin if needed

#### Create Type Definitions

1. Create a `src/types` directory for shared type definitions
2. Define core model interfaces (starting with models from `data-models.md`)
3. Create type definition files for each major feature area:
   - `src/types/coupons.ts`
   - `src/types/users.ts`
   - `src/types/auth.ts`
   - `src/types/i18n.ts`

### 2. Component Migration

#### Migration Order

We'll migrate components in this order:

1. Utility functions and helpers
2. Service layer (non-UI code)
3. Smaller, leaf components with fewer dependencies
4. Larger, container components
5. Context providers
6. The main App component

#### Process for Each File

For each file to migrate:

1. Rename the file extension:
   - `.js` → `.ts`
   - `.jsx` → `.tsx`

2. Add type annotations gradually:
   - Start with `any` types where necessary
   - Refine types as understanding improves
   - Use TypeScript's inference where possible

3. Add interface definitions for:
   - Component props
   - State objects
   - Function parameters and return types

4. Resolve any TypeScript errors

### 3. Incremental Strictness

After the initial migration:

1. Enable stricter TypeScript settings incrementally:
   - Start with `"noImplicitAny": true`
   - Move to `"strict": true` in phases
   - Add more strict flags as code quality improves

2. Refactor code to eliminate type assertions and `any` types

### 4. Testing Strategy

1. Maintain test coverage during migration:
   - Update test files to TypeScript
   - Add type definitions for test utilities
   - Ensure tests pass after each component migration

2. Add tests specifically for type-related edge cases

## Detailed Implementation Guide

### Sample Component Migration

**Before (AddCouponForm.jsx):**
```jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../services/LanguageContext';
import CouponService from '../services/CouponService';

const AddCouponForm = ({ onSubmit, initialValues, isEditing }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    retailer: '',
    value: '',
    expiryDate: '',
    description: '',
    activationCode: '',
    isUsed: false,
  });
  
  // Component implementation...
  
  return (
    // JSX markup...
  );
};

export default AddCouponForm;
```

**After (AddCouponForm.tsx):**
```tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useLanguage } from '../services/LanguageContext';
import CouponService from '../services/CouponService';
import { CouponFormData } from '../types/coupons';

interface AddCouponFormProps {
  onSubmit: (formData: CouponFormData) => void;
  initialValues?: Partial<CouponFormData>;
  isEditing?: boolean;
}

const AddCouponForm: React.FC<AddCouponFormProps> = ({ 
  onSubmit, 
  initialValues = {}, 
  isEditing = false 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CouponFormData>({
    retailer: '',
    value: '',
    expiryDate: '',
    description: '',
    activationCode: '',
    isUsed: false,
    ...initialValues
  });
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Component implementation with type annotations...
  
  return (
    // JSX markup...
  );
};

export default AddCouponForm;
```

### Common Patterns and Solutions

#### Type Guards

Use type guards to handle different types:

```typescript
function isUserRole(role: unknown): role is UserRole {
  return (
    typeof role === 'object' && 
    role !== null && 
    'user_id' in role && 
    'role' in role
  );
}
```

#### React Hooks with TypeScript

Properly type your React hooks:

```typescript
const [coupons, setCoupons] = useState<Coupon[]>([]);
const couponRef = useRef<HTMLDivElement>(null);

// For context
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

#### Generic Components

Create reusable generic components:

```typescript
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
}

function Select<T>({ 
  options, 
  value, 
  onChange, 
  getLabel, 
  getValue 
}: SelectProps<T>) {
  // Implementation
}
```

## Potential Challenges

1. **Third-Party Libraries**
   - Some libraries may not have TypeScript definitions
   - Solution: Create custom type definitions or use `@types` packages

2. **Complex State Management**
   - Typing complex state transitions can be challenging
   - Solution: Break down state into smaller, typed pieces

3. **Type Assertions**
   - Avoid excessive use of type assertions (`as` keyword)
   - Solution: Use proper type guards and validation

4. **Integration with Supabase**
   - Ensure Supabase responses are properly typed
   - Solution: Use Supabase's TypeScript client

5. **Learning Curve**
   - Team members may need time to adapt to TypeScript
   - Solution: Provide training sessions and pair programming

## Timeline and Milestones

1. **Week 1-2: Setup and Preparation**
   - Set up TypeScript configuration
   - Create type definitions for core models
   - Convert utility functions

2. **Week 3-4: Service Layer Migration**
   - Convert service files to TypeScript
   - Add proper typing to API interactions
   - Update tests for services

3. **Week 5-8: Component Migration**
   - Convert components from simplest to most complex
   - Update tests for components
   - Resolve integration issues

4. **Week 9-10: Finalization and Optimization**
   - Enable stricter TypeScript settings
   - Refactor to eliminate any remaining `any` types
   - Final testing and validation

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript with React Hooks](https://fettblog.eu/typescript-react-typeing-custom-hooks/)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

## Conclusion

Migrating to TypeScript is a significant undertaking that will yield long-term benefits in code quality, maintainability, and developer experience. By following this incremental approach and focusing on one component at a time, we can successfully transition the entire codebase while minimizing disruption to ongoing development. 
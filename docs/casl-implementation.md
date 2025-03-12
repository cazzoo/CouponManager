# Implementing @casl/ability for Permissions

**Last Updated:** June 15, 2023  
**Status:** Draft

This document outlines the strategy for implementing the @casl/ability library to enhance the permission system in the CouponManager application, replacing the current role-based access control (RBAC) with a more flexible attribute-based access control (ABAC) system.

## Overview

[CASL](https://casl.js.org/v6/en/) is an isomorphic authorization library that restricts what resources a user can access. It will allow us to:

- Define fine-grained permissions based on user attributes and resource properties
- Create dynamic permission rules that adapt to changing data
- Implement centralized permission logic for both frontend and backend
- Support complex permission scenarios that go beyond simple role-based rules

## Current vs. Future State

### Current System (RBAC)

Our current permission system assigns permissions based on user roles:

```javascript
// RoleService.js
const rolePermissions = {
  DEMO_USER: [Permission.VIEW_OWN_COUPONS],
  USER: [
    Permission.VIEW_OWN_COUPONS,
    Permission.CREATE_COUPON,
    Permission.EDIT_COUPON,  // Only own coupons
    Permission.DELETE_COUPON // Only own coupons
  ],
  MANAGER: [
    // All permissions from USER, plus:
    Permission.VIEW_ANY_COUPON,
    Permission.VIEW_USERS,
    Permission.EDIT_USER_ROLE,
    Permission.MANAGE_SYSTEM
  ]
};

async function checkPermission(userId, permission, options = {}) {
  const userRole = await getUserRole(userId);
  const hasBasePermission = rolePermissions[userRole].includes(permission);
  
  // Special case for ownership-based permissions
  if (
    hasBasePermission && 
    userRole === 'USER' && 
    (permission === Permission.EDIT_COUPON || permission === Permission.DELETE_COUPON)
  ) {
    const coupon = await getCoupon(options.couponId);
    return coupon.user_id === userId;
  }
  
  return hasBasePermission;
}
```

### Future System (ABAC with CASL)

With CASL, we'll define abilities based on both roles and resource attributes:

```javascript
// abilities.js
import { AbilityBuilder, Ability } from '@casl/ability';

export function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(Ability);
  
  if (!user) {
    // Unauthenticated user
    can('read', 'Coupon', { isPublic: true });
    return build();
  }
  
  if (user.role === 'DEMO_USER') {
    can('read', 'Coupon', { user_id: user.id });
  }
  
  if (user.role === 'USER') {
    can('read', 'Coupon', { user_id: user.id });
    can('create', 'Coupon');
    can('update', 'Coupon', { user_id: user.id });
    can('delete', 'Coupon', { user_id: user.id });
  }
  
  if (user.role === 'MANAGER') {
    can('manage', 'all'); // Full access to all resources
    cannot('delete', 'User', { id: user.id }); // Cannot delete themselves
    cannot('update', 'UserRole', { user_id: user.id }); // Cannot change own role
  }
  
  return build();
}
```

## Implementation Plan

### 1. Installation and Setup

1. Install the required packages:
   ```bash
   pnpm add @casl/ability @casl/react
   ```

2. If using TypeScript (recommended), also add:
   ```bash
   pnpm add -D @casl/ability-typescript-benchmarks
   ```

### 2. Define Subject Types

Create a definition file for all subject types in the system:

```typescript
// src/types/abilities.ts
import { Ability, AbilityClass } from '@casl/ability';

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Subjects = 'Coupon' | 'User' | 'UserRole' | 'RetailerStats' | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;
```

### 3. Create Ability Factory

Create a service to generate ability instances for users:

```typescript
// src/services/AbilityService.ts
import { AbilityBuilder } from '@casl/ability';
import { AppAbility, Actions, Subjects } from '../types/abilities';
import { User } from '../types/users';

export function defineAbilitiesFor(user: User | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);
  
  // Define abilities based on user role
  
  if (!user) {
    // Unauthenticated user - minimal permissions
    return build();
  }
  
  // DEMO_USER permissions
  if (user.role === 'DEMO_USER') {
    can('read', 'Coupon', { user_id: user.id });
  }
  
  // USER permissions
  if (user.role === 'USER' || user.role === 'MANAGER') {
    can('read', 'Coupon', { user_id: user.id });
    can('create', 'Coupon');
    can('update', 'Coupon', { user_id: user.id });
    can('delete', 'Coupon', { user_id: user.id });
    can('read', 'RetailerStats');
  }
  
  // MANAGER permissions
  if (user.role === 'MANAGER') {
    can('manage', 'all'); // Grants full access
    cannot('delete', 'User', { id: user.id }); // Cannot delete themselves
    cannot('update', 'UserRole', { user_id: user.id }); // Cannot change own role
  }
  
  return build();
}
```

### 4. Create Ability Context

Create a React context to provide the ability throughout the application:

```typescript
// src/services/AbilityContext.tsx
import React, { createContext, useContext } from 'react';
import { AppAbility } from '../types/abilities';
import { defineAbilitiesFor } from './AbilityService';
import { useAuth } from './AuthContext';

const AbilityContext = createContext<AppAbility | undefined>(undefined);

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const ability = defineAbilitiesFor(authState.user);
  
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  const ability = useContext(AbilityContext);
  
  if (!ability) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  
  return ability;
}
```

### 5. Wrap Application with AbilityProvider

Update the application's provider hierarchy:

```tsx
// src/App.tsx
import { AbilityProvider } from './services/AbilityContext';
import { AuthProvider } from './services/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AbilityProvider>
        {/* The rest of your app */}
      </AbilityProvider>
    </AuthProvider>
  );
}
```

### 6. Use Ability in Components

Now use the ability to check permissions in components:

```tsx
// src/components/CouponList.tsx
import { useAbility } from '../services/AbilityContext';

function CouponList() {
  const ability = useAbility();
  const { coupons } = useCoupons();
  
  return (
    <div>
      {coupons.map(coupon => (
        <div key={coupon.id}>
          <h3>{coupon.retailer}</h3>
          <p>{coupon.value}</p>
          
          {ability.can('update', 'Coupon', coupon) && (
            <button onClick={() => editCoupon(coupon)}>Edit</button>
          )}
          
          {ability.can('delete', 'Coupon', coupon) && (
            <button onClick={() => deleteCoupon(coupon.id)}>Delete</button>
          )}
        </div>
      ))}
      
      {ability.can('create', 'Coupon') && (
        <button onClick={openAddCouponForm}>Add Coupon</button>
      )}
    </div>
  );
}
```

### 7. Create Can Component for Cleaner JSX

For cleaner JSX, create a `Can` component:

```tsx
// src/components/Can.tsx
import React from 'react';
import { useAbility } from '../services/AbilityContext';
import { Actions, Subjects } from '../types/abilities';

interface CanProps {
  I: Actions;
  a: Subjects;
  this?: any;
  children: React.ReactNode;
}

export function Can({ I: action, a: subject, this: data, children }: CanProps) {
  const ability = useAbility();
  
  return ability.can(action, subject, data) ? <>{children}</> : null;
}
```

Now use it in your components:

```tsx
// src/components/CouponList.tsx
import { Can } from '../components/Can';

function CouponList() {
  const { coupons } = useCoupons();
  
  return (
    <div>
      {coupons.map(coupon => (
        <div key={coupon.id}>
          <h3>{coupon.retailer}</h3>
          <p>{coupon.value}</p>
          
          <Can I="update" a="Coupon" this={coupon}>
            <button onClick={() => editCoupon(coupon)}>Edit</button>
          </Can>
          
          <Can I="delete" a="Coupon" this={coupon}>
            <button onClick={() => deleteCoupon(coupon.id)}>Delete</button>
          </Can>
        </div>
      ))}
      
      <Can I="create" a="Coupon">
        <button onClick={openAddCouponForm}>Add Coupon</button>
      </Can>
    </div>
  );
}
```

### 8. Migration Strategy

To migrate from the current RBAC system to CASL:

1. **Phase 1 - Parallel Implementation**
   - Implement CASL alongside the existing RoleService
   - Test CASL permissions in non-critical paths
   - Verify that CASL gives the same results as the current system

2. **Phase 2 - Component Migration**
   - Update components one by one to use CASL instead of RoleService
   - Start with simpler components and gradually move to more complex ones
   - Update tests for each component as it's migrated

3. **Phase 3 - Full Replacement**
   - Remove old RoleService permission checks
   - Update API endpoints to use CASL for authorization
   - Extend CASL rules with more fine-grained permissions

### 9. Testing Strategies

1. **Unit Tests for Abilities**

```typescript
// src/tests/abilities.test.ts
import { defineAbilitiesFor } from '../services/AbilityService';

describe('User abilities', () => {
  test('DEMO_USER can only read their own coupons', () => {
    const user = { id: '123', role: 'DEMO_USER' };
    const ability = defineAbilitiesFor(user);
    
    expect(ability.can('read', 'Coupon', { user_id: '123' })).toBe(true);
    expect(ability.can('read', 'Coupon', { user_id: '456' })).toBe(false);
    expect(ability.can('create', 'Coupon')).toBe(false);
  });
  
  test('USER can manage their own coupons', () => {
    const user = { id: '123', role: 'USER' };
    const ability = defineAbilitiesFor(user);
    
    expect(ability.can('read', 'Coupon', { user_id: '123' })).toBe(true);
    expect(ability.can('create', 'Coupon')).toBe(true);
    expect(ability.can('update', 'Coupon', { user_id: '123' })).toBe(true);
    expect(ability.can('update', 'Coupon', { user_id: '456' })).toBe(false);
  });
  
  test('MANAGER can manage all resources except their own role', () => {
    const user = { id: '123', role: 'MANAGER' };
    const ability = defineAbilitiesFor(user);
    
    expect(ability.can('manage', 'Coupon')).toBe(true);
    expect(ability.can('manage', 'User')).toBe(true);
    expect(ability.can('update', 'UserRole', { user_id: '456' })).toBe(true);
    expect(ability.can('update', 'UserRole', { user_id: '123' })).toBe(false);
  });
});
```

2. **Component Tests with CASL**

```tsx
// src/tests/CouponList.test.tsx
import { render, screen } from '@testing-library/react';
import { AbilityProvider } from '../services/AbilityContext';
import { AuthProvider } from '../services/AuthContext';
import CouponList from '../components/CouponList';

// Mock auth context to provide different users
jest.mock('../services/AuthContext', () => ({
  useAuth: () => ({
    authState: {
      user: { id: '123', role: 'USER' },
      isAuthenticated: true
    }
  })
}));

describe('CouponList with permissions', () => {
  test('USER can see edit button for their own coupons', () => {
    render(
      <AuthProvider>
        <AbilityProvider>
          <CouponList />
        </AbilityProvider>
      </AuthProvider>
    );
    
    // Assuming the component is populated with test data
    // where coupon with ID 1 belongs to user 123
    expect(screen.getByTestId('edit-button-1')).toBeInTheDocument();
    
    // Coupon with ID 2 belongs to another user
    expect(screen.queryByTestId('edit-button-2')).not.toBeInTheDocument();
  });
});
```

## Advanced Usage

### Conditional Abilities Based on Resource Properties

You can create more complex permission rules:

```typescript
// Only allow updating coupons that haven't expired
can('update', 'Coupon', { 
  user_id: user.id, 
  expiryDate: { $gt: new Date().toISOString() } 
});

// Allow managers to update any coupon except those marked as archived
if (user.role === 'MANAGER') {
  can('update', 'Coupon', { archived: { $ne: true } });
}
```

### Field-level Permissions

CASL supports field-level permissions:

```typescript
// Allow users to read all fields of their coupons
can('read', 'Coupon', ['id', 'retailer', 'value', 'expiryDate'], { user_id: user.id });

// But only managers can see the 'activationCode' field
if (user.role === 'MANAGER') {
  can('read', 'Coupon', 'activationCode');
}
```

### Permission Management UI

For administrators, you might want to create a UI to manage permissions:

```tsx
function PermissionManagement() {
  const [role, setRole] = useState('USER');
  const [permissions, setPermissions] = useState([]);
  
  function handlePermissionChange(action, subject, checked) {
    if (checked) {
      setPermissions([...permissions, { action, subject }]);
    } else {
      setPermissions(permissions.filter(p => 
        !(p.action === action && p.subject === subject)
      ));
    }
  }
  
  function savePermissions() {
    // Save to database
  }
  
  return (
    <div>
      <h2>Edit Permissions for {role}</h2>
      
      <div>
        <h3>Coupon Permissions</h3>
        <label>
          <input 
            type="checkbox" 
            checked={permissions.some(p => p.action === 'read' && p.subject === 'Coupon')}
            onChange={e => handlePermissionChange('read', 'Coupon', e.target.checked)}
          />
          View Coupons
        </label>
        {/* More permissions... */}
      </div>
      
      <button onClick={savePermissions}>Save Changes</button>
    </div>
  );
}
```

## Conclusion

Implementing CASL will give us a more flexible and powerful permission system that can handle complex business rules. The migration will require careful planning and testing, but the end result will be a more maintainable and adaptable system that can grow with our application's needs.

## References

- [CASL Documentation](https://casl.js.org/v6/en/)
- [CASL React Integration](https://casl.js.org/v6/en/package/casl-react)
- [TypeScript Support in CASL](https://casl.js.org/v6/en/advanced/typescript) 
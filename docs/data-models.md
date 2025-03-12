# Data Models Reference for CouponManager

This document provides a comprehensive reference for the data models used throughout the CouponManager application. Understanding these models is essential for developers working on the codebase.

## Coupon Model

The Coupon model represents gift cards, vouchers, and coupons managed by the application.

```typescript
interface Coupon {
  id: string;                // Unique identifier for the coupon
  retailer: string;          // Name of the retailer or brand
  value: string;             // Monetary/discount value (e.g., "$20", "20% off")
  expiryDate?: string;       // Optional expiry date in ISO format (YYYY-MM-DD)
  description?: string;      // Optional description of the coupon
  activationCode: string;    // Unique code to activate/redeem the coupon
  isUsed: boolean;           // Whether the coupon has been used
  dateAdded: string;         // Date the coupon was added to the system (ISO format)
  currency?: string;         // Optional currency code (defaults to USD)
  image?: string;            // Optional URL or base64 data for an image
  barcode?: string;          // Optional barcode identifier
  category?: string;         // Optional category classification
  minimumPurchase?: string;  // Optional minimum purchase requirement
  terms?: string;            // Optional terms and conditions
  lastUpdated?: string;      // Optional date when the coupon was last updated
  user_id: string;           // User ID who owns this coupon
}
```

### Coupon Validation Rules

- `id`: Auto-generated UUID, should never be manually set
- `retailer`: Required, non-empty string
- `value`: Required, non-empty string
- `activationCode`: Required, unique, non-empty string
- `isUsed`: Default is `false`
- `dateAdded`: Auto-generated timestamp when the coupon is created
- `expiryDate`: Must be a valid ISO date string if provided
- `currency`: Should follow ISO 4217 standard if provided
- `user_id`: Must be a valid user ID from the authentication system

## Retailer Statistics Model

The RetailerStats model represents aggregated data about retailers in the system.

```typescript
interface RetailerStats {
  name: string;              // Name of the retailer
  count: number;             // Total number of coupons for this retailer
  value: number;             // Total monetary value of all coupons
  unused: number;            // Number of unused coupons
  used: number;              // Number of used coupons
  currency: string;          // Primary currency for this retailer
  earliestExpiry?: string;   // Date of the earliest expiring coupon (ISO format)
}
```

## User Model

The User model represents users in the system.

```typescript
interface User {
  id: string;                // Unique identifier from auth system
  email: string;             // User's email address
  created_at: string;        // When the user was created
  last_sign_in_at: string;   // When the user last signed in
  role: Role;                // User's role
}

enum Role {
  DEMO_USER = 'DEMO_USER',   // Limited demo user
  USER = 'USER',             // Regular user
  MANAGER = 'MANAGER'        // Administrator
}
```

## User Role Model

The UserRole model represents the role assigned to a user.

```typescript
interface UserRole {
  user_id: string;           // User ID from auth system
  role: Role;                // User's role
  created_at: string;        // When the role was assigned
}
```

## Permission Model

The Permission model represents permissions in the system.

```typescript
enum Permission {
  VIEW_OWN_COUPONS = 'VIEW_OWN_COUPONS',
  VIEW_ANY_COUPON = 'VIEW_ANY_COUPON',
  CREATE_COUPON = 'CREATE_COUPON',
  EDIT_COUPON = 'EDIT_COUPON',
  DELETE_COUPON = 'DELETE_COUPON',
  VIEW_USERS = 'VIEW_USERS',
  EDIT_USER_ROLE = 'EDIT_USER_ROLE',
  MANAGE_SYSTEM = 'MANAGE_SYSTEM'
}
```

## Filter Model

The Filter model represents the filtering criteria for the coupon list.

```typescript
interface FilterOptions {
  searchTerm: string;        // Text to search across multiple fields
  isUsed: boolean | null;    // Filter by usage status (null means both)
  fromDate: string | null;   // Start date for filtering by expiry (ISO format)
  toDate: string | null;     // End date for filtering by expiry (ISO format)
  retailers: string[];       // Array of retailer names to include
  sortBy: SortOption;        // Current sort option
  sortDirection: 'asc' | 'desc'; // Sort direction
}

type SortOption = 'retailer' | 'value' | 'expiryDate' | 'dateAdded';
```

## Language Model

The Language model represents localization data for the application UI.

```typescript
interface Language {
  code: string;              // ISO language code (e.g., 'en', 'es')
  name: string;              // Display name of the language
  translations: Record<string, string>; // Key-value pairs of translation strings
  isRTL: boolean;            // Whether the language is right-to-left
}

interface LanguageContextType {
  language: string;          // Current language code
  setLanguage: (code: string) => void; // Function to change language
  t: (key: string) => string; // Translation function
  languages: Language[];     // Available languages
}
```

## Authentication Model

The Authentication model represents the authentication state.

```typescript
interface AuthState {
  user: User | null;         // Current user or null if not authenticated
  isLoading: boolean;        // Whether authentication is being loaded
  isAuthenticated: boolean;  // Whether the user is authenticated
  isManager: boolean;        // Whether the user has the MANAGER role
  isDemo: boolean;           // Whether the user has the DEMO_USER role
}

interface AuthContextType {
  authState: AuthState;      // Current authentication state
  signIn: (email: string, password: string) => Promise<void>; // Sign in function
  signOut: () => Promise<void>; // Sign out function
  checkPermission: (permission: Permission, options?: any) => boolean; // Check if user has permission
}
```

## Theme Model

The Theme model represents the application's theme settings.

```typescript
interface ThemeSettings {
  mode: 'light' | 'dark';    // Current theme mode
  toggleTheme: () => void;   // Function to toggle between light/dark
}
```

## Form Models

### Coupon Form Model

The CouponForm model represents the data entered in the coupon add/edit form.

```typescript
interface CouponFormData {
  retailer: string;
  value: string;
  expiryDate?: string;
  description?: string;
  activationCode: string;
  isUsed: boolean;
  currency?: string;
  category?: string;
  minimumPurchase?: string;
  terms?: string;
}
```

### Form Validation Model

The FormValidation model represents validation state for form fields.

```typescript
interface FormValidation {
  retailer: boolean;
  value: boolean;
  activationCode: boolean;
  isFormValid: boolean;
}
```

## Barcode Model

The Barcode model represents data related to barcode scanning.

```typescript
interface BarcodeData {
  text: string;              // The scanned barcode text
  format: string;            // The format of the barcode (e.g., 'CODE_128')
}

interface BarcodeScannerProps {
  onScan: (data: BarcodeData) => void; // Callback when barcode is scanned
  isActive: boolean;         // Whether the scanner is active
}
```

## Data Flow Diagrams

### Coupon Creation Flow

```mermaid
graph TD
    A[User inputs coupon data] --> B[Form validation]
    B -->|Valid| C[Create coupon object]
    C --> P[Add user ID to coupon]
    P --> Q[Check user permissions]
    Q -->|Has permission| D[Add to coupon list]
    D --> E[Update retailer statistics]
    B -->|Invalid| F[Display validation errors]
    Q -->|No permission| G[Display permission error]
```

### Coupon Usage Flow

```mermaid
graph TD
    A[User marks coupon as used] --> H[Check user permissions]
    H -->|Has permission| B[Update coupon object]
    B --> C[Update UI]
    B --> D[Update retailer statistics]
    H -->|No permission| G[Display permission error]
```

### User Management Flow

```mermaid
graph TD
    A[Manager views user list] --> B[Fetch users from system]
    B --> C[Display user list]
    C --> D[Manager changes user role]
    D --> E[Check permissions]
    E -->|Has permission| F[Update user role]
    F --> G[Update UI]
    E -->|No permission| H[Display permission error]
```

## Supabase Database Schema

The application uses Supabase as its database with the following tables:

### coupons

- `id`: UUID PRIMARY KEY
- `retailer`: TEXT NOT NULL
- `value`: TEXT NOT NULL
- `expiry_date`: TIMESTAMP
- `description`: TEXT
- `activation_code`: TEXT NOT NULL
- `is_used`: BOOLEAN NOT NULL DEFAULT FALSE
- `date_added`: TIMESTAMP NOT NULL DEFAULT NOW()
- `currency`: TEXT
- `image`: TEXT
- `barcode`: TEXT
- `category`: TEXT
- `minimum_purchase`: TEXT
- `terms`: TEXT
- `last_updated`: TIMESTAMP
- `user_id`: UUID REFERENCES auth.users(id)

### user_roles

- `user_id`: UUID PRIMARY KEY REFERENCES auth.users(id)
- `role`: TEXT NOT NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT NOW()

## Local Storage Schema (Development Mode)

In development mode with the local memory database, the application uses localStorage with the following keys:

- `couponManager_coupons`: Array of Coupon objects
- `couponManager_language`: Current language code
- `couponManager_theme`: Current theme setting ('light' or 'dark')
- `couponManager_lastFilter`: Last used filter settings
- `couponManager_users`: Array of User objects
- `couponManager_userRoles`: Array of UserRole objects
- `couponManager_currentUser`: Current authenticated user

Example localStorage structure:

```json
{
  "couponManager_coupons": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "retailer": "Amazon",
      "value": "$50",
      "expiryDate": "2023-12-31",
      "activationCode": "AMZN-12345-ABCDE",
      "isUsed": false,
      "dateAdded": "2023-01-15T14:30:00Z",
      "user_id": "auth0|123456789"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "retailer": "Starbucks",
      "value": "$20",
      "activationCode": "SB-98765-FGHIJ",
      "isUsed": true,
      "dateAdded": "2023-02-10T09:15:00Z",
      "currency": "USD",
      "user_id": "auth0|123456789"
    }
  ],
  "couponManager_language": "en",
  "couponManager_theme": "dark",
  "couponManager_lastFilter": {
    "searchTerm": "",
    "isUsed": null,
    "fromDate": null,
    "toDate": null,
    "retailers": [],
    "sortBy": "dateAdded",
    "sortDirection": "desc"
  },
  "couponManager_users": [
    {
      "id": "auth0|123456789",
      "email": "user@example.com",
      "created_at": "2023-01-01T00:00:00Z",
      "last_sign_in_at": "2023-01-02T00:00:00Z"
    },
    {
      "id": "auth0|987654321",
      "email": "manager@example.com",
      "created_at": "2023-01-01T00:00:00Z",
      "last_sign_in_at": "2023-01-02T00:00:00Z"
    }
  ],
  "couponManager_userRoles": [
    {
      "user_id": "auth0|123456789",
      "role": "USER",
      "created_at": "2023-01-01T00:00:00Z"
    },
    {
      "user_id": "auth0|987654321",
      "role": "MANAGER",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "couponManager_currentUser": {
    "id": "auth0|123456789",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00Z",
    "last_sign_in_at": "2023-01-02T00:00:00Z",
    "role": "USER"
  }
}
```

## Data Transformation

### Coupon to Display Format

When displaying coupons in the UI, the raw data model is transformed:

```javascript
const displayCoupon = {
  ...coupon,
  expiryDisplay: coupon.expiryDate 
    ? formatDate(coupon.expiryDate) 
    : 'No expiration',
  valueDisplay: coupon.currency 
    ? `${coupon.value} ${coupon.currency}` 
    : coupon.value,
  statusLabel: coupon.isUsed 
    ? 'Used' 
    : isExpired(coupon.expiryDate) ? 'Expired' : 'Active',
  daysUntilExpiry: calculateDaysUntilExpiry(coupon.expiryDate)
};
```

### Statistics Calculation

Retailer statistics are derived from the coupon list:

```javascript
const calculateRetailerStats = (coupons) => {
  const retailers = {};
  
  coupons.forEach(coupon => {
    if (!retailers[coupon.retailer]) {
      retailers[coupon.retailer] = {
        name: coupon.retailer,
        count: 0,
        value: 0,
        unused: 0,
        used: 0,
        currency: coupon.currency || 'USD',
        earliestExpiry: null
      };
    }
    
    const stats = retailers[coupon.retailer];
    stats.count++;
    
    if (coupon.isUsed) {
      stats.used++;
    } else {
      stats.unused++;
      // Only consider numeric values for statistics
      const numericValue = parseFloat(coupon.value.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericValue)) {
        stats.value += numericValue;
      }
      
      // Track earliest expiry date
      if (coupon.expiryDate && (!stats.earliestExpiry || coupon.expiryDate < stats.earliestExpiry)) {
        stats.earliestExpiry = coupon.expiryDate;
      }
    }
  });
  
  return Object.values(retailers);
};
```

## Data Validation Functions

```javascript
const validateCoupon = (coupon) => {
  const errors = {};
  
  if (!coupon.retailer.trim()) {
    errors.retailer = 'Retailer is required';
  }
  
  if (!coupon.value.trim()) {
    errors.value = 'Value is required';
  }
  
  if (!coupon.activationCode.trim()) {
    errors.activationCode = 'Activation code is required';
  }
  
  if (coupon.expiryDate && !isValidDate(coupon.expiryDate)) {
    errors.expiryDate = 'Invalid date format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## Guidelines for Model Changes

When modifying data models:

1. Update the relevant interface definitions
2. Update validation functions
3. Update transformation functions
4. Update test fixtures and mocks
5. Consider backward compatibility for existing stored data
6. Document the changes in the changelog 
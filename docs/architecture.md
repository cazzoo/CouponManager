# Architecture for CouponManager

## Status: Approved

## Technical Summary
This architecture defines a modern, responsive web application for managing vouchers and coupons with an intuitive user interface. The CouponManager application is built using React and Material-UI, providing a maintainable and scalable frontend architecture that supports both desktop and mobile viewing experiences. The architecture emphasizes component reusability, clean separation of concerns, and comprehensive test coverage.

## Technology Table

| Technology | Description |
|------------|-------------|
| React 18 | Frontend library for building the user interface |
| Material-UI (MUI) v5 | Component library providing pre-styled UI elements with customizable theming |
| Vite | Build tool and development server with hot module replacement |
| Vitest | Test runner compatible with Vite for unit and integration testing |
| React Testing Library | Testing utilities for React components |
| date-fns | Date manipulation library for handling coupon expiration dates |
| pnpm | Package manager for managing dependencies |
| React Hooks | State management approach using React's built-in hooks |
| react-qr-reader | Library for barcode and QR code scanning |
| JSX/JavaScript | Primary languages for component development |
| Supabase | Backend as a Service (BaaS) for authentication and data storage |
| i18next | Internationalization framework for multi-language support |
| MSW (Mock Service Worker) | API mocking library for development and testing |
| @casl/ability | Permission management library (planned for implementation) |

## Architectural Diagrams

### Component Architecture

```mermaid
graph TD
    A[App] --> B[ThemeProvider]
    B --> C[CouponList]
    B --> D[RetailerList]
    B --> E[LanguageSelector]
    B --> U[UserManagement]
    C --> F[AddCouponForm]
    F --> G[BarcodeScanner]
    
    style A fill:#f9f,stroke:#333
    style B fill:#bbf,stroke:#333
    style C fill:#bfb,stroke:#333
    style D fill:#bfb,stroke:#333
    style U fill:#fbf,stroke:#333
```

### Service Layer Interaction

```mermaid
graph TD
    A[Components] -->|Uses| B[CouponService]
    A -->|Uses| C[LanguageService]
    A -->|Uses| R[RoleService]
    A -->|Uses| X[AuthService]
    B -->|Manages| D[(Database)]
    B -.->|Dev Mode| L[(LocalMemoryDB)]
    C -->|Manages| D[(Database)]
    R -->|Manages| D[(Database)]
    X -->|Authenticates| S[(Supabase)]
    X -.->|Dev Mode| M[(MockAuth)]
    A -->|Consumes| E[LanguageContext]
    A -->|Consumes| AU[AuthContext]
    E -->|Uses| C[LanguageService]
    
    style A fill:#f9f,stroke:#333
    style B fill:#bfb,stroke:#333
    style C fill:#bfb,stroke:#333
    style R fill:#bfb,stroke:#333
    style X fill:#bfb,stroke:#333
    style D fill:#bbf,stroke:#333
    style L fill:#fbb,stroke:#333,stroke-dasharray: 5 5
    style E fill:#bbf,stroke:#333
    style AU fill:#bbf,stroke:#333
    style S fill:#bbf,stroke:#333
    style M fill:#fbb,stroke:#333,stroke-dasharray: 5 5
```

### User Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as User Interface
    participant CS as CouponService
    participant LS as LocalStorage/Supabase

    User->>UI: Adds new coupon
    UI->>CS: saveCoupon(couponData)
    CS->>LS: Store coupon data
    LS-->>CS: Confirm storage
    CS-->>UI: Return success
    UI-->>User: Display updated coupon list

    User->>UI: Filters coupons
    UI->>CS: getCoupons(filters)
    CS->>LS: Retrieve filtered coupons
    LS-->>CS: Return matching coupons
    CS-->>UI: Return filtered list
    UI-->>User: Display filtered results
```

## Data Models

### Coupon Schema
```javascript
{
  "id": "string", // Unique identifier
  "retailer": "string", // Store or service provider name
  "initialValue": "number", // Original value of the coupon
  "currentValue": "number", // Current/remaining value
  "expirationDate": "Date", // When the coupon expires
  "activationCode": "string", // Code to activate or use the coupon
  "pin": "string", // PIN if required for redemption
  "used": "boolean", // Whether the coupon has been fully used
  "notes": "string", // Additional information
  "addedDate": "Date", // When the coupon was added to the system
  "user_id": "string" // User ID who owns this coupon
}
```

### Retailer Statistics Model
```javascript
{
  "name": "string", // Retailer name
  "totalCoupons": "number", // Count of all coupons
  "activeCoupons": "number", // Count of unused coupons
  "expiredCoupons": "number", // Count of expired coupons
  "totalValue": "number", // Sum of all coupon values
  "activeValue": "number" // Sum of active coupon values
}
```

### Language Service Model
```javascript
{
  "currentLanguage": "string", // Current language code (e.g., "en", "es")
  "translations": "Object", // Key-value pairs of translation strings
  "supportedLanguages": [
    {
      "code": "string", // Language code
      "name": "string" // Display name
    }
  ]
}
```

### User Roles Model
```javascript
{
  "user_id": "string", // User ID from Supabase auth
  "role": "string", // Role: "DEMO_USER", "USER", or "MANAGER"
  "created_at": "timestamp" // When the role was assigned
}
```

## Project Structure

```
CouponManager/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   │   ├── AddCouponForm.jsx     # Form for adding/editing coupons
│   │   ├── BarcodeScanner.jsx    # Component for scanning coupon barcodes
│   │   ├── CouponList.jsx        # Main coupon display component
│   │   ├── LanguageSelector.jsx  # Component for language selection
│   │   ├── RetailerList.jsx      # Retailer statistics component
│   │   └── UserManagement.jsx    # User management component
│   ├── services/     # Service layer for data management
│   │   ├── CouponService.js      # Business logic for coupon operations
│   │   ├── CouponServiceFactory.js # Factory for selecting coupon service implementation
│   │   ├── LanguageContext.jsx   # React context for language state
│   │   ├── LanguageService.js    # Service for localization
│   │   ├── AuthContext.jsx       # React context for authentication state
│   │   ├── AuthService.js        # Service for authentication
│   │   ├── AuthServiceFactory.js # Factory for selecting auth service implementation
│   │   └── RoleService.js        # Service for role-based permissions
│   ├── mocks/        # Mock data and services for development
│   │   ├── data/                 # Mock data
│   │   ├── handlers.js           # MSW request handlers
│   │   └── browser.js            # MSW browser setup
│   ├── locales/      # Internationalization
│   │   ├── en/                   # English translations
│   │   ├── es/                   # Spanish translations
│   │   ├── fr/                   # French translations
│   │   └── de/                   # German translations
│   ├── test/         # Test files
│   │   ├── components/           # Component tests
│   │   └── services/             # Service tests
│   ├── App.jsx       # Main application component
│   └── index.jsx     # Application entry point
├── migrations/       # SQL migrations for database schema
│   ├── sql/                      # SQL migration files
│   └── migrations.json           # Migration metadata
├── scripts/          # Utility scripts
│   ├── run-sql-migrations.js     # Script for running migrations
│   └── create-migration.js       # Script for creating migrations
├── docs/             # Documentation
│   ├── architecture.md           # Architecture documentation
│   ├── data-models.md            # Data models documentation
│   ├── i18n-system.md            # Internationalization documentation
│   ├── local-memory-db.md        # Local memory database documentation
│   ├── migration-system.md       # Migration system documentation
│   ├── permission-matrix.md      # Permission matrix documentation
│   ├── supabase-rls.md           # Supabase Row Level Security documentation
│   ├── supabase-setup.md         # Supabase setup documentation
│   ├── user-management.md        # User management documentation
│   └── prd.md                    # Product Requirements Document
├── .cursor/rules/    # Cursor rules for development standards
├── index.html        # HTML template
├── package.json      # Project dependencies and scripts
├── pnpm-lock.yaml    # Lock file for dependencies
└── vite.config.js    # Vite configuration
```

## Change Log

| Change | Story ID | Description |
|--------|----------|-------------|
| Initial Architecture | story-1 | Initial approved system design and documentation |
| Add LanguageService | story-2 | Integration of translation service for internationalization |
| Add BarcodeScanner | story-3 | Implementation of barcode scanning functionality |
| Mobile Optimization | story-4 | Enhanced mobile view with responsive design | 
| Supabase Integration | story-5 | Integration with Supabase for authentication and data storage |
| User Management | story-6 | Implementation of user management functionality |
| Local Memory DB | story-7 | Implementation of local memory database for development | 
# Cypress Testing Guide

**Version:** 1.0.0  
**Status:** Authoritative Reference  
**Last Updated:** 2026-01-26

## Table of Contents

1. [Introduction](#introduction)
2. [Cypress in This Project](#cypress-in-this-project)
3. [E2E Testing Overview](#e2e-testing-overview)
4. [Component Testing Overview](#component-testing-overview)
5. [Page Object Model](#page-object-model)
6. [Custom Commands](#custom-commands)
7. [Best Practices](#best-practices)
8. [Running Tests Locally](#running-tests-locally)
9. [Running Tests in CI/CD](#running-tests-in-cicd)
10. [Troubleshooting Common Issues](#troubleshooting-common-issues)
11. [Examples and Patterns](#examples-and-patterns)

---

## Introduction

Cypress is the exclusive testing framework used in the CouponManager project for all testing needs. It provides both E2E (End-to-End) and component testing capabilities, allowing developers to test their applications from a user's perspective.

### Why Cypress?

- **Fast and Reliable**: Cypress runs directly in the browser, providing fast and reliable tests
- **Time Travel**: Debug tests by stepping through commands and seeing the application state at each step
- **Automatic Waiting**: Cypress automatically waits for elements to appear, eliminating flaky tests
- **Network Control**: Intercept and stub network requests for complete control over application behavior
- **Component Testing**: Test React components in isolation with full DOM interaction
- **Real Browser**: Tests run in a real browser, not a simulated environment

---

## Cypress in This Project

### Project Structure

```
cypress/
├── component/              # Component test files
│   ├── AddCouponForm.cy.tsx
│   ├── BarcodeScanner.cy.tsx
│   ├── CouponList.cy.tsx
│   ├── LanguageSelector.cy.tsx
│   ├── LoginForm.cy.tsx
│   ├── RetailerList.cy.tsx
│   └── UserManagement.cy.tsx
├── e2e/                    # E2E test files
│   ├── accessibility.cy.ts
│   ├── auth.cy.ts
│   ├── coupon-management.cy.ts
│   ├── dashboard.cy.ts
│   ├── language-switching.cy.ts
│   ├── responsive-design.cy.ts
│   ├── retailer-management.cy.ts
│   └── user-management.cy.ts
├── pages/                   # Page Object Models
│   ├── CouponPage.ts
│   ├── DashboardPage.ts
│   ├── LoginPage.ts
│   ├── RetailerPage.ts
│   └── UserManagementPage.ts
├── fixtures/                # Test data
│   └── example.json
└── support/                 # Support files
    ├── commands.ts          # Custom commands
    ├── component.ts         # Component test setup
    ├── e2e.ts             # E2E test setup
    ├── index.ts            # Main support file
    └── types.ts            # TypeScript type definitions
```

### Available Commands

```bash
# E2E Testing
pnpm cypress:run              # Run all E2E tests
pnpm cypress:open             # Open Cypress Test Runner for interactive testing

# Component Testing
pnpm cypress:component:run    # Run all component tests
pnpm cypress:component:open    # Open Cypress Component Test Runner
```

---

## E2E Testing Overview

E2E tests simulate real user interactions with the application, testing complete workflows from start to finish.

### When to Use E2E Tests

- Testing complete user journeys (e.g., login → dashboard → add coupon)
- Validating integration between multiple components
- Testing critical user paths and happy paths
- Verifying application behavior in a real browser
- Testing authentication and authorization flows

### E2E Test Structure

```typescript
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

### E2E Testing Best Practices

1. **Use Page Object Model**: Encapsulate page logic in reusable page objects
2. **Test User Flows**: Test complete user journeys, not individual components
3. **Use Realistic Data**: Use realistic test data that mirrors production
4. **Clean Up**: Clean up test data after each test
5. **Avoid Hard Waits**: Let Cypress automatically wait for elements
6. **Use Selectors Wisely**: Prefer `data-testid` attributes over CSS selectors

---

## Component Testing Overview

Component tests test React components in isolation, focusing on component logic, rendering, and interactions.

### When to Use Component Tests

- Testing component rendering with different props
- Validating component state changes
- Testing user interactions within a component
- Testing error states and edge cases
- Testing component-specific logic

### Component Test Structure

```typescript
import { mount } from 'cypress/react18';
import { ThemeProvider } from '@mui/material/styles';
import CouponList from '../../components/CouponList';

describe('CouponList', () => {
  const mockCoupons = [
    {
      id: '1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: '2024-12-31'
    }
  ];

  it('renders correctly with coupons', () => {
    mount(
      <ThemeProvider>
        <CouponList coupons={mockCoupons} />
      </ThemeProvider>
    );

    cy.contains('Amazon').should('be.visible');
  });

  it('handles coupon deletion', () => {
    const onDelete = cy.stub().as('onDelete');

    mount(
      <ThemeProvider>
        <CouponList coupons={mockCoupons} onDelete={onDelete} />
      </ThemeProvider>
    );

    cy.get('[data-testid="delete-button"]').click();
    cy.get('@onDelete').should('have.been.called');
  });
});
```

### Component Testing Best Practices

1. **Use Mount**: Use `mount()` from `cypress/react18` for React components
2. **Provide Context**: Wrap components with necessary providers (ThemeProvider, etc.)
3. **Test Props**: Test component behavior with different prop combinations
4. **Test Interactions**: Test user interactions and state changes
5. **Test Edge Cases**: Test error states and edge cases
6. **Avoid Testing Implementation**: Focus on user-facing behavior, not internal logic

---

## Page Object Model

Page Object Model (POM) is a design pattern that creates an object-oriented abstraction for web pages, making tests more maintainable and reusable.

### Benefits of Page Object Model

- **Maintainability**: Changes to UI only require updates to page objects
- **Reusability**: Page objects can be reused across multiple tests
- **Readability**: Tests become more readable and self-documenting
- **Separation of Concerns**: Test logic is separated from page structure

### Page Object Structure

```typescript
// cypress/pages/LoginPage.ts
export class LoginPage {
  private elements = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]',
    logoutButton: '[data-testid="logout-button"]'
  };

  visit(): void {
    cy.visit('/');
  }

  login(email: string, password: string): void {
    cy.get(this.elements.emailInput).type(email);
    cy.get(this.elements.passwordInput).type(password);
    cy.get(this.elements.loginButton).click();
  }

  shouldShowErrorMessage(message: string): void {
    cy.get(this.elements.errorMessage).should('contain', message);
  }

  logout(): void {
    cy.get(this.elements.logoutButton).click();
  }
}
```

### Using Page Objects in Tests

```typescript
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

describe('Authentication Tests', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    loginPage.visit();
  });

  it('should login successfully', () => {
    loginPage.login('user@example.com', 'password123');
    dashboardPage.shouldBeVisible();
  });

  it('should show error with invalid credentials', () => {
    loginPage.login('invalid@example.com', 'wrongpassword');
    loginPage.shouldShowErrorMessage('Invalid credentials');
  });
});
```

### Page Object Best Practices

1. **Encapsulate Elements**: Store element selectors as private properties
2. **Descriptive Methods**: Use descriptive method names that indicate user actions
3. **Chainable Methods**: Return `this` to allow method chaining
4. **Page-Specific Logic**: Keep page objects focused on page-specific logic
5. **Reuse Page Objects**: Reuse page objects across multiple tests

---

## Custom Commands

Custom commands encapsulate common test actions and assertions, making tests more readable and maintainable.

### Creating Custom Commands

```typescript
// cypress/support/commands.ts
declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    logout(): Chainable<void>;
    shouldHaveCouponCount(count: number): Chainable<void>;
    shouldBeAuthenticated(): Chainable<void>;
  }
}

/**
 * Login with credentials
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

/**
 * Logout from the application
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/');
});

/**
 * Assert coupon count
 */
Cypress.Commands.add('shouldHaveCouponCount', (count: number) => {
  cy.get('[data-testid="coupon-item"]').should('have.length', count);
});

/**
 * Assert user is authenticated
 */
Cypress.Commands.add('shouldBeAuthenticated', () => {
  cy.get('[data-testid="user-menu"]').should('be.visible');
});
```

### Using Custom Commands in Tests

```typescript
describe('Coupon Management', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
  });

  it('should display coupons', () => {
    cy.shouldHaveCouponCount(3);
  });

  it('should allow logout', () => {
    cy.logout();
    cy.url().should('include', '/');
  });

  afterEach(() => {
    cy.logout();
  });
});
```

### Available Custom Commands

| Command | Description | Usage |
|---------|-------------|---------|
| `cy.login(email, password)` | Login with credentials | `cy.login('user@example.com', 'password123')` |
| `cy.logout()` | Logout from the application | `cy.logout()` |
| `cy.shouldHaveCouponCount(count)` | Assert coupon count | `cy.shouldHaveCouponCount(3)` |
| `cy.shouldBeAuthenticated()` | Assert user is authenticated | `cy.shouldBeAuthenticated()` |

---

## Best Practices

### General Testing Best Practices

1. **Test User Behavior**: Test what users do, not how the code works
2. **Use Descriptive Names**: Use clear, descriptive test names
3. **Keep Tests Independent**: Each test should be able to run independently
4. **Avoid Test Interdependence**: Tests should not depend on each other
5. **Test Happy Paths**: Test the most common user flows
6. **Test Error Cases**: Test error handling and edge cases
7. **Clean Up**: Clean up test data after each test

### Selector Best Practices

1. **Use `data-testid` Attributes**: Add `data-testid` attributes to elements for stable selection
2. **Avoid CSS Selectors**: CSS selectors can be fragile and break with style changes
3. **Use Role-Based Selectors**: Use `cy.getByRole()` when appropriate
4. **Use Accessibility Selectors**: Use `cy.getByLabelText()` for form fields

```typescript
// ✅ Good - Using data-testid
cy.get('[data-testid="submit-button"]').click();

// ✅ Good - Using role
cy.get('button', { name: 'Submit' }).click();

// ❌ Bad - Using CSS selector
cy.get('.btn-primary.submit').click();
```

### Assertion Best Practices

1. **Use Explicit Assertions**: Be explicit about what you're asserting
2. **Chain Assertions**: Chain assertions for clarity
3. **Use Appropriate Matchers**: Use the right matcher for your assertion
4. **Assert User-Facing Behavior**: Assert what users see, not internal state

```typescript
// ✅ Good - Explicit assertion
cy.get('[data-testid="message"]').should('be.visible').and('contain', 'Success');

// ✅ Good - Chained assertions
cy.get('[data-testid="form"]').should('be.visible').and('not.be.disabled');

// ❌ Bad - Vague assertion
cy.get('[data-testid="message"]').should('exist');
```

### Network Request Best Practices

1. **Intercept Network Requests**: Use `cy.intercept()` to control network requests
2. **Wait for Requests**: Use `cy.wait()` to wait for specific requests
3. **Stub Responses**: Use `cy.intercept()` to stub responses for testing

```typescript
// Intercept and stub API request
cy.intercept('GET', '/api/coupons', { fixture: 'coupons.json' }).as('getCoupons');

// Wait for the request to complete
cy.wait('@getCoupons');

// Assert the response
cy.get('@getCoupons').its('response.statusCode').should('eq', 200);
```

---

## Running Tests Locally

### Interactive Testing

For interactive testing with the Cypress Test Runner:

```bash
# Open Cypress Test Runner for E2E tests
pnpm cypress:open

# Open Cypress Component Test Runner
pnpm cypress:component:open
```

The Cypress Test Runner provides:
- **Interactive Test Selection**: Select which tests to run
- **Time Travel**: Step through commands and see application state
- **Command Log**: View all executed commands
- **Application Preview**: See the application in real-time
- **Test Runner UI**: Run tests in watch mode

### Running All Tests

To run all tests from the command line:

```bash
# Run all E2E tests
pnpm cypress:run

# Run all component tests
pnpm cypress:component:run
```

### Running Specific Tests

To run specific tests or test suites:

```bash
# Run specific E2E test file
pnpm cypress:run --spec "cypress/e2e/auth.cy.ts"

# Run specific component test file
pnpm cypress:component:run --spec "cypress/component/CouponList.cy.tsx"

# Run tests matching a pattern
pnpm cypress:run --spec "cypress/e2e/*auth*.cy.ts"
```

### Running Tests in Different Browsers

To run tests in different browsers:

```bash
# Run tests in Chrome (default)
pnpm cypress:run --browser chrome

# Run tests in Firefox
pnpm cypress:run --browser firefox

# Run tests in Edge
pnpm cypress:run --browser edge
```

### Running Tests in Headless Mode

For CI/CD environments, run tests in headless mode:

```bash
# Run E2E tests in headless mode
pnpm cypress:run --headless

# Run component tests in headless mode
pnpm cypress:component:run --headless
```

---

## Running Tests in CI/CD

### GitHub Actions Configuration

The project uses GitHub Actions for CI/CD. Tests are automatically run on push and pull requests.

### Test Workflow

```yaml
# .github/workflows/build-and-test.yml
name: Build and Test

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build application
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm cypress:run --headless
      
      - name: Run component tests
        run: pnpm cypress:component:run --headless
```

### CI/CD Best Practices

1. **Run in Headless Mode**: Use `--headless` flag for CI/CD environments
2. **Use Parallel Execution**: Run tests in parallel for faster feedback
3. **Generate Reports**: Generate test reports for better visibility
4. **Fail Fast**: Configure tests to fail fast on first failure
5. **Use Caching**: Cache dependencies for faster builds

---

## Troubleshooting Common Issues

### Issue: Tests Are Flaky

**Symptoms**: Tests pass sometimes but fail other times.

**Solutions**:
1. Use `cy.wait()` with explicit timeouts instead of hard waits
2. Use `cy.intercept()` to wait for network requests
3. Increase timeout with `.timeout()` if needed
4. Check for race conditions in your application

```typescript
// ✅ Good - Wait for network request
cy.intercept('GET', '/api/coupons').as('getCoupons');
cy.get('[data-testid="refresh-button"]').click();
cy.wait('@getCoupons');

// ❌ Bad - Hard wait
cy.get('[data-testid="refresh-button"]').click();
cy.wait(1000); // Flaky!
```

### Issue: Element Not Found

**Symptoms**: Cypress cannot find an element that should exist.

**Solutions**:
1. Check if the element exists in the DOM
2. Verify the selector is correct
3. Check if the element is hidden or obscured
4. Use `cy.contains()` for text-based selection
5. Increase timeout with `.timeout()`

```typescript
// ✅ Good - Use contains for text
cy.contains('Submit').click();

// ✅ Good - Increase timeout
cy.get('[data-testid="submit-button"]', { timeout: 10000 }).click();

// ❌ Bad - Incorrect selector
cy.get('.submit-btn').click(); // Element might not exist
```

### Issue: Tests Timeout

**Symptoms**: Tests fail due to timeout errors.

**Solutions**:
1. Increase timeout for specific commands
2. Check if the application is slow to respond
3. Verify network requests are completing
4. Use `cy.intercept()` to wait for requests

```typescript
// ✅ Good - Increase timeout
cy.get('[data-testid="submit-button"]').click({ timeout: 10000 });

// ✅ Good - Wait for network request
cy.intercept('POST', '/api/coupons').as('addCoupon');
cy.get('[data-testid="submit-button"]').click();
cy.wait('@addCoupon', { timeout: 10000 });
```

### Issue: Component Tests Fail to Mount

**Symptoms**: Component tests fail with mounting errors.

**Solutions**:
1. Wrap components with necessary providers (ThemeProvider, etc.)
2. Mock context providers if needed
3. Check for missing props
4. Verify component dependencies are available

```typescript
// ✅ Good - Wrap with ThemeProvider
mount(
  <ThemeProvider>
    <CouponList coupons={mockCoupons} />
  </ThemeProvider>
);

// ❌ Bad - Missing ThemeProvider
mount(<CouponList coupons={mockCoupons} />); // Fails!
```

### Issue: Tests Pass Locally but Fail in CI

**Symptoms**: Tests pass on local machine but fail in CI/CD.

**Solutions**:
1. Check CI environment differences (browser versions, etc.)
2. Ensure all dependencies are installed in CI
3. Check for timing issues (CI might be slower)
4. Verify test data is available in CI
5. Use `--headless` flag for CI environments

### Issue: Cypress Binary Incompatibility on macOS 25.2.0/26.2.0

🚨 **Critical Platform Issue:** Cypress cannot be executed on macOS versions 25.2.0 and 26.2.0 due to binary incompatibility.

**Symptoms**:
- Cypress fails during the initial verification phase
- Error occurs when attempting to verify the installed binary
- All configuration files are correct, but Cypress cannot run

**Affected Versions**:
- macOS 25.2.0
- macOS 26.2.0

**Root Cause**:
This is a platform-level binary compatibility issue that cannot be resolved through configuration changes. The Cypress binary is incompatible with these specific macOS versions.

**Workarounds**:

1. **Use Alternative macOS Versions**:
   - Test on macOS 24.x or earlier
   - Test on macOS 27.x or later (if available)

2. **Use CI/CD with Compatible Environments**:
   ```bash
   # GitHub Actions uses compatible macOS by default
   # Tests will run successfully in CI/CD
   pnpm cypress:run --headless
   ```

3. **Use Docker or Virtual Machines**:
   ```bash
   # Run Cypress in a Docker container with compatible OS
   docker run -it -v $PWD:/e2e -w /e2e cypress/included:15.9.0
   ```

4. **Use Alternative Testing Environments**:
   - Run tests on Linux or Windows
   - Use cloud-based testing services (BrowserStack, Sauce Labs)

**Recommendations**:

> 💡 **For Local Development:** If you're on macOS 25.2.0/26.2.0, use a VM or Docker container for running Cypress tests.

> ℹ️ **For CI/CD:** Your CI/CD pipeline (e.g., GitHub Actions) will use compatible environments, so tests will run successfully.

> 🚨 **Status:** This is a known Cypress issue. Monitor the [Cypress GitHub repository](https://github.com/cypress-io/cypress) for updates and fixes.

**Related Documentation**:
- See [`docs/cypress-known-issues.md`](cypress-known-issues.md) for detailed information
- See [`docs/cypress-migration-summary.md`](cypress-migration-summary.md) for migration notes

---

## Examples and Patterns

### Testing Form Submissions

```typescript
describe('Add Coupon Form', () => {
  it('should submit form with valid data', () => {
    cy.visit('/add-coupon');

    cy.get('[data-testid="retailer-input"]').type('Amazon');
    cy.get('[data-testid="value-input"]').type('50');
    cy.get('[data-testid="expiration-input"]').type('2024-12-31');
    cy.get('[data-testid="submit-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Amazon').should('be.visible');
    cy.contains('Coupon added successfully').should('be.visible');
  });
});
```

### Testing Conditional Rendering

```typescript
describe('Coupon List', () => {
  it('should show empty state when no coupons', () => {
    cy.login('user@example.com', 'password123');
    cy.visit('/dashboard');

    cy.get('[data-testid="empty-state"]').should('be.visible');
    cy.contains('No coupons found').should('be.visible');
  });

  it('should show coupons when available', () => {
    cy.login('user@example.com', 'password123');
    cy.visit('/dashboard');

    cy.get('[data-testid="coupon-item"]').should('have.length.greaterThan', 0);
  });
});
```

### Testing Error Handling

```typescript
describe('Form Validation', () => {
  it('should show validation errors for required fields', () => {
    cy.visit('/add-coupon');
    cy.get('[data-testid="submit-button"]').click();

    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.contains('Retailer is required').should('be.visible');
    cy.contains('Value is required').should('be.visible');
  });

  it('should show error for invalid email format', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.contains('Invalid email format').should('be.visible');
  });
});
```

### Testing Responsive Design

```typescript
describe('Responsive Design', () => {
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];

  viewports.forEach((viewport) => {
    it(`should display correctly on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/dashboard');

      cy.get('[data-testid="coupon-list"]').should('be.visible');
      cy.get('[data-testid="mobile-menu"]').should(
        viewport.width < 768 ? 'be.visible' : 'not.exist'
      );
    });
  });
});
```

### Testing Authentication and Authorization

```typescript
describe('Authentication', () => {
  it('should redirect to login when not authenticated', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should allow access to dashboard when authenticated', () => {
    cy.login('user@example.com', 'password123');
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
  });

  it('should prevent access to admin pages for regular users', () => {
    cy.login('user@example.com', 'password123');
    cy.visit('/admin/users');
    cy.contains('Access denied').should('be.visible');
  });
});
```

### Testing Network Requests

```typescript
describe('API Integration', () => {
  it('should load coupons from API', () => {
    cy.intercept('GET', '/api/coupons').as('getCoupons');
    cy.visit('/dashboard');

    cy.wait('@getCoupons');
    cy.get('@getCoupons').its('response.statusCode').should('eq', 200);
    cy.get('@getCoupons').its('response.body').should('have.length.greaterThan', 0);
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '/api/coupons', { statusCode: 500 }).as('getCoupons');
    cy.visit('/dashboard');

    cy.wait('@getCoupons');
    cy.contains('Failed to load coupons').should('be.visible');
  });
});
```

---

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Standards](./testing-standards.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

**Related Documentation:**
- [Testing Standards](./testing-standards.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

# Testing Standards for CouponManager

**Version:** 2.0.0  
**Status:** Authoritative Reference  
**Last Updated:** 2026-01-26

## Table of Contents

1. [Overview](#overview)
2. [Test-Driven Development Workflow](#test-driven-development-workflow)
3. [Test Types](#test-types)
4. [Testing Tools](#testing-tools)
5. [Test File Organization](#test-file-organization)
6. [Test Execution](#test-execution)
7. [Coverage Requirements](#coverage-requirements)
8. [Component Testing Guidelines](#component-testing-guidelines)
9. [E2E Testing Guidelines](#e2e-testing-guidelines)
10. [Page Object Model](#page-object-model)
11. [Custom Commands](#custom-commands)
12. [Common Testing Patterns](#common-testing-patterns)
13. [Test Maintenance](#test-maintenance)

---

## Overview

This document outlines the testing standards and practices for the CouponManager application. It serves as a guide for developers to ensure consistent, thorough testing across the codebase. The CouponManager project uses Cypress as the exclusive testing framework for all testing needs, including both E2E (End-to-End) and component testing.

## Test-Driven Development Workflow

CouponManager follows the TDD approach for all feature development:

1. **RED**: Write failing tests that define the expected behavior of the feature
2. **GREEN**: Implement the minimal code needed to make the tests pass
3. **REFACTOR**: Clean up the code while ensuring tests continue to pass

This approach ensures that all code is testable, requirements are clearly defined, and regressions are caught early.

## Test Types

### Component Tests

- Test individual React components in isolation
- Mock dependencies to focus on the component under test
- Fast and focused on specific component functionality
- Named with `.cy.tsx` or `.cy.jsx` suffix
- Located in `cypress/component/` directory

### E2E Tests

- Test the complete application flow from user perspective
- Simulate real user interactions in a browser
- Test integration between components and services
- Validate end-to-end workflows and user journeys
- Named with `.cy.ts` or `.cy.js` suffix
- Located in `cypress/e2e/` directory

## Testing Tools

- **Cypress**: Primary testing framework for both E2E and component testing
- **Cypress Component Testing**: For testing React components in isolation
- **Cypress E2E Testing**: For testing complete application flows
- **Page Object Model**: For organizing test code and improving maintainability
- **Custom Commands**: For reusable test actions and assertions

## Test File Organization

- **Component Tests**: `cypress/component/` directory
  - Mirror the structure of the source components
  - Named with `.cy.tsx` or `.cy.jsx` suffix
  - Example: `cypress/component/CouponList.cy.tsx`

- **E2E Tests**: `cypress/e2e/` directory
  - Organized by feature or user flow
  - Named with `.cy.ts` or `.cy.js` suffix
  - Example: `cypress/e2e/auth.cy.ts`, `cypress/e2e/coupon-management.cy.ts`

- **Page Objects**: `cypress/pages/` directory
  - Reusable page object classes for E2E tests
  - Named with `.ts` suffix
  - Example: `cypress/pages/LoginPage.ts`

- **Custom Commands**: `cypress/support/commands.ts`
  - Reusable custom commands for common test actions
  - Shared across all tests

## Test Execution

All tests must be run using pnpm from the project root:

```bash
# Run all E2E tests
pnpm cypress:run

# Open Cypress Test Runner for interactive testing
pnpm cypress:open

# Run all component tests
pnpm cypress:component:run

# Open Cypress Component Test Runner
pnpm cypress:component:open
```

### Running Specific Tests

```bash
# Run specific E2E test file
pnpm cypress:run --spec "cypress/e2e/auth.cy.ts"

# Run specific component test file
pnpm cypress:component:run --spec "cypress/component/CouponList.cy.tsx"

# Run tests matching a pattern
pnpm cypress:run --spec "cypress/e2e/*auth*.cy.ts"
```

### Running Tests in Different Browsers

```bash
# Run tests in Chrome (default)
pnpm cypress:run --browser chrome

# Run tests in Firefox
pnpm cypress:run --browser firefox

# Run tests in Edge
pnpm cypress:run --browser edge
```

## Coverage Requirements

The CouponManager project maintains a minimum of 80% code coverage:

- 80% statement coverage
- 80% branch coverage
- 80% function coverage
- 80% line coverage

> 🚨 **Note:** Cypress does not provide built-in code coverage. Coverage tracking is achieved through:
> - Component tests covering component logic
> - E2E tests covering critical user flows
> - Manual review of test coverage for new features

## Component Testing Guidelines

### Testing React Components

- Use Cypress Component Testing for isolated component testing
- Test both rendering and interaction behavior
- Use role-based or accessibility-based selectors when possible
- Test different component states and prop combinations
- Use appropriate assertions for expected outcomes

### Example Component Test Structure

```typescript
import { mount } from 'cypress/react18';
import CouponList from '../../components/CouponList';
import { ThemeProvider } from '@mui/material/styles';

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

- Test user interactions and state changes
- Test error states and edge cases
- Test responsive behavior for mobile-specific components
- Use `data-testid` attributes for stable element selection
- Avoid testing implementation details, focus on user-facing behavior

## E2E Testing Guidelines

### Testing User Flows

- Test complete user journeys from start to finish
- Simulate real user interactions
- Test authentication and authorization flows
- Test form submissions and validations
- Test navigation between pages

### Example E2E Test Structure

```typescript
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

describe('Authentication Flow', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    cy.visit('/');
  });

  it('should login successfully with valid credentials', () => {
    loginPage.login('user@example.com', 'password123');
    
    dashboardPage.shouldBeVisible();
    dashboardPage.shouldContainWelcomeMessage();
  });

  it('should show error with invalid credentials', () => {
    loginPage.login('invalid@example.com', 'wrongpassword');
    
    loginPage.shouldShowErrorMessage('Invalid credentials');
  });
});
```

### E2E Testing Best Practices

- Use Page Object Model for maintainable test code
- Test critical user paths and happy paths
- Test error handling and edge cases
- Use realistic test data
- Clean up test data after each test
- Use `cy.session()` for caching login sessions

## Page Object Model

Page Object Model (POM) is a design pattern that creates an object-oriented abstraction for web pages, making tests more maintainable and reusable.

### Page Object Structure

```typescript
// cypress/pages/LoginPage.ts
export class LoginPage {
  private elements = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]'
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
}
```

### Using Page Objects in Tests

```typescript
import { LoginPage } from '../pages/LoginPage';

describe('Login Tests', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    loginPage.visit();
  });

  it('should login successfully', () => {
    loginPage.login('user@example.com', 'password123');
    cy.url().should('include', '/dashboard');
  });
});
```

### Benefits of Page Object Model

- **Maintainability**: Changes to UI only require updates to page objects
- **Reusability**: Page objects can be reused across multiple tests
- **Readability**: Tests become more readable and self-documenting
- **Separation of Concerns**: Test logic is separated from page structure

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
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
});

Cypress.Commands.add('shouldHaveCouponCount', (count: number) => {
  cy.get('[data-testid="coupon-item"]').should('have.length', count);
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

  afterEach(() => {
    cy.logout();
  });
});
```

### Available Custom Commands

- `cy.login(email, password)` - Login with credentials
- `cy.logout()` - Logout from the application
- `cy.shouldHaveCouponCount(count)` - Assert coupon count
- Additional custom commands can be added as needed

## Common Testing Patterns

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
    });
  });
});
```

## Test Maintenance

- Update tests when requirements change
- Refactor tests when the implementation is refactored
- Remove obsolete tests when features are removed
- Keep tests focused and avoid testing implementation details
- Document complex test setups with clear comments
- Regularly review and optimize test performance
- Use `cy.session()` for caching expensive operations like login

---

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview)
- [Page Object Model Pattern](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)

---

**Related Documentation:**
- [Cypress Testing Guide](./cypress-testing-guide.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

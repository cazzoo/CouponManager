# Testing Standards for CouponManager

## Overview

This document outlines the testing standards and practices for the CouponManager application. It serves as a guide for developers to ensure consistent, thorough testing across the codebase. The CouponManager project follows Test-Driven Development (TDD) principles and maintains a minimum code coverage of 80%.

## Test-Driven Development Workflow

CouponManager follows the TDD approach for all feature development:

1. **RED**: Write failing tests that define the expected behavior of the feature
2. **GREEN**: Implement the minimal code needed to make the tests pass
3. **REFACTOR**: Clean up the code while ensuring tests continue to pass

This approach ensures that all code is testable, requirements are clearly defined, and regressions are caught early.

## Test Types

### Unit Tests
- Test individual components, services, and functions in isolation
- Mock dependencies to focus on the unit under test
- Should be fast and focus on specific functionality
- Named with `.test.js/jsx/ts/tsx` suffix

### Integration Tests
- Test interactions between multiple units
- Ensure components work together correctly
- May include testing with React context providers
- Should validate component composition behavior

### Snapshot Tests
- Capture and verify component rendering
- Used sparingly and for stable UI components
- Update snapshots only when UI changes are intentional

## Testing Tools

- **Vitest**: Test runner compatible with Vite build system
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions
- **jsdom**: For simulating browser environment
- **vi.mock()**: For mocking dependencies

## Test File Organization

- Test files should mirror the structure of the source code
- Place test files in the `src/test/` directory, maintaining the same structure as source files
- Tests for components in `src/test/components/`
- Tests for services in `src/test/services/`
- Mobile-specific tests should be named with `.mobile.test.jsx` suffix

## Test Execution

All tests must be run using pnpm from the project root:

```bash
# Run all tests
pnpm test

# Run tests in watch mode during development
pnpm test:watch

# Generate coverage reports
pnpm test:coverage
```

## Coverage Requirements

The CouponManager project maintains a minimum of 80% code coverage:

- 80% statement coverage
- 80% branch coverage
- 80% function coverage
- 80% line coverage

Coverage should be checked regularly using `pnpm test:coverage` and any new features should maintain or improve coverage percentages.

## Component Testing Guidelines

### Testing React Components

- Use the `TestWrapper` component to provide necessary context (ThemeProvider, LanguageProvider)
- Test both rendering and interaction behavior
- Use role-based or accessibility-based selectors when possible
- Test different component states and prop combinations
- Use appropriate assertions for expected outcomes

### Example Component Test Structure

```jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '../../components/Component';
import { ThemeProvider } from '@mui/material/styles';

// Mock dependencies as needed
vi.mock('../../services/SomeService', () => ({
  someMethod: vi.fn()
}));

// Wrapper component to provide context
const TestWrapper = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('Component', () => {
  // Setup before each test if needed
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Component />, { wrapper: TestWrapper });
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />, { wrapper: TestWrapper });
    
    // Find elements
    const button = screen.getByRole('button', { name: 'Click Me' });
    
    // Interact with elements
    await user.click(button);
    
    // Assert expected outcomes
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Service Testing Guidelines

- Focus on testing business logic and data transformation
- Mock external dependencies (localStorage, fetch, etc.)
- Test both success and error paths
- Verify expected side effects

### Mobile-Specific Testing

- Create separate mobile test files with `.mobile.test.jsx` suffix
- Test responsive behavior and mobile-specific features
- Simulate different viewport sizes
- Test touch interactions where applicable

## Common Testing Patterns

### Testing Form Submissions

```jsx
// Example of testing form submission
it('submits the form with correct data', async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();
  
  render(<Form onSubmit={mockSubmit} />, { wrapper: TestWrapper });
  
  // Fill out form fields
  await user.type(screen.getByLabelText('Name'), 'Test Name');
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  
  // Submit the form
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  // Verify form submission
  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'Test Name',
    email: 'test@example.com'
  });
});
```

### Testing Conditional Rendering

```jsx
// Example of testing conditional rendering
it('shows error message when validation fails', async () => {
  const user = userEvent.setup();
  
  render(<Form />, { wrapper: TestWrapper });
  
  // Submit without filling required fields
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  // Verify error message appears
  expect(screen.getByText('Name is required')).toBeInTheDocument();
});
```

## Test Maintenance

- Update tests when requirements change
- Refactor tests when the implementation is refactored
- Remove obsolete tests when features are removed
- Keep tests focused and avoid testing implementation details
- Document complex test setups with clear comments 
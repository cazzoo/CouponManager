# Test-Driven Development in Coupon Manager

This project follows Test-Driven Development (TDD) principles to ensure code quality and reliability. The testing framework uses Vitest with React Testing Library for component testing.

## Testing Structure

- `src/test/setup.js`: Global test setup and configuration
- `src/test/services/`: Tests for service layer functionality
- `src/test/components/`: Tests for React components

## Running Tests

To run all tests:

```bash
pnpm test
```

To run tests in watch mode (for development):

```bash
pnpm test:watch
```

To generate test coverage reports:

```bash
pnpm test:coverage
```

## TDD Workflow

When adding new features or fixing bugs, follow these steps:

1. **Write a failing test** that defines the expected behavior
2. **Implement the minimal code** needed to make the test pass
3. **Refactor** the code while ensuring tests continue to pass

## Component Testing Guidelines

- Use the `TestWrapper` component to provide necessary context (theme, date picker, etc.)
- Mock external dependencies and services
- Test both rendering and interactions
- Use `screen.getByRole()` or `screen.getByLabelText()` for more resilient selectors
- For elements that appear multiple times, use `getAllBy*` queries

## Service Testing Guidelines

- Create a fresh instance of services before each test
- Test edge cases and error conditions
- Verify that services maintain data integrity
- Test that services return copies of data, not references

## Adding New Tests

When adding new components or services:

1. Create a corresponding test file in the appropriate directory
2. Import the necessary testing utilities
3. Write tests for all key functionality
4. Ensure tests are isolated and don't depend on each other
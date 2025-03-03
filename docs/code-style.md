# Code Style Guidelines for CouponManager

## Overview

This document outlines the coding style and formatting standards for the CouponManager application. These guidelines ensure consistent, readable, and maintainable code across the entire codebase.

## General Guidelines

- Write code for readability and maintainability
- Follow DRY (Don't Repeat Yourself) principles
- Keep functions and components small and focused on a single responsibility
- Use descriptive, meaningful names for variables, functions, and components
- Limit line length to 100 characters where possible
- Use consistent indentation (2 spaces)
- Include blank lines to separate logical sections of code

## Naming Conventions

### Components
- Use PascalCase for component names: `CouponList.jsx`, `BarcodeScanner.jsx`
- Name files the same as the main component they export
- Use descriptive names that reflect the component's purpose

### Functions
- Use camelCase for function names: `handleSubmit`, `formatCouponData`
- Begin event handlers with "handle": `handleClick`, `handleInputChange`
- Use verb phrases that describe the action: `calculateTotal`, `filterCoupons`

### Variables
- Use camelCase for variable names: `couponList`, `isValid`
- Use meaningful names that describe the data: `activeCoupons`, `userName`
- Boolean variables should use "is", "has", or "should" prefixes: `isActive`, `hasExpired`

### Constants
- Use UPPER_SNAKE_CASE for constants: `MAX_COUPONS`, `DEFAULT_LOCALE`
- Define application-wide constants in a dedicated file

## React Component Structure

Components should be structured in a consistent manner:

```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 2. Component definition
function ComponentName({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState(initialState);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 5. Handler functions
  const handleAction = () => {
    // Handler logic
  };
  
  // 6. Helper functions
  const helperFunction = () => {
    // Helper logic
  };
  
  // 7. Rendering logic
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}

// 8. PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

// 9. Default props
ComponentName.defaultProps = {
  prop2: 0,
};

// 10. Export
export default ComponentName;
```

## JSX Guidelines

- Use self-closing tags for elements without children: `<Input />`
- Use proper spacing in JSX:
  ```jsx
  <Button
    variant="contained"
    onClick={handleClick}
    disabled={isDisabled}
  >
    Submit
  </Button>
  ```
- Limit one component per line when using multiple components
- Extract complex conditional rendering into variables or functions
- Use fragment shorthand `<>...</>` when possible instead of `<div>` containers

## State Management

- Keep state as local as possible
- Lift state up only when necessary
- Use context for global state that needs to be accessed by many components
- Prefer controlled components for form elements
- Use state update functions for state that depends on previous state:
  ```jsx
  // Correct
  setCount(prevCount => prevCount + 1);
  
  // Avoid
  setCount(count + 1);
  ```

## CSS and Styling

- Use Material-UI's styling system (emotion) for component styling
- Follow the naming convention for custom styles:
  ```jsx
  const useStyles = makeStyles((theme) => ({
    root: {
      margin: theme.spacing(2),
    },
    title: {
      fontWeight: 'bold',
    },
  }));
  ```
- Use theme variables for colors, spacing, and typography
- Avoid inline styles except for dynamic values that cannot be handled by the styling system
- Keep styles close to the components they affect

## Comments and Documentation

Follow the commenting standards specified in the JSX and TypeScript commenting rules:

- Include JSDoc comments for all components, functions, and hooks
- Document props, return values, and side effects
- Comment complex logic or non-obvious code
- Keep comments up-to-date when code changes
- See `.cursor/rules/2001-jsx-comments.mdc` for detailed JSX commenting standards

## Error Handling

- Use try/catch blocks for error-prone operations
- Provide meaningful error messages
- Handle errors at the appropriate level
- Implement graceful degradation
- Use error boundaries for React components where appropriate

## Performance Considerations

- Use React.memo for pure functional components that render often
- Use useCallback for event handlers passed to optimized child components
- Use useMemo for expensive calculations
- Avoid unnecessary re-renders
- Implement virtualization for long lists
- Use appropriate keys for list items (avoid using array indices as keys)

## Testing

- Write tests for all components and functions
- Follow the testing standards specified in `docs/testing-standards.md`
- Test both success and error cases
- Use meaningful assertions that verify behavior, not implementation details

## Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes when necessary
- Ensure keyboard navigation works for all interactive elements
- Maintain sufficient color contrast
- Provide text alternatives for non-text content

## Internationalization

- Use the LanguageContext for all user-facing text
- Extract all strings into language files
- Format dates, numbers, and currencies according to locale
- Consider text expansion in translated content
- Test with different locales

## Code Organization

```
src/
├── components/         # React components
├── services/           # Business logic and API interactions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── assets/             # Static assets
└── test/               # Test files
```

## Commit Message Guidelines

- Use the conventional commits format: `type(scope): message`
- Types include: feat, fix, docs, style, refactor, test, chore
- Keep messages concise but descriptive
- Reference issue numbers when applicable

## Example Commit Messages:

```
feat(coupons): add barcode scanning functionality
fix(ui): correct alignment of filter buttons on mobile
test(components): add tests for AddCouponForm
docs(readme): update installation instructions
```

## Linting and Formatting

- ESLint is used for code linting
- Prettier is used for code formatting
- Run linting before committing: `pnpm lint`
- Fix auto-fixable issues: `pnpm lint:fix`

## Pull Request Process

1. Ensure code passes all tests
2. Update documentation as necessary
3. Link to relevant issues
4. Request review from at least one team member
5. Address review comments
6. Merge only after approval 
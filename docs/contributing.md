# Contributing to CouponManager

Thank you for your interest in contributing to the CouponManager project! This document provides guidelines and instructions for contributors to ensure a smooth and effective collaboration process.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Code Style](#code-style)
- [Issue Tracking](#issue-tracking)
- [Communication](#communication)

## Code of Conduct

Contributors to the CouponManager project are expected to adhere to the following principles:

- Be respectful and inclusive of all participants
- Exercise empathy and kindness in all interactions
- Provide constructive feedback
- Focus on the best interests of the project and community
- Maintain confidentiality when appropriate

## Getting Started

1. **Fork the Repository**
   - Create a personal fork of the CouponManager repository on GitHub

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/CouponManager.git
   cd CouponManager
   ```

3. **Set Up Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/CouponManager.git
   ```

4. **Install Dependencies**
   ```bash
   pnpm install
   ```

5. **Run the Development Server**
   ```bash
   pnpm dev
   ```

6. **Verify Setup**
   - Access the application at http://localhost:5173
   - Run tests to ensure everything is set up correctly: `pnpm test`

## Development Workflow

The CouponManager project follows a Test-Driven Development (TDD) workflow:

1. **Understand the Task**
   - Review the issue or feature request
   - Clarify any questions before starting work

2. **Write Tests First**
   - Create tests that define the expected behavior
   - Ensure the tests initially fail

3. **Implement the Feature**
   - Write the minimum code necessary to make the tests pass
   - Follow the [Code Style Guidelines](./code-style.md)

4. **Refactor**
   - Clean up your code while ensuring tests continue to pass
   - Look for opportunities to improve performance or readability

5. **Verify**
   - Ensure all tests pass: `pnpm test`
   - Check code coverage: `pnpm test:coverage`
   - Verify linting: `pnpm lint`

6. **Submit Changes**
   - Create a pull request following the guidelines below

## Branching Strategy

- **main**: Production-ready code
- **development**: Integration branch for features
- **feature/feature-name**: Individual feature branches
- **bugfix/bug-description**: Bug fix branches
- **hotfix/issue-description**: Urgent fixes for production

Always create new branches from the `development` branch unless you're fixing a critical production issue.

```bash
# For new features
git checkout development
git pull upstream development
git checkout -b feature/your-feature-name

# For bug fixes
git checkout development
git pull upstream development
git checkout -b bugfix/brief-bug-description
```

## Commit Guidelines

- Follow conventional commits format: `type(scope): message`
- Keep commits focused on a single change
- Make frequent, smaller commits rather than large, infrequent ones
- Reference issue numbers in commit messages when applicable

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to build process, tools, etc.

**Examples:**
```
feat(coupons): add barcode scanning functionality
fix(ui): correct alignment of filter buttons on mobile
test(components): add tests for AddCouponForm
docs(readme): update installation instructions
```

## Pull Request Process

1. **Update Your Fork**
   ```bash
   git checkout development
   git pull upstream development
   git checkout your-branch
   git rebase development
   ```

2. **Push to Your Fork**
   ```bash
   git push origin your-branch
   ```

3. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New pull request"
   - Select your branch
   - Fill in the PR template with all required information

4. **PR Requirements**
   - Clear description of changes
   - Reference to related issues
   - Passing tests with adequate coverage
   - Code follows style guidelines
   - Updated documentation if necessary

5. **Review Process**
   - At least one approval is required
   - Address all review comments
   - Maintain a respectful and collaborative tone

6. **Merging**
   - PRs are merged after approval
   - Use squash merging for feature branches to maintain a clean history

## Testing Requirements

All code contributions must include appropriate tests:

- Maintain or increase overall test coverage (minimum 80%)
- Include unit tests for all new functionality
- Test both success paths and error conditions
- Use mock objects when appropriate
- Follow the [Testing Standards](./testing-standards.md)

## Documentation

Update documentation for any feature changes:

- Update README.md if necessary
- Document new features, APIs, or configuration options
- Update JSDoc comments for all public functions, components, and types
- Provide examples for new functionality
- Follow documentation standards in the [Code Style Guidelines](./code-style.md)

## Code Style

All code must adhere to the project's code style guidelines:

- Follow the [Code Style Guidelines](./code-style.md)
- Use consistent formatting
- Run linting before submitting: `pnpm lint`
- Fix auto-fixable issues: `pnpm lint:fix`

## Issue Tracking

- Check existing issues before creating new ones
- Use issue templates when available
- Provide clear steps to reproduce for bug reports
- Include screenshots or videos when relevant
- Tag issues appropriately (bug, enhancement, documentation, etc.)
- Link to related issues or pull requests

## Communication

- Use clear and respectful language
- Be specific about your concerns or questions
- Provide context for your suggestions
- Be open to alternative approaches
- Respond promptly to requests for clarification

## Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Material-UI Documentation](https://mui.com/material-ui/getting-started/overview/)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [Vitest Documentation](https://vitest.dev/guide/)

Thank you for contributing to CouponManager! 
# GitHub Actions Workflows

This document describes the GitHub Actions workflows set up for this project.

## Overview

We use GitHub Actions to automate several key processes in our development workflow:

1. **Build and Test**: Automatically builds the application and runs tests on every push and pull request
2. **Coverage Badge**: Generates and updates coverage badges based on test results
3. **Code Quality**: (Future enhancement) Runs linting and code quality checks

## Workflow Details

### Build and Test Workflow

**File**: `.github/workflows/build-and-test.yml`

This workflow runs on every push to the main branch and on all pull requests targeting the main branch. It:

1. Checks out the code
2. Sets up Node.js v18
3. Sets up pnpm
4. Caches dependencies for faster runs
5. Installs dependencies
6. Builds the project
7. Runs tests with coverage
8. Generates a detailed coverage report in the GitHub UI using davelosert/vitest-coverage-report-action
9. Uploads coverage reports to Codecov
10. For pull requests, generates a preview coverage badge

### Coverage Badge Workflow

**File**: `.github/workflows/coverage-badge.yml`

This workflow runs on every push to the main branch and can also be manually triggered. It:

1. Checks out the code
2. Sets up Node.js and pnpm
3. Installs dependencies
4. Runs tests with coverage
5. Creates a coverage badge using wjervis7/vitest-badge-action
6. Commits and pushes the updated badge to the repository

## Badge Generation

We use the [Vitest Badge Action](https://github.com/marketplace/actions/vitest-badge-action) by wjervis7 which:
- Generates coverage badges based on test results
- Supports different coverage metrics (statements, lines, functions, branches)
- Can be customized with different colors and text
- Integrates seamlessly with Vitest's coverage reports

The badge is updated automatically on each push to the main branch and displayed in the README.

## Badges

The project README includes the following badges:

- **Build Status**: Shows the current build status from the main branch
- **Coverage**: Shows the current test coverage percentage for statements

## Setting Up Your Repository

To use these workflows in your forked repository:

1. Enable GitHub Actions in your repository settings
2. Add the Codecov integration if you want to use Codecov for coverage reporting
3. Make sure your repository has the necessary secrets (e.g., `GITHUB_TOKEN` is automatically provided)

### Required Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- (Add any additional secrets if needed)

## Local Testing

Before pushing changes, you can run the same commands locally to ensure your changes will pass the CI checks:

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests with coverage
pnpm test:coverage
```

## Troubleshooting

If a workflow fails, check the following:

1. **Dependencies**: Make sure all required dependencies are properly listed in `package.json`
2. **Tests**: Ensure all tests pass locally before pushing
3. **Configuration**: Verify that workflow files have the correct syntax and configuration
4. **Badge Generation**: Check that vitest.config.js includes 'json-summary' reporter for badge generation

For more detailed error information, check the workflow run logs in the GitHub Actions tab of your repository. 
# Contribution Guidelines for CouponManager

**Version:** 2.0.0
**Status:** Authoritative Reference
**Last Updated:** 2026-01-26

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Feature Development Process](#feature-development-process)
4. [Bug Fix Process](#bug-fix-process)
5. [Documentation Standards](#documentation-standards)
6. [Testing Requirements](#testing-requirements)
7. [Code Quality Standards](#code-quality-standards)
8. [Pull Request Guidelines](#pull-request-guidelines)
9. [Issue Guidelines](#issue-guidelines)
10. [Release Process](#release-process)
11. [Community Guidelines](#community-guidelines)
12. [Contributor Recognition](#contributor-recognition)

---

## Getting Started

### Prerequisites

Before contributing to the CouponManager project, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **pnpm** package manager (recommended) or npm
  ```bash
  npm install -g pnpm
  ```
- **Git** ([Download](https://git-scm.com/))
- **Supabase account** (for production database and authentication)
  - Create a free account at [https://app.supabase.com](https://app.supabase.com)

### Initial Setup

#### 1. Fork the Repository

1. Navigate to the [CouponManager repository](https://github.com/cazzoo/CouponManager)
2. Click the "Fork" button in the top-right corner
3. This creates a copy of the repository under your GitHub account

#### 2. Clone Your Fork

```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/CouponManager.git
cd CouponManager
```

#### 3. Set Up Remote Repository

Configure your local repository to track the upstream repository:

```bash
# Add the upstream remote
git remote add upstream https://github.com/cazzoo/CouponManager.git

# Verify the remotes
git remote -v
```

You should see both `origin` (your fork) and `upstream` (the original repository).

#### 4. Install Dependencies

```bash
# Install all project dependencies
pnpm install
```

### Development Environment Configuration

#### Environment Variables

Create a `.env` file in the project root based on the provided `.env.example`:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Connection Details (for migrations)
SUPABASE_DB_HOST=aws-0-region-number.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-ref
SUPABASE_DB_PASSWORD=your_database_password
```

#### Supabase Setup

1. **Create a Supabase Project**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Enter project details and create

2. **Get Your Credentials**
   - Navigate to Project Settings > API
   - Copy the Project URL and anon/public API key
   - For migrations, you'll also need the service_role key

3. **Test Database Connection**

```bash
# Test your database connection
pnpm db:test
```

4. **Run Database Migrations**

```bash
# Run all pending migrations
pnpm migrate:up
```

5. **Add Mock Data (Optional)**

```bash
# Add sample users and coupons for testing
pnpm db:mock
```

### Running the Application

#### Development Mode (In-Memory Database)

For development without Supabase, use the in-memory database:

```bash
# Start development server with in-memory database
pnpm dev
```

This automatically:
- Uses an in-memory database
- Pre-populates mock data
- Enables MSW for API mocking

#### Development Mode (Supabase Database)

To test with the actual Supabase database:

```bash
# Start development server with Supabase connection
pnpm dev:supabase
```

#### Access the Application

Open your browser and navigate to:
- **Development Server:** `http://localhost:5173`

### Verifying Your Setup

Run the following commands to ensure everything is configured correctly:

```bash
# Run all E2E tests
pnpm cypress:run

# Run all component tests
pnpm cypress:component:run

# Open Cypress Test Runner for interactive testing
pnpm cypress:open

# Check code style
pnpm lint
```

---

## Development Workflow

### Branch Naming Conventions

All branch names should follow these conventions:

| Branch Type | Format | Example |
|-------------|--------|---------|
| Feature | `feature/feature-name` | `feature/barcode-scanner` |
| Bug Fix | `bugfix/description` | `bugfix/login-validation-error` |
| Hot Fix | `hotfix/urgent-fix` | `hotfix/security-patch` |
| Refactor | `refactor/component-name` | `refactor/coupon-service` |
| Documentation | `docs/topic` | `docs/api-documentation` |
| Test | `test/component-name` | `test/coupon-list-tests` |
| Chore | `chore/task-description` | `chore/update-dependencies` |

**Guidelines:**
- Use lowercase letters
- Separate words with hyphens
- Keep names descriptive but concise
- Use kebab-case (never camelCase or snake_case)

### Branch Strategy

The project follows a Git Flow-inspired branching strategy:

```
main (production)
  ↑
development (integration)
  ↑
feature/*, bugfix/*, hotfix/* (work branches)
```

#### Branch Rules

1. **main Branch**
   - Contains production-ready code
   - Only accepts merges from `development` or `hotfix/*` branches
   - Always deployable

2. **development Branch**
   - Integration branch for all features and bug fixes
   - Should always be stable
   - Base for new feature branches

3. **Feature Branches**
   - Created from `development`
   - Merge back to `development` via pull request
   - Delete after merging

4. **Hotfix Branches**
   - Created from `main` for urgent production fixes
   - Merge to both `main` and `development`
   - Delete after merging

#### Creating a New Branch

```bash
# Always start from the latest development branch
git checkout development
git pull upstream development

# Create and switch to your new branch
git checkout -b feature/your-feature-name
```

### Commit Message Conventions

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

#### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, missing semicolons, etc.) |
| `refactor` | Code changes that neither fix bugs nor add features |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Changes to build process, tools, or dependencies |
| `ci` | Changes to CI configuration |
| `revert` | Revert a previous commit |

#### Scopes

Common scopes include:
- `coupons` - Coupon-related features
- `auth` - Authentication and authorization
- `ui` - UI components and styling
- `i18n` - Internationalization
- `db` - Database and migrations
- `tests` - Testing infrastructure

#### Examples

```bash
# Feature
git commit -m "feat(coupons): add barcode scanning functionality"

# Bug fix
git commit -m "fix(auth): resolve login validation error for special characters"

# Documentation
git commit -m "docs(readme): update installation instructions for Node.js 18"

# Refactor
git commit -m "refactor(coupons): simplify coupon service interface"

# Test
git commit -m "test(components): add unit tests for CouponList component"

# Chore
git commit -m "chore(deps): upgrade React to version 18.3"
```

#### Commit Message Guidelines

- **Subject line:** 50 characters or less
- **Subject line:** Use imperative mood ("add" not "added" or "adds")
- **Subject line:** Do not end with a period
- **Body:** Wrap at 72 characters
- **Body:** Explain what and why, not how
- **Footer:** Reference issue numbers: `Closes #123` or `Refs #456`

**Good Example:**
```
feat(coupons): add barcode scanning functionality

Implement QR code and barcode scanning using react-qr-reader.
Users can now scan coupon codes directly from the camera,
reducing manual entry errors.

Closes #42
```

### Pull Request Process

#### Before Creating a Pull Request

1. **Update Your Branch**
   ```bash
   # Fetch latest changes from upstream
   git fetch upstream
   
   # Rebase your branch onto latest development
   git checkout development
   git pull upstream development
   git checkout your-branch
   git rebase development
   ```

2. **Run Tests**
   ```bash
   # Run all E2E tests
   pnpm cypress:run
   
   # Run all component tests
   pnpm cypress:component:run
   
   # Open Cypress for interactive testing
   pnpm cypress:open
   ```

3. **Run Linting**
   ```bash
   # Check code style
   pnpm lint
   ```

4. **Build the Application**
   ```bash
   # Ensure the build succeeds
   pnpm build
   ```

#### Creating a Pull Request

1. **Push Your Branch**
   ```bash
   git push origin your-branch
   ```

2. **Open a Pull Request**
   - Navigate to the upstream repository on GitHub
   - Click "New Pull Request"
   - Select your branch from the dropdown
   - Click "Create Pull Request"

3. **Fill in the PR Template**
   - Provide a clear, descriptive title
   - Complete all sections of the PR template
   - Link related issues
   - Add screenshots for UI changes

#### Pull Request Review Process

1. **Automated Checks**
   - CI/CD pipeline runs automatically
   - All tests must pass
   - Linting must pass

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Make requested changes or provide justification

3. **Approval and Merge**
   - PRs are typically merged using squash merge
   - Maintainers may request additional changes
   - Large PRs may be split into smaller, focused changes

#### Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows project coding standards (see [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1))
- [ ] All tests pass (E2E and component tests)
- [ ] Linting passes without errors
- [ ] Build completes successfully
- [ ] New features include tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete
- [ ] Related issues are referenced

### Code Review Process

#### For Reviewers

1. **Review Guidelines**
   - Be constructive and respectful
   - Focus on code quality, not style preferences
   - Provide specific, actionable feedback
   - Explain the "why" behind suggestions

2. **Review Areas**
   - **Correctness:** Does the code work as intended?
   - **Design:** Is the solution well-architected?
   - **Testing:** Are tests adequate and well-written?
   - **Documentation:** Is the code properly documented?
   - **Performance:** Are there performance concerns?
   - **Security:** Are there security vulnerabilities?

3. **Review Response Time**
   - Aim to review within 48 hours
   - If unavailable, notify the team

#### For Contributors

1. **Responding to Reviews**
   - Address all review comments
   - Ask clarifying questions when needed
   - Push updates to the same branch
   - Request re-review after changes

2. **Disagreements**
   - Discuss respectfully in the PR
   - Provide reasoning for your approach
   - Be open to alternative solutions
   - Escalate to maintainers if needed

### Issue Tracking

#### Creating Issues

1. **Search First**
   - Check existing issues to avoid duplicates
   - Use keywords to find related issues

2. **Use Templates**
   - Select the appropriate issue template
   - Fill in all required fields
   - Provide as much detail as possible

3. **Issue Labels**
   - `bug` - Bug reports
   - `enhancement` - Feature requests
   - `documentation` - Documentation issues
   - `good first issue` - Good for new contributors
   - `help wanted` - Community help needed
   - `priority: critical` - Urgent issues
   - `priority: high` - High priority
   - `priority: medium` - Medium priority
   - `priority: low` - Low priority

#### Managing Issues

- **Assignees:** Self-assign issues you're working on
- **Milestones:** Link issues to project milestones
- **Related Issues:** Link related issues using `#number`
- **Closing Issues:** Reference issues in commit messages to auto-close

---

## Feature Development Process

### Overview

This section guides you through creating a new feature from scratch in the CouponManager application.

### Step-by-Step Process

#### 1. Understand the Requirements

Before starting development:

1. **Read the Issue**
   - Understand the problem or feature request
   - Review any linked documentation or discussions
   - Ask clarifying questions in the issue

2. **Check Existing Architecture**
   - Review [`ARCHITECTURE.md`](ARCHITECTURE.md:1) for system design
   - Check [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1) for coding guidelines
   - Examine similar existing features

3. **Plan Your Approach**
   - Identify components that need changes
   - Identify services that need updates
   - Plan database schema changes if needed
   - Plan migration strategy

#### 2. Create a Feature Branch

```bash
# Ensure you're on the latest development branch
git checkout development
git pull upstream development

# Create your feature branch
git checkout -b feature/your-feature-name
```

#### 3. Write Tests First (TDD)

Following Test-Driven Development principles:

```typescript
// src/test/components/NewFeature.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewFeature from '../../components/NewFeature';

describe('NewFeature', () => {
  beforeEach(() => {
    // Setup mocks and test data
  });

  it('renders correctly', () => {
    render(<NewFeature />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    // Test user interactions
  });

  it('displays error state appropriately', () => {
    // Test error handling
  });
});
```

Run tests to see them fail (RED phase):

```bash
pnpm test
```

#### 4. Scaffolding New Components

Create the component file following the project structure:

```typescript
// src/components/NewFeature.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface NewFeatureProps {
  // Define props interface
  title: string;
  onAction?: () => void;
}

export const NewFeature: React.FC<NewFeatureProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {/* Component implementation */}
    </Box>
  );
};

export default NewFeature;
```

**Component Guidelines:**
- Use TypeScript for all components
- Define clear prop interfaces
- Follow naming conventions (PascalCase)
- Include JSDoc comments for complex logic
- Use Material-UI components for consistency

#### 5. Adding New Services

If your feature requires new business logic:

1. **Define the Service Interface**

```typescript
// src/services/NewFeatureService.ts
export interface INewFeatureService {
  performAction(data: FeatureData): Promise<Result>;
  getStatus(id: string): Promise<Status>;
}

export type FeatureData = {
  // Define data types
};

export type Result = {
  success: boolean;
  data?: any;
  error?: string;
};
```

2. **Implement the Service**

```typescript
// src/services/NewFeatureService.ts
export class NewFeatureService implements INewFeatureService {
  async performAction(data: FeatureData): Promise<Result> {
    try {
      // Implementation logic
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStatus(id: string): Promise<Status> {
    // Implementation logic
  }
}

// Export singleton instance
export default new NewFeatureService();
```

3. **Create a Factory (if needed)**

```typescript
// src/services/NewFeatureServiceFactory.ts
import { INewFeatureService } from './NewFeatureService';

export const getNewFeatureService = (): INewFeatureService => {
  if (shouldUseMemoryDb()) {
    const { default: MockService } = await import('../mocks/services/NewFeatureService.js');
    return MockService as unknown as INewFeatureService;
  }
  return NewFeatureService as unknown as INewFeatureService;
};
```

#### 6. Creating Database Migrations

If your feature requires database changes:

1. **Create a New Migration**

```bash
pnpm migrate:create add_new_feature_table "Add table for new feature"
```

This creates a new SQL file in [`migrations/sql/`](migrations/sql/).

2. **Write the Migration SQL**

```sql
-- migrations/sql/20250306120000-add_new_feature_table.sql
CREATE TABLE IF NOT EXISTS new_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE new_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own features"
  ON new_features FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own features"
  ON new_features FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own features"
  ON new_features FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own features"
  ON new_features FOR DELETE
  USING (auth.uid() = user_id);
```

3. **Test the Migration**

```bash
# Run the migration
pnpm migrate:up

# Check migration status
pnpm migrate:status
```

4. **Update the Service**

Update [`SupabaseNewFeatureService.ts`](src/services/SupabaseNewFeatureService.ts) to work with the new table:

```typescript
async performAction(data: FeatureData): Promise<Result> {
  const { data: result, error } = await supabase
    .from('new_features')
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: result };
}
```

#### 7. Adding Translations

For internationalization support:

1. **Add Translation Keys to All Language Files**

```json
// src/locales/en/common.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description of the new feature",
    "button": "Click Here",
    "success": "Operation successful",
    "error": "An error occurred"
  }
}
```

```json
// src/locales/fr/common.json
{
  "newFeature": {
    "title": "Nouvelle Fonctionnalité",
    "description": "Description de la nouvelle fonctionnalité",
    "button": "Cliquez Ici",
    "success": "Opération réussie",
    "error": "Une erreur s'est produite"
  }
}
```

Repeat for [`es/`](src/locales/es/) and [`de/`](src/locales/de/).

2. **Use Translations in Components**

```typescript
import { useTranslation } from 'react-i18next';

export const NewFeature: React.FC<NewFeatureProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h6">{t('newFeature.title')}</Typography>
      <Typography>{t('newFeature.description')}</Typography>
      <Button>{t('newFeature.button')}</Button>
    </Box>
  );
};
```

#### 8. Implement the Feature

Write the implementation code to make tests pass (GREEN phase):

```typescript
// src/components/NewFeature.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getNewFeatureService } from '../services/NewFeatureServiceFactory';
import type { FeatureData } from '../services/NewFeatureService';

interface NewFeatureProps {
  title: string;
  onAction?: () => void;
}

export const NewFeature: React.FC<NewFeatureProps> = ({ 
  title, 
  onAction 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    const service = getNewFeatureService();
    const result = await service.performAction({
      name: title,
      description: 'Sample data'
    });

    setLoading(false);

    if (result.success) {
      onAction?.();
    } else {
      setError(result.error || t('newFeature.error'));
    }
  };

  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      <Typography>{t('newFeature.description')}</Typography>
      
      {error && (
        <Typography color="error">{error}</Typography>
      )}
      
      <Button 
        onClick={handleClick} 
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} />}
      >
        {t('newFeature.button')}
      </Button>
    </Box>
  );
};

export default NewFeature;
```

#### 9. Refactor (REFACTOR Phase)

After tests pass, improve the code:

- Extract reusable logic into custom hooks
- Simplify complex functions
- Improve type definitions
- Optimize performance
- Enhance readability

#### 10. Integration

Integrate the new feature into the main application:

```typescript
// src/App.tsx
import NewFeature from './components/NewFeature';

// Add to component tree
{showNewFeature && <NewFeature title="My Feature" onAction={handleAction} />}
```

#### 11. Final Testing

```bash
# Run all tests
pnpm test

# Check coverage
pnpm test:coverage

# Run linting
pnpm lint

# Build the application
pnpm build
```

#### 12. Documentation

Update relevant documentation:

- Update [`README.md`](../README.md:1) if it's a user-facing feature
- Update [`ARCHITECTURE.md`](ARCHITECTURE.md:1) if architecture changed
- Add JSDoc comments to new code
- Update [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1) if new patterns introduced

#### 13. Create Pull Request

See the [Pull Request Process](#pull-request-process) section for detailed instructions.

---

## Bug Fix Process

### Reporting Bugs

#### Before Reporting

1. **Search Existing Issues**
   - Check if the bug has already been reported
   - Add a comment to existing issues if you have more information

2. **Verify the Bug**
   - Reproduce the bug consistently
   - Test in different browsers/environments
   - Check if it's a configuration issue

#### Creating a Bug Report

Use the bug report template:

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]

**Additional Context**
Add any other context about the problem here.

**Logs**
Error messages or console output:
```
Paste error logs here
```
```

### Reproducing Bugs

#### Systematic Reproduction

1. **Isolate the Issue**
   - Create a minimal reproduction case
   - Test in a clean environment
   - Disable browser extensions

2. **Gather Information**
   - Browser console errors
   - Network request failures
   - Application logs
   - Environment variables

3. **Document the Steps**
   - Write clear, numbered steps
   - Include exact input values
   - Note timing or state dependencies

#### Debugging Tools

```bash
# Run development server with verbose logging
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Check database connection
pnpm db:test
```

### Fixing Bugs

#### Bug Fix Workflow

1. **Create a Bug Fix Branch**
   ```bash
   git checkout development
   git pull upstream development
   git checkout -b bugfix/description-of-bug
   ```

2. **Write a Failing Test**
   ```typescript
   // src/test/components/Component.test.tsx
   it('should handle edge case that causes bug', () => {
     // Test that reproduces the bug
   });
   ```

3. **Fix the Bug**
   - Make minimal changes to fix the issue
   - Don't refactor unrelated code
   - Ensure the fix doesn't break other functionality

4. **Verify the Fix**
   ```bash
   # Run tests
   pnpm test
   
   # Test manually
   pnpm dev
   ```

5. **Update Tests**
   - Add regression tests for the bug
   - Update existing tests if behavior changed
   - Ensure coverage is maintained

### Testing Bug Fixes

#### Regression Testing

1. **Run Full Test Suite**
   ```bash
   pnpm test
   ```

2. **Check Coverage**
   ```bash
   pnpm test:coverage
   ```

3. **Manual Testing**
   - Test the specific bug scenario
   - Test related functionality
   - Test in different browsers
   - Test on mobile devices

#### Edge Case Testing

Test various scenarios:
- Empty/null values
- Boundary conditions
- Large datasets
- Concurrent operations
- Network failures

### Common Bug Patterns

#### Null/Undefined Errors

```typescript
// ❌ Bug: Potential null reference
const coupon = coupons.find(c => c.id === id);
console.log(coupon.retailer); // Error if coupon is undefined

// ✅ Fix: Add null check
const coupon = coupons.find(c => c.id === id);
if (coupon) {
  console.log(coupon.retailer);
}

// ✅ Alternative: Use optional chaining
const retailer = coupons.find(c => c.id === id)?.retailer;
```

#### Async/Await Errors

```typescript
// ❌ Bug: Not awaiting promise
const result = service.getData();
console.log(result.data); // Error: result is a Promise

// ✅ Fix: Await the promise
const result = await service.getData();
console.log(result.data);
```

#### Type Errors

```typescript
// ❌ Bug: Type mismatch
const value: string = 123; // TypeScript error

// ✅ Fix: Correct type
const value: number = 123;
// or convert
const value: string = String(123);
```

---

## Documentation Standards

### When to Update Documentation

Update documentation when:

1. **Adding New Features**
   - User-facing features need README updates
   - API changes need documentation
   - Configuration changes need env variable documentation

2. **Changing Existing Behavior**
   - Breaking changes must be documented
   - Deprecations must be noted
   - Migration guides must be provided

3. **Fixing Bugs**
   - If the bug fix changes user-facing behavior
   - If the fix requires configuration changes

4. **Code Changes**
   - Public API changes need JSDoc updates
   - Complex logic needs inline comments
   - New patterns need coding standards updates

### Documentation Format

#### Markdown Guidelines

- Use ATX-style headers (`#`, `##`, `###`)
- Include a table of contents for long documents
- Use code blocks with language specification
- Use proper link formatting: `[text](path/to/file)`
- Use lists for multiple items
- Use tables for structured data

#### Code Documentation (JSDoc/TSDoc)

Use JSDoc comments for:

- All public functions and methods
- Complex component props
- Custom hooks
- Type definitions
- Service interfaces

**Example:**

```typescript
/**
 * Retrieves all coupons from the database.
 * 
 * @returns A promise that resolves to an array of coupons.
 * @throws {Error} If the database query fails.
 * 
 * @example
 * ```typescript
 * const coupons = await couponService.getAllCoupons();
 * console.log(`Found ${coupons.length} coupons`);
 * ```
 */
getAllCoupons(): Promise<Coupon[]>;

/**
 * Props for the CouponList component.
 * 
 * @interface CouponListProps
 * @property {Coupon[]} coupons - Array of coupons to display
 * @property {Function} onCouponSelect - Callback when a coupon is selected
 * @property {boolean} isLoading - Whether the list is in loading state
 */
interface CouponListProps {
  coupons: Coupon[];
  onCouponSelect: (coupon: Coupon) => void;
  isLoading?: boolean;
}
```

#### Component Documentation

Document React components with:

1. **Purpose** - What the component does
2. **Props** - All props with types and descriptions
3. **Usage Example** - Code example showing usage
4. **Dependencies** - External dependencies or contexts

**Example:**

```typescript
/**
 * CouponList Component
 * 
 * Displays a list of coupons with filtering and sorting capabilities.
 * Supports both table view (desktop) and card view (mobile).
 * 
 * @component
 * @example
 * ```tsx
 * <CouponList 
 *   coupons={coupons}
 *   onCouponSelect={handleSelect}
 *   isLoading={false}
 * />
 * ```
 */
export const CouponList: React.FC<CouponListProps> = ({ 
  coupons, 
  onCouponSelect,
  isLoading = false 
}) => {
  // Implementation
};
```

### README Updates

When updating [`README.md`](../README.md:1):

1. **New Features**
   - Add to "Key Features" section
   - Include usage examples
   - Add screenshots if applicable

2. **Configuration Changes**
   - Update "Getting Started" section
   - Add new environment variables to `.env.example`
   - Update setup instructions

3. **Breaking Changes**
   - Add a "Migration Guide" section
   - Clearly document what changed
   - Provide upgrade instructions

### Code Documentation Standards

#### Inline Comments

Use inline comments for:

- Complex algorithms
- Non-obvious logic
- Workarounds for bugs
- Performance optimizations

```typescript
// Good: Explains why, not what
// Using setTimeout to debounce rapid API calls and prevent rate limiting
setTimeout(() => fetchData(), 300);

// Bad: Repeats what the code says
// Set timeout for 300ms
setTimeout(() => fetchData(), 300);
```

#### TODO Comments

Use TODO comments for temporary or planned work:

```typescript
// TODO: Replace with proper error handling when backend is ready
console.error('API error:', error);

// TODO(cazzoo): Implement caching for better performance (Issue #123)
const data = await fetchData();
```

#### Deprecated Code

Mark deprecated code with clear migration paths:

```typescript
/**
 * @deprecated Use `getCouponService()` instead. 
 * This will be removed in version 2.0.0.
 */
export function getLegacyService() {
  // Implementation
}
```

---

## Testing Requirements

### Unit Testing Requirements

#### What to Test

Unit tests should cover:

1. **Components**
   - Rendering with different props
   - User interactions
   - State changes
   - Conditional rendering
   - Error handling

2. **Services**
   - Business logic
   - Data transformation
   - Error handling
   - Edge cases

3. **Utilities**
   - Pure functions
   - Data formatting
   - Validation logic

4. **Hooks**
   - State management
   - Side effects
   - Cleanup functions

#### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '../../components/Component';

// Mock dependencies
vi.mock('../../services/SomeService', () => ({
  default: {
    someMethod: vi.fn()
  }
}));

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      render(<Component />);
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      render(<Component title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles button click', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Component onClick={handleClick} />);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data gracefully', () => {
      render(<Component data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles loading state', () => {
      render(<Component isLoading={true} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
```

### Component Testing Requirements

#### Testing React Components

Use React Testing Library for component tests:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import Component from '../Component';

// Wrapper for context providers
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('Component', () => {
  it('renders the component', () => {
    render(<Component />, { wrapper: TestWrapper });
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<Component onSubmit={handleSubmit} />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText('Name'), 'Test Name');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ name: 'Test Name' });
    });
  });
});
```

#### Mobile-Specific Testing

Create separate mobile test files:

```typescript
// src/test/components/CouponList.mobile.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CouponList from '../../components/CouponList';

// Set mobile viewport
beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375, // Mobile width
  });
});

describe('CouponList (Mobile)', () => {
  it('displays card view on mobile', () => {
    render(<CouponList coupons={coupons} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(coupons.length);
  });
});
```

### Integration Testing Requirements

#### Testing Component Integration

Test how components work together:

```typescript
describe('App Integration', () => {
  it('integrates CouponList with AddCouponForm', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add a new coupon
    await user.click(screen.getByRole('button', { name: 'Add Coupon' }));
    await user.type(screen.getByLabelText('Retailer'), 'Amazon');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    
    // Verify it appears in the list
    await waitFor(() => {
      expect(screen.getByText('Amazon')).toBeInTheDocument();
    });
  });
});
```

#### Testing Service Integration

Test service interactions:

```typescript
describe('Service Integration', () => {
  it('integrates AuthService with RoleService', async () => {
    const authResult = await authService.signIn('user@example.com', 'password');
    const role = await roleService.getUserRole(authResult.user.id);
    
    expect(role).toBe('user');
  });
});
```

### Coverage Requirements

#### Minimum Coverage Thresholds

The project maintains a minimum of **80% code coverage** across all metrics:

- **Statements:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%

These thresholds are configured in [`vitest.config.ts`](../vitest.config.ts:17).

#### Checking Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/index.html
```

#### Coverage Reports

Coverage reports are generated in the following formats:
- `text` - Console output
- `json` - Machine-readable format
- `html` - Interactive HTML report
- `lcov` - For CI/CD integration
- `json-summary` - Summary format

#### Improving Coverage

When coverage is below 80%:

1. **Identify Uncovered Code**
   ```bash
   pnpm test:coverage
   # Check the console output for uncovered files
   ```

2. **Add Tests for Uncovered Code**
   - Focus on critical paths first
   - Test edge cases
   - Test error conditions

3. **Review Coverage Report**
   ```bash
   # Open HTML report for detailed view
   open coverage/index.html
   ```

### Test Writing Guidelines

#### General Principles

1. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad: Tests implementation details
   it('calls useState with initial value', () => {
     // Tests internal React behavior
   });

   // ✅ Good: Tests user-facing behavior
   it('displays initial value correctly', () => {
     render(<Component initialValue="test" />);
     expect(screen.getByText('test')).toBeInTheDocument();
   });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ❌ Bad: Vague test name
   it('works correctly', () => {});

   // ✅ Good: Descriptive test name
   it('displays error message when form validation fails', () => {});
   ```

3. **Follow AAA Pattern**
   - **Arrange** - Set up test data and mocks
   - **Act** - Execute the code being tested
   - **Assert** - Verify the expected outcome

   ```typescript
   it('calculates total correctly', () => {
     // Arrange
     const prices = [10, 20, 30];
     
     // Act
     const total = calculateTotal(prices);
     
     // Assert
     expect(total).toBe(60);
   });
   ```

#### Mocking Guidelines

1. **Mock External Dependencies**
   ```typescript
   vi.mock('axios', () => ({
     default: {
       get: vi.fn(() => Promise.resolve({ data: {} }))
     }
   }));
   ```

2. **Mock Service Dependencies**
   ```typescript
   vi.mock('../../services/CouponService', () => ({
     default: {
       getAllCoupons: vi.fn(() => Promise.resolve([]))
     }
   }));
   ```

3. **Clear Mocks Between Tests**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

#### Async Testing

Handle asynchronous tests properly:

```typescript
it('loads data asynchronously', async () => {
  render(<Component />);
  
  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});

it('handles async errors', async () => {
  vi.spyOn(service, 'fetchData').mockRejectedValue(new Error('Network error'));
  
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## Code Quality Standards

### Linting Requirements

#### ESLint Configuration

The project uses ESLint for code quality checks. Configuration is in `.eslintrc.json` (if present) or in [`package.json`](../package.json:1).

#### Running Linting

```bash
# Check for linting errors
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

#### Linting Rules

Common ESLint rules enforced:

- No unused variables
- No console.log in production code
- Proper import ordering
- Consistent quote usage
- No implicit any types
- Proper React hooks usage

#### Pre-commit Hooks

Husky is configured to run linting before commits:

```bash
# Pre-commit hook runs:
pnpm lint
```

If linting fails, the commit will be blocked.

### TypeScript Strict Mode Compliance

#### Strict Mode Configuration

The project uses TypeScript strict mode (configured in [`tsconfig.json`](../tsconfig.json:10)):

```json
{
  "compilerOptions": {
    "strict": true,
    // ... other options
  }
}
```

#### Strict Mode Requirements

All code must comply with strict mode:

1. **No Implicit Any**
   ```typescript
   // ❌ Error: Implicit any
   function processData(data) {
     return data.map(item => item.value);
   }

   // ✅ Correct: Explicit types
   function processData(data: Array<{ value: string }>): string[] {
     return data.map(item => item.value);
   }
   ```

2. **Null Checks**
   ```typescript
   // ❌ Error: Object is possibly 'undefined'
   const coupon = coupons.find(c => c.id === id);
   console.log(coupon.retailer);

   // ✅ Correct: Null check
   const coupon = coupons.find(c => c.id === id);
   if (coupon) {
     console.log(coupon.retailer);
   }
   ```

3. **Explicit Return Types**
   ```typescript
   // ✅ Good: Explicit return type
   function formatDate(date: string): string {
     return new Date(date).toLocaleDateString();
   }
   ```

### Code Formatting (Prettier)

#### Prettier Configuration

Prettier is used for consistent code formatting. Configuration is in `.prettierrc` or in [`package.json`](../package.json:1).

#### Running Prettier

```bash
# Check formatting
pnpm format:check

# Format code
pnpm format
```

#### Formatting Rules

Common Prettier rules:

- 2 space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas where valid
- Print width: 100 characters

### Pre-commit Hooks

#### Husky Configuration

Husky manages Git hooks. Configuration is in `.husky/` directory.

#### Available Hooks

1. **Pre-commit Hook**
   ```bash
   # Runs before each commit
   pnpm lint
   ```

2. **Pre-push Hook** (if configured)
   ```bash
   # Runs before each push
   pnpm test
   ```

#### Bypassing Hooks

To bypass hooks (not recommended):

```bash
git commit --no-verify -m "message"
```

Only use this when absolutely necessary.

### Code Review Checklist

Before submitting code, ensure:

- [ ] Code follows [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1)
- [ ] TypeScript strict mode compliance
- [ ] No ESLint errors
- [ ] Code is formatted with Prettier
- [ ] Tests pass with ≥ 80% coverage
- [ ] JSDoc comments for public APIs
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No unused imports or variables
- [ ] Meaningful variable and function names

---

## Pull Request Guidelines

### Pull Request Description Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of the changes made in this pull request.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Code style update (formatting, etc.)

## Related Issue
Fixes #123
Related to #456

## Changes Made
- List of changes made
- Each change on a new line
- Be specific and concise

## Screenshots (if applicable)
Add screenshots for UI changes.

## Testing
### Manual Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile

### Automated Testing
- [ ] All tests pass
- [ ] Coverage maintained or improved
- [ ] New tests added for new functionality

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Notes
Any additional context or notes for reviewers.
```

### Pull Request Checklist

Before submitting a pull request:

#### Code Quality
- [ ] Code follows [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1)
- [ ] No ESLint errors or warnings
- [ ] Code is formatted with Prettier
- [ ] TypeScript strict mode compliance
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No unused imports or variables

#### Testing
- [ ] All tests pass
- [ ] Coverage ≥ 80% for all metrics
- [ ] Tests for new functionality
- [ ] Tests for edge cases
- [ ] Manual testing completed

#### Documentation
- [ ] JSDoc comments for public APIs
- [ ] README updated if user-facing changes
- [ ] Architecture docs updated if needed
- [ ] Migration guide for breaking changes

#### Branch Management
- [ ] Branch is up to date with development
- [ ] No merge conflicts
- [ ] Commits follow conventional commit format
- [ ] Commit history is clean

### Review Criteria

#### For Reviewers

Evaluate pull requests on:

1. **Code Quality**
   - Does the code follow project standards?
   - Is the code readable and maintainable?
   - Are there any obvious bugs or issues?

2. **Testing**
   - Are tests adequate?
   - Is coverage maintained?
   - Do tests cover edge cases?

3. **Documentation**
   - Is the code well-documented?
   - Are public APIs documented?
   - Is user-facing documentation updated?

4. **Architecture**
   - Does the change fit the architecture?
   - Are patterns consistent?
   - Is the design sound?

5. **Performance**
   - Are there performance concerns?
   - Are there unnecessary re-renders?
   - Is memory usage reasonable?

6. **Security**
   - Are there security vulnerabilities?
   - Is user input properly validated?
   - Are sensitive data protected?

### Approval Requirements

#### Required Approvals

- **At least one maintainer approval** is required for merging
- **Code owner approval** may be required for certain areas
- **All automated checks** must pass

#### Approval Types

- **Approve** - Ready to merge
- **Request Changes** - Needs changes before merging
- **Comment** - Suggestions or questions

#### Review Resolution

1. **Address Comments**
   - Make requested changes
   - Respond to questions
   - Push updates to the same branch

2. **Request Re-review**
   - Comment on the PR requesting re-review
   - Reviewer will re-evaluate

3. **Resolve Conflicts**
   - Rebase onto latest development
   - Resolve merge conflicts
   - Push updates

### Merge Process

#### Merge Methods

1. **Squash Merge** (Preferred)
   - Commits are squashed into a single commit
   - Clean commit history
   - Used for most PRs

2. **Merge Commit**
   - Preserves all commits
   - Shows merge in history
   - Used for significant features

3. **Rebase and Merge**
   - Linear history
   - Can cause conflicts
   - Rarely used

#### Merge Requirements

Before merging, ensure:

- [ ] All approvals received
- [ ] All checks pass
- [ ] No merge conflicts
- [ ] PR description is complete
- [ ] Documentation is updated
- [ ] Tests pass

#### Post-Merge Tasks

After merging:

1. **Delete Branch**
   ```bash
   # Delete local branch
   git branch -d feature-name
   
   # Delete remote branch
   git push origin --delete feature-name
   ```

2. **Update Local Development**
   ```bash
   git checkout development
   git pull upstream development
   ```

3. **Close Related Issues**
   - Issues should auto-close if referenced in commits
   - Manually close if needed

---

## Issue Guidelines

### Issue Templates

#### Bug Report Template

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]
- Node.js Version: [e.g., 18.17.0]

**Additional Context**
Add any other context about the problem here.

**Logs**
Error messages or console output:
```
Paste error logs here
```
```

#### Feature Request Template

```markdown
**Feature Description**
A clear and concise description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve? What is the use case?

**Proposed Solution**
Describe the solution you'd like in detail.

**Alternatives Considered**
Describe any alternative solutions or features you've considered.

**Additional Context**
Add any other context or screenshots about the feature request here.

**Priority**
- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low
```

#### Question/Discussion Template

```markdown
**Question**
What is your question or discussion topic?

**Context**
Provide context about your question:
- What are you trying to achieve?
- What have you tried so far?
- What resources have you consulted?

**Code Example**
If applicable, provide a code example:
```typescript
// Paste code here
```

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Node.js Version: [e.g., 18.17.0]
- Project Version: [e.g., 1.0.0]
```

### Issue Guidelines

#### Before Creating an Issue

1. **Search Existing Issues**
   - Check if the issue has already been reported
   - Use keywords to find related issues
   - Add to existing issues if applicable

2. **Check Documentation**
   - Review [`README.md`](../README.md:1)
   - Check [`ARCHITECTURE.md`](ARCHITECTURE.md:1)
   - Look at [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1)

3. **Reproduce the Issue**
   - Ensure the issue is reproducible
   - Test in different environments
   - Document steps to reproduce

#### Creating Good Issues

1. **Use Descriptive Titles**
   ```
   ❌ Bad: Bug in app
   ✅ Good: Login fails when email contains special characters
   ```

2. **Provide Context**
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?

3. **Include Environment Details**
   - OS and version
   - Browser and version
   - Node.js version
   - Project version

4. **Add Screenshots/Logs**
   - Screenshots for UI issues
   - Console logs for errors
   - Network logs for API issues

5. **Use Labels**
   - Select appropriate labels
   - Add priority labels if needed
   - Use `good first issue` for beginner-friendly tasks

### Issue Management

#### Assigning Issues

- **Self-assign** issues you're working on
- **Comment** on the issue to indicate you're working on it
- **Unassign** if you can no longer work on it

#### Issue Lifecycle

1. **Open** - New issue created
2. **In Progress** - Someone is working on it
3. **Ready for Review** - PR submitted
4. **Closed** - Issue resolved

#### Closing Issues

Issues are automatically closed when:
- A commit references the issue: `Closes #123`
- A merged PR references the issue

Manually close issues when:
- Issue is a duplicate
- Issue is no longer relevant
- Issue cannot be reproduced

---

## Release Process

### Versioning (Semantic Versioning)

The project follows [Semantic Versioning](https://semver.org/):

#### Version Format

```
MAJOR.MINOR.PATCH

Example: 1.2.3
```

- **MAJOR:** Incompatible API changes
- **MINOR:** Backwards-compatible functionality additions
- **PATCH:** Backwards-compatible bug fixes

#### Version Bump Examples

| From | To | Type | Description |
|------|-----|------|-------------|
| 1.2.3 | 1.2.4 | PATCH | Bug fix |
| 1.2.3 | 1.3.0 | MINOR | New feature |
| 1.2.3 | 2.0.0 | MAJOR | Breaking change |

#### Determining Version Type

- **PATCH** for:
  - Bug fixes
  - Documentation updates
  - Performance improvements (non-breaking)

- **MINOR** for:
  - New features
  - New functionality
  - Deprecations (but not removals)

- **MAJOR** for:
  - Breaking changes
  - Removed features
  - API changes

### Changelog Maintenance

#### Changelog Format

Maintain a `CHANGELOG.md` file with this format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature descriptions

### Changed
- Changed behavior descriptions

### Deprecated
- Deprecated features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

## [1.2.3] - 2025-01-15

### Added
- Barcode scanning functionality
- User management system

### Fixed
- Login validation error for special characters

## [1.2.2] - 2025-01-10

### Fixed
- Coupon list rendering issue on mobile
```

#### Updating Changelog

1. **During Development**
   - Add entries to `[Unreleased]` section
   - Categorize changes appropriately
   - Reference issue numbers

2. **Before Release**
   - Create new version section
   - Move unreleased entries to version section
   - Add release date

### Release Notes

#### Release Note Template

```markdown
## Release 1.2.3 - January 15, 2025

### 🎉 New Features
- **Barcode Scanning:** Scan QR codes and barcodes directly from the camera
- **User Management:** Admin panel for managing users and roles

### 🐛 Bug Fixes
- Fixed login validation error for emails with special characters
- Fixed coupon list rendering on mobile devices

### 📚 Documentation
- Updated README with new features
- Added API documentation

### 🔄 Changes
- Upgraded React to 18.3.0
- Improved performance of coupon list rendering

### ⚠️ Breaking Changes
None

### 🙏 Acknowledgments
Thanks to @contributor1 and @contributor2 for their contributions!
```

#### Publishing Release Notes

1. **Create GitHub Release**
   - Go to GitHub Releases
   - Click "Draft a new release"
   - Tag version: `v1.2.3`
   - Paste release notes
   - Publish release

2. **Announce Release**
   - Post in communication channels
   - Update project status
   - Notify stakeholders

### Deployment Process

#### Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Coverage ≥ 80%
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Database migrations tested
- [ ] Staging environment tested

#### Deployment Steps

1. **Version Bump**
   ```bash
   # Update version in package.json
   npm version patch  # or minor, or major
   ```

2. **Create Release Branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b release/v1.2.3
   ```

3. **Update Changelog**
   - Move entries from `[Unreleased]` to `[1.2.3]`
   - Add release date

4. **Commit Changes**
   ```bash
   git add CHANGELOG.md package.json
   git commit -m "chore(release): prepare release v1.2.3"
   ```

5. **Create Tag**
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   ```

6. **Push and Merge**
   ```bash
   git push origin release/v1.2.3
   git push origin v1.2.3
   ```

7. **Create GitHub Release**
   - Go to GitHub Releases
   - Create new release from tag
   - Add release notes
   - Publish

8. **Deploy to Production**
   - CI/CD pipeline automatically deploys
   - Verify deployment
   - Monitor for issues

#### Post-Deployment Tasks

After deploying:

1. **Monitor**
   - Check error logs
   - Monitor performance
   - Watch for user reports

2. **Verify**
   - Test key functionality
   - Check database migrations
   - Verify integrations

3. **Announce**
   - Notify users of new release
   - Share release notes
   - Update project status

4. **Cleanup**
   - Delete release branch
   - Archive old issues
   - Update documentation

### Rollback Process

If a deployment causes issues:

1. **Identify Issue**
   - Determine the scope of the problem
   - Assess impact on users
   - Document the issue

2. **Rollback Decision**
   - Can we hotfix it?
   - Should we rollback?
   - Who makes the decision?

3. **Execute Rollback**
   ```bash
   # Revert to previous version
   git checkout v1.2.2
   git checkout -b hotfix/rollback-v1.2.3
   ```

4. **Deploy Rollback**
   - Follow deployment process
   - Monitor closely
   - Communicate with users

5. **Post-Mortem**
   - Document what happened
   - Identify root cause
   - Prevent recurrence

---

## Community Guidelines

### Code of Conduct

#### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

#### Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable Behavior:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other unethical or unprofessional conduct

#### Reporting Issues

If you encounter or witness unacceptable behavior:

1. **Contact Maintainers**
   - Email: project maintainers
   - GitHub: Report via GitHub's contact form

2. **Include Details**
   - Your contact information
   - Names of individuals involved
   - Description of the incident
   - Any evidence (screenshots, logs, etc.)

3. **Confidentiality**
   - Reports will be kept confidential
   - We will investigate thoroughly
   - Appropriate action will be taken

#### Enforcement

Project maintainers have the right and responsibility to:
- Remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions
- Ban temporarily or permanently any contributor for behaviors they deem inappropriate, threatening, offensive, or harmful

### Communication Channels

#### Primary Channels

1. **GitHub Issues**
   - Bug reports
   - Feature requests
   - Questions
   - Discussions

2. **GitHub Discussions**
   - General questions
   - Ideas and proposals
   - Community discussions

3. **Pull Requests**
   - Code contributions
   - Code reviews
   - Technical discussions

#### Communication Guidelines

**Be Respectful:**
- Use polite language
- Assume good intentions
- Be patient with newcomers

**Be Clear:**
- Use descriptive titles
- Provide context
- Be specific

**Be Constructive:**
- Focus on solutions
- Provide actionable feedback
- Help others learn

**Be Responsive:**
- Respond to inquiries in a timely manner
- Keep discussions moving forward
- Update status regularly

### Getting Help

#### Before Asking for Help

1. **Search First**
   - Check existing issues
   - Search documentation
   - Look for similar problems

2. **Gather Information**
   - What are you trying to do?
   - What have you tried?
   - What error are you getting?
   - What is your environment?

3. **Prepare a Minimal Example**
   - Create a simple reproduction case
   - Include relevant code
   - Provide error messages

#### How to Ask for Help

**Good Question Example:**
```
I'm trying to implement a new feature that allows users to export their coupons to CSV. I've followed the service pattern and created a CouponExportService, but I'm getting an error when calling the export method.

Here's what I've tried:
1. Created the service interface
2. Implemented the service
3. Added it to the factory

Error message:
"TypeError: Cannot read property 'map' of undefined"

Code:
```typescript
export const exportToCSV = (coupons: Coupon[]): string => {
  return coupons.map(c => `${c.retailer},${c.value}`).join('\n');
};
```

Environment:
- Node.js 18.17.0
- Project version 1.2.3
```

**Poor Question Example:**
```
My code doesn't work. Help!
```

#### Resources

- [Project Documentation](../README.md:1)
- [Architecture Documentation](ARCHITECTURE.md:1)
- [Coding Standards](CODING_STANDARDS.md:1)
- [Testing Standards](testing-standards.md:1)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## Contributor Recognition

### Credit Attribution

#### How Credit is Given

1. **Git History**
   - All commits are attributed to contributors
   - Commit messages include contributor names
   - Git blame shows contribution history

2. **Pull Requests**
   - PR authors are credited in merge commits
   - PR descriptions acknowledge contributors
   - Review comments show participation

3. **Release Notes**
   - Contributors are thanked in release notes
   - Significant contributions are highlighted
   - First-time contributors are welcomed

4. **Contributor List**
   - Maintained in [`README.md`](../README.md:1) or separate file
   - Updated regularly
   - Includes all contributors

#### Contributor License Agreement (CLA)

By contributing to this project, you agree that:

1. Your contributions are your own original work
2. You have the right to submit the contributions
3. The contributions are licensed under the project's MIT license
4. You grant the project maintainers permission to use your contributions

### Contributor List Maintenance

#### Adding Contributors

Contributors are automatically added when:
- Their first PR is merged
- They make significant contributions
- They are recognized by maintainers

#### Contributor Recognition Levels

| Level | Criteria | Recognition |
|-------|----------|-------------|
| Contributor | 1+ merged PR | Listed in contributors |
| Active Contributor | 5+ merged PRs | Highlighted in releases |
| Core Contributor | 20+ merged PRs | Invited to maintainers |
| Maintainer | Appointed by team | Full project access |

#### Maintaining the List

1. **Automatic Updates**
   - GitHub automatically tracks contributors
   - Use GitHub's contributor API for accurate counts

2. **Manual Updates**
   - Update contributor list in README
   - Add to release notes
   - Recognize special contributions

3. **Regular Review**
   - Review contributor list monthly
   - Update recognition levels
   - Remove inactive contributors if needed

### Acknowledging Contributions

#### In-Code Attribution

```typescript
/**
 * CouponService
 * 
 * Manages coupon CRUD operations.
 * 
 * @author Original Author
 * @contributor Contributor1 - Added barcode scanning
 * @contributor Contributor2 - Fixed export functionality
 */
export class CouponService implements ICouponService {
  // Implementation
}
```

#### In Documentation

```markdown
## Contributors

Thank you to all the contributors who have helped make CouponManager better:

- @original-author - Project creator and lead maintainer
- @contributor1 - Added barcode scanning feature
- @contributor2 - Fixed mobile responsiveness issues
- @contributor3 - Improved test coverage
```

#### In Release Notes

```markdown
## Release 1.2.3

### 🙏 Acknowledgments

Special thanks to:
- @contributor1 for implementing the barcode scanning feature
- @contributor2 for fixing the mobile rendering issues
- @contributor3 for improving test coverage to 85%

Welcome to our new contributors:
- @new-contributor1 - First contribution!
```

### Celebrating Milestones

#### Contributor Milestones

Celebrate when contributors reach milestones:

- **First Contribution:** Welcome message
- **5 Contributions:** Thank you message
- **10 Contributions:** Highlight in community
- **20 Contributions:** Recognition as core contributor
- **50 Contributions:** Special recognition

#### Project Milestones

Celebrate project achievements:

- **100 Contributors:** Community announcement
- **1000 Stars:** Blog post and announcement
- **Major Release:** Celebration post
- **Anniversary:** Year-in-review post

---

## Additional Resources

### Project Documentation

- [README](../README.md:1) - Project overview and quick start
- [Architecture](ARCHITECTURE.md:1) - System architecture and design
- [Coding Standards](CODING_STANDARDS.md:1) - Code style and conventions
- [Testing Standards](testing-standards.md:1) - Testing guidelines and requirements
- [Supabase Setup](supabase-setup.md:1) - Database and authentication setup
- [Migration System](migration-system.md:1) - Database migration guide

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [i18next Documentation](https://www.i18next.com/)

### Tools and Utilities

- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [ESLint](https://eslint.org/) - Find and fix problems in JavaScript/TypeScript
- [Prettier](https://prettier.io/) - Code formatter
- [Husky](https://typicode.github.io/husky/) - Git hooks

---

## Quick Reference

### Common Commands

```bash
# Development
pnpm dev              # Start dev server (in-memory DB)
pnpm dev:supabase     # Start dev server (Supabase DB)

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Building
pnpm build            # Build for production
pnpm preview          # Preview production build

# Database
pnpm db:test          # Test database connection
pnpm migrate:up       # Run migrations
pnpm migrate:list     # List migrations
pnpm migrate:status   # Check migration status
pnpm migrate:create   # Create new migration

# Code Quality
pnpm lint             # Check code style
pnpm lint:fix         # Fix code style issues
pnpm format           # Format code
```

### File Structure

```
CouponManager/
├── docs/                    # Documentation
│   ├── CONTRIBUTING.md      # This file
│   ├── ARCHITECTURE.md      # Architecture documentation
│   ├── CODING_STANDARDS.md  # Coding standards
│   └── testing-standards.md # Testing standards
├── src/                     # Source code
│   ├── components/          # React components
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   ├── locales/             # Translations
│   ├── mocks/               # Mock data/services
│   └── test/                # Test files
├── migrations/              # Database migrations
│   └── sql/                 # SQL migration files
├── scripts/                 # Utility scripts
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
├── vitest.config.ts        # Test configuration
└── README.md               # Project overview
```

### Key Files

| File | Purpose |
|------|---------|
| [`package.json`](../package.json:1) | Dependencies and scripts |
| [`tsconfig.json`](../tsconfig.json:1) | TypeScript configuration |
| [`vitest.config.ts`](../vitest.config.ts:1) | Test configuration |
| [`.env.example`](../.env.example:1) | Environment variables template |
| [`README.md`](../README.md:1) | Project documentation |

---

Thank you for contributing to CouponManager! Your contributions help make this project better for everyone.

If you have any questions or need help, please don't hesitate to reach out through our communication channels.

Happy coding! 🚀

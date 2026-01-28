# CouponManager Documentation

Welcome to the CouponManager documentation. This guide provides a comprehensive overview of all available documentation and helps you navigate to the information you need.

## Quick Links

- **[Architecture Overview](ARCHITECTURE.md)** - System architecture, design patterns, and component structure
- **[Coding Standards](CODING_STANDARDS.md)** - Code style, TypeScript conventions, and best practices
- **[Contribution Guidelines](CONTRIBUTING.md)** - How to contribute to the project

## Documentation Structure

### Core Documentation (Authoritative)

These documents are the primary references for the project and should be consulted first:

| Document | Purpose | Audience |
|----------|---------|-----------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md:1) | System architecture, design patterns, layer structure, data flows | All developers |
| [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1) | TypeScript standards, naming conventions, code organization | All developers |
| [`CONTRIBUTING.md`](CONTRIBUTING.md:1) | Development workflow, PR process, testing requirements | Contributors |

### Feature Documentation

Detailed documentation for specific features and systems:

| Document | Description |
|----------|-------------|
| [`data-models.md`](data-models.md:1) | Data models, interfaces, and schemas used throughout the application |
| [`permission-matrix.md`](permission-matrix.md:1) | Role-based access control (RBAC) and permissions system |
| [`user-management.md`](user-management.md:1) | User management functionality for administrators |
| [`i18n-system.md`](i18n-system.md:1) | Internationalization system and translation management |
| [`migration-system.md`](migration-system.md:1) | SQL migration system for database schema changes |
| [`testing-standards.md`](testing-standards.md:1) | Testing practices, TDD workflow, and coverage requirements |
| [`cypress-testing-guide.md`](cypress-testing-guide.md:1) | Comprehensive guide for Cypress E2E and component testing |

### Infrastructure Documentation

Documentation for infrastructure and deployment:

| Document | Description |
|----------|-------------|
| [`supabase-setup.md`](supabase-setup.md:1) | Supabase database configuration and connection setup |
| [`supabase-rls.md`](supabase-rls.md:1) | Row-Level Security (RLS) policies and implementation |
| [`local-memory-db.md`](local-memory-db.md:1) | In-memory database for development environments |
| [`github-actions.md`](github-actions.md:1) | CI/CD workflows and automated testing setup |

### Planning and Design

Documents for project planning and future work:

| Document | Description |
|----------|-------------|
| [`prd.md`](prd.md:1) | Product Requirements Document with feature specifications |
| [`roadmap.md`](roadmap.md:1) | Development roadmap and planned features |
| [`diagrams.md`](diagrams.md:1) | Guide for creating and managing documentation diagrams |
| [`casl-implementation.md`](casl-implementation.md:1) | Strategy for implementing @casl/ability permission system (Draft) |
| [`typescript-migration.md`](typescript-migration.md:1) | TypeScript migration plan and progress |

### Legacy Documentation

| Document | Description | Status |
|----------|-------------|---------|
| [`code-style.md`](code-style.md:1) | Legacy code style guidelines (superseded by CODING_STANDARDS.md) | Legacy |
| [`architecture.md`](architecture.md:1) | Duplicate of ARCHITECTURE.md | Duplicate |

### Project Status

| Document | Description |
|----------|-------------|
| [`project-status/README.md`](project-status/README.md:1) | Project status overview |
| [`project-status/status.md`](project-status/status.md:1) | Current project status |
| [`project-status/issues.md`](project-status/issues.md:1) | Known issues and bugs |
| [`project-status/todo.md`](project-status/todo.md:1) | Outstanding tasks and TODOs |

## Documentation by Topic

### Getting Started
1. Read [`CONTRIBUTING.md`](CONTRIBUTING.md:1) for setup instructions
2. Review [`ARCHITECTURE.md`](ARCHITECTURE.md:1) for system overview
3. Follow [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1) for coding guidelines

### Architecture & Design
- System architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md:1)
- Data models: [`data-models.md`](data-models.md:1)
- Design patterns: [`ARCHITECTURE.md`](ARCHITECTURE.md:1#design-patterns)

### Development
- Coding standards: [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1)
- Testing standards: [`testing-standards.md`](testing-standards.md:1)
- Cypress testing guide: [`cypress-testing-guide.md`](cypress-testing-guide.md:1)
- Contribution workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md:1)
- Development database: [`local-memory-db.md`](local-memory-db.md:1)

### Database & Storage
- Supabase setup: [`supabase-setup.md`](supabase-setup.md:1)
- Migration system: [`migration-system.md`](migration-system.md:1)
- RLS policies: [`supabase-rls.md`](supabase-rls.md:1)
- Data models: [`data-models.md`](data-models.md:1)

### Security & Permissions
- Permission matrix: [`permission-matrix.md`](permission-matrix.md:1)
- User management: [`user-management.md`](user-management.md:1)
- RLS policies: [`supabase-rls.md`](supabase-rls.md:1)
- CASL strategy: [`casl-implementation.md`](casl-implementation.md:1)

### Internationalization
- i18n system: [`i18n-system.md`](i18n-system.md:1)
- Translation management: [`i18n-system.md`](i18n-system.md:1#translation-namespaces)

### Infrastructure & DevOps
- GitHub Actions: [`github-actions.md`](github-actions.md:1)
- CI/CD workflows: [`github-actions.md`](github-actions.md:1)

## Document Status

| Document | Status | Notes |
|----------|--------|-------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md:1) | ✅ Authoritative | Primary architecture reference |
| [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1) | ✅ Authoritative | Primary coding standards reference |
| [`CONTRIBUTING.md`](CONTRIBUTING.md:1) | ✅ Authoritative | Primary contribution reference |
| [`data-models.md`](data-models.md:1) | ✅ Current | Updated and accurate |
| [`permission-matrix.md`](permission-matrix.md:1) | ✅ Current | Updated and accurate |
| [`user-management.md`](user-management.md:1) | ✅ Current | Updated and accurate |
| [`i18n-system.md`](i18n-system.md:1) | ✅ Current | Updated and accurate |
| [`migration-system.md`](migration-system.md:1) | ✅ Current | Updated and accurate |
| [`testing-standards.md`](testing-standards.md:1) | ✅ Current | Updated and accurate |
| [`cypress-testing-guide.md`](cypress-testing-guide.md:1) | ✅ Current | Comprehensive Cypress testing guide |
| [`supabase-setup.md`](supabase-setup.md:1) | ✅ Current | Updated and accurate |
| [`supabase-rls.md`](supabase-rls.md:1) | ✅ Current | Updated and accurate |
| [`local-memory-db.md`](local-memory-db.md:1) | ✅ Current | Updated and accurate |
| [`github-actions.md`](github-actions.md:1) | ✅ Current | Updated and accurate |
| [`prd.md`](prd.md:1) | ✅ Approved | Product requirements document |
| [`roadmap.md`](roadmap.md:1) | ✅ Active | Development roadmap |
| [`diagrams.md`](diagrams.md:1) | ✅ Current | Diagram generation guide |
| [`casl-implementation.md`](casl-implementation.md:1) | ⚠️ Draft | Future implementation plan |
| [`typescript-migration.md`](typescript-migration.md:1) | ℹ️ Informational | Migration plan |
| [`code-style.md`](code-style.md:1) | ⚠️ Legacy | Superseded by CODING_STANDARDS.md |
| [`architecture.md`](architecture.md:1) | ⚠️ Duplicate | Duplicate of ARCHITECTURE.md |

## Key Concepts

### User Roles
The application uses three user roles:
- **user** - Standard user with coupon management permissions
- **manager** - Administrative user with full system access
- **demo** - Limited access user for demonstration purposes

See [`permission-matrix.md`](permission-matrix.md:1) for detailed permission mappings.

### Storage Modes
The application supports two storage modes:
- **In-Memory Database** - Development mode with mock data (see [`local-memory-db.md`](local-memory-db.md:1))
- **Supabase PostgreSQL** - Production mode with RLS (see [`supabase-setup.md`](supabase-setup.md:1))

### Technology Stack
- **Frontend**: React 18 + TypeScript + Material-UI v5
- **Build Tool**: Vite
- **Testing**: Cypress (E2E + Component Testing)
- **Backend**: Supabase (PostgreSQL + Authentication + RLS)
- **i18n**: i18next + react-i18next
- **Package Manager**: pnpm

## Documentation Maintenance

When updating documentation:

1. **Update authoritative documents first** - Start with [`ARCHITECTURE.md`](ARCHITECTURE.md:1), [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1), or [`CONTRIBUTING.md`](CONTRIBUTING.md:1)
2. **Update feature documents** - Update related feature documentation as needed
3. **Regenerate diagrams** - Run `pnpm generate-diagrams` after updating any diagrams
4. **Update this index** - Keep this README.md synchronized with documentation changes
5. **Cross-reference** - Ensure new documents are linked from relevant existing documents

## Getting Help

- For architecture questions: See [`ARCHITECTURE.md`](ARCHITECTURE.md:1)
- For coding questions: See [`CODING_STANDARDS.md`](CODING_STANDARDS.md:1)
- For contribution questions: See [`CONTRIBUTING.md`](CONTRIBUTING.md:1)
- For specific features: Refer to the relevant feature documentation above

---

**Last Updated:** 2026-01-26  
**Documentation Version:** 1.1.0

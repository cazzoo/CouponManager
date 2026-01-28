# AI Agent Configuration Directory

This directory contains configuration files for AI coding agents (Cursor, Kilo Code, OpenCode, etc.).

## Directory Structure

```
.cursor/
├── AGENT_INSTRUCTIONS.md          # Comprehensive agent instructions (Cursor-specific)
├── PROJECT_CONTEXT.md             # Project overview and context (Cursor-specific)
├── QUICK_REFERENCE.md             # Quick reference guide (Cursor-specific)
├── WORKFLOW_CONSTRAINTS.md       # Development/production constraints (Cursor-specific)
├── DEPENDENCY_MAPPING.md         # Full dependency documentation (Cursor-specific)
├── rules/                        # Rule-based configuration (mdc format)
│   ├── 000-cursor-rules.mdc     # Cursor rules format specification
│   ├── 001-development-standards.mdc  # Development standards (generic)
│   ├── 002-security-permissions.mdc    # Security and permissions (generic)
│   ├── 010-terminal-commands.mdc      # Cross-platform commands (generic)
│   ├── 4001-development-workflow.mdc  # TDD and workflow (generic)
│   └── ... (other rule files)
└── README.md                     # This file
```

## Using with Different AI Coding Agents

### Cursor IDE

Cursor automatically reads all `.mdc` files in the `rules/` directory and applies them based on glob patterns.

**How it works:**
- Cursor loads rules on project load
- Rules are applied based on file patterns (glob)
- Rules with `alwaysApply: true` are always active
- Cursor-specific documentation files are used for context

### Kilo Code

Kilo Code can use the generic rule files (`.mdc`) and the root-level `AGENTS.md` file.

**Recommended usage:**
1. Read `AGENTS.md` for comprehensive project understanding
2. Use `.cursor/rules/*.mdc` files for specific coding standards
3. Focus on rules without `alwaysApply: false` or Cursor-specific content

### OpenCode

OpenCode can use both the root-level `AGENTS.md` and the generic rule files.

**Recommended usage:**
1. Use `AGENTS.md` as the primary configuration file
2. Reference `ARCHITECTURE.md` for system design understanding
3. Use `.cursor/rules/*.mdc` files for specific patterns and standards

### Other AI Agents

For agents that don't support the `.mdc` format:
1. Use `AGENTS.md` as the main configuration
2. Use `ARCHITECTURE.md` for architecture reference
3. Refer to the content in `.cursor/rules/` files if needed

## Configuration Files Summary

### Root-Level Files (All Agents)

| File | Purpose | Size | Priority |
|------|---------|-------|----------|
| `AGENTS.md` | Comprehensive agent configuration | ~20KB | **HIGH** |
| `ARCHITECTURE.md` | System architecture documentation | ~25KB | **HIGH** |

### Cursor-Specific Files (Cursor IDE Only)

| File | Purpose | Size |
|------|---------|-------|
| `AGENT_INSTRUCTIONS.md` | Detailed agent instructions | ~20KB |
| `PROJECT_CONTEXT.md` | Project overview and tech stack | ~12KB |
| `QUICK_REFERENCE.md` | Quick commands and patterns | ~18KB |
| `WORKFLOW_CONSTRAINTS.md` | Development/production constraints | ~22KB |
| `DEPENDENCY_MAPPING.md` | Full dependency documentation | ~13KB |

### Rule Files (Generic + Cursor)

| File | Purpose | Generic? | All Agents? |
|------|---------|-----------|--------------|
| `000-cursor-rules.mdc` | Cursor rules format specification | No | No |
| `001-development-standards.mdc` | Development standards | **Yes** | **Yes** |
| `002-security-permissions.mdc` | Security and permissions | **Yes** | **Yes** |
| `010-terminal-commands.mdc` | Cross-platform commands | **Yes** | **Yes** |
| `4001-development-workflow.mdc` | TDD and workflow | **Yes** | **Yes** |
| `5001-package-manager.mdc` | Package manager standards | Yes | Yes |
| `1001-typescript-comments.mdc` | TypeScript comment rules | Yes | Yes |
| `2001-jsx-comments.mdc` | JSX comment rules | Yes | Yes |
| `3001-testing-standards.mdc` | Testing standards | Yes | Yes |
| `400-md-docs.mdc` | Markdown documentation rules | Yes | Yes |
| `901-prd-template.mdc` | PRD template | No | No |
| `902-arch-template.mdc` | Architecture template | No | No |
| `903-project-status.mdc` | Project status template | No | No |

## Quick Start for AI Agents

### Essential Commands
```bash
# Development (in-memory DB with mock data)
pnpm dev

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# Build
pnpm build

# Database operations
pnpm db:test
pnpm migrate:up
pnpm db:mock
```

### Critical Constraints
- **Strict TypeScript mode** - All code must have explicit types
- **80% test coverage** - Enforced via CI/CD
- **Factory pattern** - Always access services via factories
- **pnpm only** - Use pnpm for all package operations
- **TDD** - Write tests first, then implement
- **Run from root** - All commands from project root

### Key Files to Understand
- `AGENTS.md` - Complete agent configuration
- `ARCHITECTURE.md` - System architecture
- `src/types/index.ts` - Type definitions
- `package.json` - Dependencies and scripts

## File Modification Guidelines

### Files AI Agents CAN Modify
- `src/components/*.tsx` - React components
- `src/services/*.ts` - Service implementations
- `src/types/index.ts` - Type definitions
- `src/locales/**/*.json` - Translation files
- `src/test/**/*.test.tsx` - Test files
- `docs/*.md` - Documentation
- `.cursor/rules/*.mdc` - Agent rules (if learning new patterns)
- `AGENTS.md` - Agent configuration (if updating based on project changes)

### Files AI Agents SHOULD NOT Modify
- `.gitignore` - Version control configuration
- `package.json` - Dependency management
- `pnpm-lock.yaml` - Lock file
- `.env` - Contains sensitive data
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `.github/workflows/*` - CI/CD workflows
- `migrations/sql/*.sql` - Database migrations

## Updating Configuration

### When to Update AGENTS.md
- New major features added
- Architecture changes significantly
- New technology stack changes
- Workflow processes change
- Dependencies added/removed that affect patterns

### When to Update ARCHITECTURE.md
- System architecture changes
- New design patterns introduced
- Data flow changes
- Security model changes
- Scalability approach changes

### When to Update Rules
- New coding standards established
- New patterns to enforce consistently
- Common mistakes identified
- Best practices refined
- Security considerations change

## File Formats

### `.mdc` Format (Cursor Rules)

Used for rule-based configuration in Cursor and compatible agents.

**Frontmatter:**
```yaml
---
description: ACTION when TRIGGER to OUTCOME
globs: pattern1,pattern2
alwaysApply: true
---
```

**Body:**
```markdown
# Rule Title

<version>1.0.0</version>

## Context
- When to apply

## Requirements
- What to do

## Examples
<example>
Good example
</example>

<example type="invalid">
Bad example
</example>
```

### Markdown Format (Documentation)

Used for comprehensive documentation in AGENTS.md and ARCHITECTURE.md.

**Structure:**
```markdown
# Title

## Section 1
Content...

## Section 2
Content...

| Header 1 | Header 2 |
|----------|----------|
| Value 1   | Value 2   |

```typescript
// Code example
```

---

**End of Documentation**
```

## Cross-References

### Project Documentation
- `README.md` - Project overview and getting started
- `AGENTS.md` - AI agent configuration (root level)
- `ARCHITECTURE.md` - System architecture (root level)
- `docs/CODING_STANDARDS.md` - Detailed coding standards
- `docs/CONTRIBUTING.md` - Contribution guidelines
- `docs/testing-standards.md` - Testing practices
- `docs/permission-matrix.md` - Role-based permissions

### Cursor-Specific Documentation
- `.cursor/AGENT_INSTRUCTIONS.md` - Detailed agent instructions
- `.cursor/PROJECT_CONTEXT.md` - Project context and tech stack
- `.cursor/QUICK_REFERENCE.md` - Quick commands and patterns
- `.cursor/WORKFLOW_CONSTRAINTS.md` - Development/production constraints
- `.cursor/DEPENDENCY_MAPPING.md` - Full dependency documentation

## Support

For questions about the agent configuration:
- Review `AGENTS.md` for comprehensive information
- Check `ARCHITECTURE.md` for system design details
- Refer to specific rule files for patterns
- Consult project documentation in `docs/`

---

**Last Updated:** 2025-01-27
**Version:** 1.0.0

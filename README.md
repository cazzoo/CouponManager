# Coupon Manager

A modern web application for managing vouchers and coupons with an intuitive user interface.

[![Build and Test](https://github.com/yourusername/CouponManager/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/yourusername/CouponManager/actions/workflows/build-and-test.yml)
[![Coverage](./badges/coverage/coverage-badge.svg)](./badges/coverage/coverage-badge.svg)

## Overview

Coupon Manager helps users track and manage their gift cards, vouchers, and coupons. It provides a clean, responsive interface for managing coupon details including retailer information, values, expiration dates, and usage status.

## Key Features

- Add, edit, and track coupons with detailed information
- View aggregated statistics by retailer
- Filter by retailer, amount range, and expiration status
- Dark/light theme support
- Barcode scanning for quick coupon entry
- Internationalization (i18n) support

## Getting Started

### Prerequisites

- Node.js v18 or higher
- pnpm (recommended) or npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/CouponManager.git
cd CouponManager

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open your browser and navigate to `http://localhost:3000`

### Testing

```bash
# Run tests
pnpm test

# Generate test coverage reports
pnpm test:coverage
```

## Documentation

For detailed information about the project, please refer to the documentation:

- [Product Requirements (PRD)](docs/prd.md)
- [Architecture Documentation](docs/architecture.md) 
- [Internationalization System](docs/i18n-system.md)
- [Code Style Guidelines](docs/code-style.md)
- [Contributing Guidelines](docs/contributing.md)
- [Testing Standards](docs/testing-standards.md)
- [Current Project Status](docs/project-status/status.md)
- [Future Development Plans](docs/project-status/todo.md)

## License

MIT
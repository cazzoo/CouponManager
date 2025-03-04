# Coupon Manager

A modern web application for managing vouchers and coupons with an intuitive user interface.

[![Build and Test](https://github.com/cazzoo/CouponManager/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/cazzoo/CouponManager/actions/workflows/build-and-test.yml)
[![Statements](./badges/coverage/statements-badge.svg)](./badges/coverage/statements-badge.svg)
[![Lines](./badges/coverage/lines-badge.svg)](./badges/coverage/lines-badge.svg)
[![Functions](./badges/coverage/functions-badge.svg)](./badges/coverage/functions-badge.svg)
[![Branches](./badges/coverage/branches-badge.svg)](./badges/coverage/branches-badge.svg)

[View Detailed Coverage Report](https://cazzoo.github.io/CouponManager/)

## Overview

Coupon Manager helps users track and manage their gift cards, vouchers, and coupons. It provides a clean, responsive interface for managing coupon details including retailer information, values, expiration dates, and usage status.

## Key Features

- Add, edit, and track coupons with detailed information
- View aggregated statistics by retailer
- Filter by retailer, amount range, and expiration status
- Dark/light theme support
- Barcode scanning for quick coupon entry
- Support for partial coupon usage
- Internationalization support (English, Spanish, French, and German)
- Fully responsive design optimized for both desktop and mobile
- Local storage for data persistence

## Getting Started

### Prerequisites

- Node.js v18 or higher
- pnpm (recommended) or npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/cazzoo/CouponManager.git
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

# Run tests in watch mode
pnpm test:watch

# Generate test coverage reports
pnpm test:coverage
```

## Current Status

- All core features implemented and fully functional
- 80% test coverage
- Barcode scanning functionality implemented
- Internationalization system in place with support for four languages
- Fully responsive design for desktop and mobile
- Some minor issues with barcode scanner on certain Android devices are being addressed

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

## Upcoming Features

- Optimized rendering performance for coupon list on mobile devices
- Notification system for expiring coupons
- User accounts and cloud synchronization
- Data export/import functionality
- Advanced search capabilities with tags and categories

## License

MIT
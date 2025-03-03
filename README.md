# Coupon Manager

A modern web application for managing vouchers and coupons with an intuitive user interface.

## Description

Coupon Manager is a React-based web application that helps users track and manage their gift cards, vouchers, and coupons. It provides a clean, responsive interface with both light and dark themes for managing coupon details including retailer information, values, expiration dates, and usage status.

## Features

- **Coupon Management**: Add, edit, and track coupons with detailed information
- **Retailer Statistics**: View aggregated statistics by retailer including active and expired coupon counts and values
- **Filtering & Sorting**: Filter coupons by retailer, amount range, and expiration status
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing
- **Copy to Clipboard**: Easily copy activation codes and PINs with a single click
- **Mark as Used**: Track which coupons have been fully redeemed
- **Partial Use**: Record partial usage of coupons while maintaining remaining value
- **Barcode Scanning**: Scan barcodes to quickly input coupon information

## Current State

The application is fully functional with a robust test suite. Components have been thoroughly tested for both desktop and mobile views. Recent updates include:

- Fixed issue with button labels for improved usability
- Enhanced mobile view with proper text labels for accessibility
- Added support for partial coupon usage
- Fixed test failures to ensure proper functionality
- Implemented barcode scanning capability for coupon entry

## Installation

### Prerequisites

- Node.js (v14 or newer)
- pnpm (recommended) or npm

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/CouponManager.git
   cd CouponManager
   ```

2. Install dependencies:
   ```
   pnpm install
   # or if using npm
   npm install
   ```

3. Start the development server:
   ```
   pnpm dev
   # or
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Development

### Running Tests

The project has a comprehensive test suite that can be run using:

```
pnpm test
# or
npm test
```

All components have dedicated test files for both desktop and mobile views to ensure consistent functionality across different devices.

## Usage

### Adding a New Coupon

1. Click the "Add Coupon" button
2. Fill in the required fields:
   - Retailer name
   - Initial value
   - Expiration date
3. Optionally add activation code and PIN
4. Click "Add Coupon" to save

### Managing Coupons

- **Edit**: Click the edit icon to modify coupon details
- **Mark as Used**: Click the "Mark as Used" button to set a coupon's current value to $0
- **Partial Use**: Click the "Partial Use" button to deduct a specific amount from the coupon's value
- **Filter**: Use the filter controls to find specific coupons by retailer, value range, or expiration status
- **Sort**: Click column headers to sort by retailer, amount, or expiration date
- **Copy Codes**: Use the copy button next to activation codes and PINs for easy copying

### Retailer View

Click on a retailer name in the Retailers tab to view all coupons from that specific retailer.

## Technology Stack

- **Frontend Framework**: React 18
- **UI Components**: Material-UI (MUI) v5
- **Build Tool**: Vite
- **Testing Framework**: Vitest with React Testing Library
- **Date Handling**: date-fns
- **State Management**: React Hooks

## Project Structure

```
CouponManager/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   │   ├── AddCouponForm.jsx     # Form for adding/editing coupons
│   │   ├── BarcodeScanner.jsx    # Component for scanning coupon barcodes
│   │   ├── CouponList.jsx        # Main coupon display component
│   │   └── RetailerList.jsx      # Retailer statistics component
│   ├── services/     # Service layer for data management
│   │   └── CouponService.js      # Business logic for coupon operations
│   ├── test/         # Test files
│   │   ├── components/           # Component tests
│   │   └── services/             # Service tests
│   ├── App.jsx       # Main application component
│   └── index.jsx     # Application entry point
├── index.html        # HTML template
├── package.json      # Project dependencies and scripts
├── pnpm-lock.yaml    # Lock file for dependencies
└── vite.config.js    # Vite configuration
```

## Future Enhancements

- Integrate with supabase
- Data persistence with local storage or backend integration
- User accounts and authentication
- Export/import functionality
- Notifications for expiring coupons
- Expose services via REST API
- Make the app as a browser extension (or compatible with a browser extension)
- Implement a language selector for content translation
- Implement coupon categories and tags for better organization
- Add advanced search capabilities
- Provide usage history tracking for coupons

## License

MIT
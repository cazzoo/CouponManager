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
- **Filter**: Use the filter controls to find specific coupons by retailer, value range, or expiration status
- **Sort**: Click column headers to sort by retailer, amount, or expiration date

### Retailer View

Click on a retailer name in the Retailers tab to view all coupons from that specific retailer.

## Technology Stack

- **Frontend Framework**: React 18
- **UI Components**: Material-UI (MUI) v5
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **State Management**: React Hooks

## Project Structure

```
CouponManager/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   ├── services/     # Service layer for data management
│   ├── App.jsx       # Main application component
│   └── index.jsx     # Application entry point
├── index.html        # HTML template
├── package.json      # Project dependencies and scripts
├── pnpm-lock.yaml    # Lock file for dependencies
└── vite.config.js    # Vite configuration
```

## Future Enhancements

- Data persistence with local storage or backend integration
- User accounts and authentication
- Barcode/QR code scanning for quick coupon entry
- Export/import functionality
- Notifications for expiring coupons

## License

MIT
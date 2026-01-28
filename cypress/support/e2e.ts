/**
 * E2E test support file
 * 
 * Imports custom commands and type definitions for E2E tests.
 * This file is automatically loaded before each E2E test run.
 * 
 * @module E2ESupport
 * @author Kilo Code
 * @date 2025-01-26
 */

// Import custom commands and types
import './index';

// Import page objects for use in E2E tests
import { loginPage } from '../pages/LoginPage';
import { dashboardPage } from '../pages/DashboardPage';
import { couponPage } from '../pages/CouponPage';
import { retailerPage } from '../pages/RetailerPage';
import { userManagementPage } from '../pages/UserManagementPage';

// Re-export page objects for use in test files
export { loginPage };
export { dashboardPage };
export { couponPage };
export { retailerPage };
export { userManagementPage };

/**
 * Component test support file
 * 
 * Imports custom commands and type definitions for component tests.
 * This file is automatically loaded before each component test run.
 * 
 * @module ComponentSupport
 * @author Kilo Code
 * @date 2025-01-26
 */

// Import custom commands and types
import './index';

// Import page objects for use in component tests
import { loginPage } from '../pages/LoginPage';
import { dashboardPage } from '../pages/DashboardPage';
import { couponPage } from '../pages/CouponPage';
import { retailerPage } from '../pages/RetailerPage';
import { userManagementPage } from '../pages/UserManagementPage';

// Re-export page objects for use in component tests
export { loginPage };
export { dashboardPage };
export { couponPage };
export { retailerPage };
export { userManagementPage };

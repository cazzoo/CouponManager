# CouponManager Todo List

Last Updated: 2023-06-15

## High Priority (Next Sprint)
- [ ] Convert to TSX
  - Convert all JSX files to TypeScript for better type safety
  - Start with core components (CouponList, AddCouponForm)
  - Update build pipeline to support TypeScript
- [ ] Implement @casl/ability for permissions
  - Replace current role-based system with more flexible ability-based system
  - Define ability rules for each user role
  - Integrate with existing RoleService
- [ ] Add pagination for User Management list
  - Implement server-side pagination for performance with large user lists
  - Add page size selector (10/25/50 items per page)

## Short-term Tasks (Next 1-2 months)
- [x] Use a local memory database when running dev
- [x] Have a user-management view
- [ ] Migrate the tests files to TSX
- [ ] Create admin dashboard
  - Implement manager/admin space for application settings
  - Add system-wide configuration options
  - Create admin-only analytics views
- [ ] Implement user preferences panel
  - Allow users to customize their experience
  - Add theme selection, language preference, and notification settings
  - Store preferences in user profile
- [ ] Add notification system for expiring coupons
  - Create notification component and service
  - Implement expiry date checking logic
  - Add user preferences for notification timing
- [ ] Implement data visualization for retailer statistics
  - Add charts and graphs for coupon usage
  - Create retailer comparison views
  - Add exportable reports
- [ ] Use Babel for better browser compatibility
  - Configure Babel with appropriate presets
  - Ensure compatibility with older browsers
- [ ] Fix connection issues with barcode scanner on Android
  - Troubleshoot and fix issues with specific Android devices
  - Add fallback mechanism when scanner is unavailable
- [ ] Optimize rendering performance for coupon list
  - Implement virtualized list for better performance
  - Add lazy loading for images
  - Optimize component re-rendering
- [ ] Enhance User Management with filtering and sorting
  - Add role-based filtering
  - Implement sorting by multiple columns
  - Add search functionality for users

## Medium-term Tasks (Next 3-6 months)
- [x] Add user accounts and authentication
- [ ] Implement export/import functionality for coupon data
  - Add CSV/JSON export options
  - Create import wizard with validation
  - Support batch processing
- [ ] Create advanced search capabilities
  - Implement full-text search across all coupon fields
  - Add fuzzy matching for retailer names
  - Create saved searches functionality
- [ ] Implement coupon categories and tags
  - Add custom categories with color coding
  - Support user-defined tags
  - Add filtering by category/tag
- [ ] Add user activity logging
  - Track coupon creation, updates, and usage
  - Create user activity dashboard
  - Implement audit log for admin users
- [ ] Implement user-specific settings and preferences
  - Allow customization of dashboard layout
  - Support email notifications
  - Add default values for new coupons
- [ ] Add bulk operations for coupons
  - Implement multi-select in coupon list
  - Add bulk edit, delete, and export functions
  - Create batch processing for coupon imports

## Long-term Tasks (Future Development)
- [ ] Expose services via REST API
  - Create authenticated API endpoints
  - Add rate limiting and throttling
  - Implement API key management
- [ ] Create browser extensions
  - Develop Chrome/Firefox extensions
  - Add coupon auto-detection on shopping sites
  - Implement one-click save functionality
- [ ] Provide usage history tracking for coupons
  - Record each time a coupon is used
  - Track partial usage over time
  - Add usage notes and receipts
- [ ] Consider switching runtime to Bun
  - Evaluate performance benefits
  - Test compatibility with existing code
  - Create migration plan
- [ ] Implement reporting features
  - Create customizable reports
  - Add scheduled report generation
  - Support PDF export
- [ ] Add print functionality for coupons
  - Create printable coupon templates
  - Add QR codes for easy scanning
  - Support batch printing
- [ ] Develop a mobile application
  - Create React Native or Flutter app
  - Implement offline support
  - Add mobile-specific features (barcode scanning, location-based alerts)

## Recently Completed
- [x] Implement User Management functionality
- [x] Add role-based access control (RBAC)
- [x] Integrate with Supabase for user authentication
- [x] Add comprehensive documentation for User Management
- [x] Fix permission issues with coupon creation
- [x] Expand internationalization to include User Management translations
- [x] Use a local memory database when running dev
- [x] Integrate with Supabase for data persistence
- [x] Implement barcode scanning functionality
- [x] Fix responsive layout issues on mobile devices
- [x] Implement internationalization with i18next
- [x] Optimize coupon list UI with icon-only buttons and tooltips
- [x] Add support for partial coupon usage

## Backlog Grooming Notes

### Items to Discuss at Next Planning
- Enhancing User Management with additional features
  - Consider adding bulk user import/export
  - Discuss password reset flow improvements
- Adding export functionality for coupon data
  - Determine priority of different export formats
  - Consider CSV vs. JSON vs. PDF exports
- Creating a reporting feature for usage statistics
  - Define key metrics to track
  - Discuss visualization options
- Implementing user notification system
  - Decide between in-app vs. email vs. push notifications
  - Set priorities for different notification types
- Progress on TSX conversion
  - Review conversion strategy and timeline
  - Discuss any blockers or challenges
- Implementation approach for @casl/ability permissions
  - Determine permission structure
  - Plan migration from current RBAC system
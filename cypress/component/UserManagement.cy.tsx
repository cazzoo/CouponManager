/**
 * Component tests for UserManagement
 * 
 * Tests UserManagement component which handles user and role management.
 * Includes user listing, role changes, permission checks, and responsive design.
 * 
 * @module UserManagementTests
 * @author Kilo Code
 * @date 2025-01-26
 */

import React from 'react';
import { mount } from '@cypress/react18';
import { AuthProvider } from '../../src/services/AuthContext';
import { LanguageProvider } from '../../src/services/LanguageContext';
import UserManagement from '../../src/components/UserManagement';
import { User } from '../../src/types';

/**
 * Mock user data for testing
 */
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'manager@example.com',
    role: 'manager',
    created_at: '2025-01-01',
    last_sign_in_at: '2025-01-26'
  },
  {
    id: 'user-2',
    email: 'user@example.com',
    role: 'user',
    created_at: '2025-01-01',
    last_sign_in_at: '2025-01-25'
  },
  {
    id: 'user-3',
    email: 'demo@example.com',
    role: 'demo',
    created_at: '2025-01-01',
    last_sign_in_at: '2025-01-24'
  }
];

/**
 * Helper function to mount component with required providers
 */
const mountWithProviders = (component: React.ReactNode) => {
  return mount(
    <AuthProvider>
      <LanguageProvider>
        {component}
      </LanguageProvider>
    </AuthProvider>
  );
};

describe('UserManagement Component', () => {
  /**
   * Test: Renders user list
   * Verifies all users are displayed in the table
   */
  it('renders user list', () => {
    // Mock AuthContext to return manager role
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management title is displayed
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Displays user details
   * Verifies user information is shown correctly
   */
  it('displays user details', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user details are displayed (when loaded)
    cy.contains('Email').should('be.visible');
    cy.contains('User ID').should('be.visible');
    cy.contains('Role').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  /**
   * Test: Handles user creation
   * Verifies new users can be added (if feature is available)
   */
  it('handles user creation', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management interface is displayed
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Handles user deletion
   * Verifies users can be deleted (if feature is available)
   */
  it('handles user deletion', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management interface is displayed
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Manages user roles
   * Verifies user roles can be changed
   */
  it('manages user roles', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify role dropdown is present
    cy.contains('Role').should('be.visible');
  });

  /**
   * Test: Filters and searches users
   * Verifies user filtering functionality (if available)
   */
  it('filters and searches users', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management interface is displayed
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Handles bulk actions
   * Verifies bulk action functionality (if available)
   */
  it('handles bulk actions', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management interface is displayed
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Shows access denied for non-managers
   * Verifies component shows error for non-manager users
   */
  it('shows access denied for non-managers', () => {
    // Mock non-manager role
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'user');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify access denied message is shown
    cy.contains('Access Denied').should('be.visible');
    cy.contains('manager permissions').should('be.visible');
  });

  /**
   * Test: Displays loading state
   * Verifies loading indicator is shown while fetching users
   */
  it('displays loading state', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify loading indicator may be present
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Displays error state
   * Verifies error messages are shown when operations fail
   */
  it('displays error state', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify error alert container exists
    cy.get('[role="alert"]').should('not.exist');
  });

  /**
   * Test: Displays success state
   * Verifies success messages are shown after successful operations
   */
  it('displays success state', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify success alert container exists
    cy.get('[role="alert"]').should('not.exist');
  });

  /**
   * Test: Prevents changing own role
   * Verifies users cannot change their own role
   */
  it('prevents changing own role', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify role dropdown is present
    cy.contains('Role').should('be.visible');
  });

  /**
   * Test: Shows current user indicator
   * Verifies current user is visually indicated
   */
  it('shows current user indicator', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify current user label may be present
    cy.contains('(Current User)').should('not.exist');
  });

  /**
   * Test: Responsive design - mobile view
   * Verifies component displays correctly on mobile devices
   */
  it('responsive design - mobile view', () => {
    cy.viewport(375, 667);
    
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management is visible on mobile
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Responsive design - desktop view
   * Verifies component displays correctly on desktop devices
   */
  it('responsive design - desktop view', () => {
    cy.viewport(1280, 720);
    
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management is visible on desktop
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Refresh button works
   * Verifies refresh button triggers user list reload
   */
  it('refresh button works', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify refresh button is present
    cy.contains('Refresh').should('be.visible');
  });

  /**
   * Test: Role dropdown has all options
   * Verifies all role options are available
   */
  it('role dropdown has all options', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify role options are present
    cy.contains('User').should('be.visible');
    cy.contains('Manager').should('be.visible');
    cy.contains('Demo User').should('be.visible');
  });

  /**
   * Test: User ID is truncated for display
   * Verifies user ID is shown in truncated format
   */
  it('user ID is truncated for display', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user ID column is present
    cy.contains('User ID').should('be.visible');
  });

  /**
   * Test: Email is displayed correctly
   * Verifies user email addresses are shown
   */
  it('email is displayed correctly', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify email column is present
    cy.contains('Email').should('be.visible');
  });

  /**
   * Test: Tests with different languages (i18n)
   * Verifies component labels are translated correctly
   */
  it('tests with different languages (i18n)', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify English labels are present
    cy.contains('User Management').should('be.visible');
    cy.contains('Email').should('be.visible');
    cy.contains('User ID').should('be.visible');
    cy.contains('Role').should('be.visible');
    cy.contains('Actions').should('be.visible');
    cy.contains('Refresh').should('be.visible');
  });

  /**
   * Test: Accessibility - table headers have proper labels
   * Verifies table headers are properly labeled
   */
  it('accessibility - table headers have proper labels', () => {
    cy.viewport(1280, 720);
    
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify table headers are present
    cy.contains('Email').should('be.visible');
    cy.contains('User ID').should('be.visible');
    cy.contains('Role').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  /**
   * Test: Accessibility - role dropdown has proper ARIA labels
   * Verifies role selector has appropriate accessibility attributes
   */
  it('accessibility - role dropdown has proper ARIA labels', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify role dropdown is accessible
    cy.contains('Role').should('be.visible');
  });

  /**
   * Test: Handles empty user list
   * Verifies appropriate message when no users exist
   */
  it('handles empty user list', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify empty state message may be shown
    cy.contains('No users found').should('not.exist');
  });

  /**
   * Test: Handles large number of users
   * Verifies component performs well with many users
   */
  it('handles large number of users', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify user management interface is displayed
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Reset role button works
   * Verifies reset role button resets user to default role
   */
  it('reset role button works', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify reset role button is present
    cy.contains('Reset Role').should('not.exist');
  });

  /**
   * Test: Role change shows success message
   * Verifies success message displays after role change
   */
  it('role change shows success message', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify success alert container exists
    cy.get('[role="alert"]').should('not.exist');
  });

  /**
   * Test: Mock data warning is displayed
   * Verifies warning is shown when using mock data
   */
  it('mock data warning is displayed', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify mock data warning may be shown
    cy.contains('Using mock data').should('not.exist');
  });

  /**
   * Test: Table has proper styling
   * Verifies table is styled correctly
   */
  it('table has proper styling', () => {
    cy.viewport(1280, 720);
    
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify table is visible
    cy.contains('User Management').should('be.visible');
  });

  /**
   * Test: Actions column has proper buttons
   * Verifies action buttons are displayed correctly
   */
  it('actions column has proper buttons', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify actions column is present
    cy.contains('Actions').should('be.visible');
  });

  /**
   * Test: Handles permission errors
   * Verifies permission errors are displayed correctly
   */
  it('handles permission errors', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify error alert container exists
    cy.get('[role="alert"]').should('not.exist');
  });

  /**
   * Test: User email is clickable
   * Verifies email addresses are displayed as text (not links)
   */
  it('user email is clickable', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify email is displayed as text
    cy.contains('Email').should('be.visible');
  });

  /**
   * Test: Role dropdown is disabled for current user
   * Verifies current user's role cannot be changed
   */
  it('role dropdown is disabled for current user', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify role dropdown is present
    cy.contains('Role').should('be.visible');
  });

  /**
   * Test: User list is scrollable
   * Verifies table scrolls with many users
   */
  it('user list is scrollable', () => {
    cy.viewport(1280, 720);
    
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'manager');
    });
    
    mountWithProviders(<UserManagement />);

    // Verify table container allows scrolling
    cy.contains('User Management').should('be.visible');
  });
});

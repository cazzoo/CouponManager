# User Management

This document describes the User Management functionality in the Coupon Manager application, which allows administrators (users with the Manager role) to view and manage users in the system.

## Overview

The User Management functionality provides a dedicated interface for administrators to:

1. View all users in the system
2. See user details including email, creation date, and current role
3. Promote standard users to manager role
4. Demote managers to standard user role

This functionality is only accessible to users with the Manager role and is protected by the permission system.

## User Interface

The User Management interface is accessed via a dedicated tab in the main navigation menu, which is only visible to users with the Manager role.

![User Management Tab](../assets/images/user-management-tab.png)

### Main Features

- **User List**: A table displaying all users in the system with the following information:
  - User ID
  - Email address
  - Creation date
  - Current role
  - Available actions

- **Role Management**: Managers can promote standard users to manager role or demote other managers to standard user role using the action buttons.

- **Self-Protection**: Users cannot change their own role to prevent accidental loss of access.

## Permissions

Access to the User Management functionality is controlled by the following permissions:

- `VIEW_USERS`: Required to view the user list
- `EDIT_USER_ROLE`: Required to change a user's role

These permissions are only granted to users with the Manager role. For more details, see the [Permission Matrix](./permission-matrix.md).

## Implementation Details

The User Management functionality is implemented with the following components:

- `UserManagement.jsx`: The main component that handles displaying the user list and managing roles.
- `RoleService.js`: Provides methods for checking permissions and managing user roles.
- `AuthContext.jsx`: Manages authentication state and provides user role information.

### API Integration

In production, the User Management component uses the Supabase Admin API to fetch users:

```javascript
const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
```

In development mode, the component falls back to mock data when the admin API is not available:

```javascript
// In development mode, fall back to mock users
usersData = { users: mockUsers };
```

### Role Updates

The component uses the `RoleService.setUserRole` method to update user roles:

```javascript
const result = await RoleService.setUserRole(userId, newRole);
```

### Error Handling

The component includes comprehensive error handling for common scenarios:

- Permission denied errors
- Failed user fetch operations
- Failed role update operations
- Attempting to change own role

## Internationalization

The User Management interface is fully internationalized with support for:

- English
- Spanish
- French
- German

All user interface elements, error messages, and status notifications use the translation system. See the [i18n documentation](./i18n-system.md) for more details.

## Development and Testing

When testing in development mode:

1. Log in as a manager user (`manager@example.com` / `password123`)
2. Navigate to the User Management tab
3. View the list of users and test role changes

The development environment includes debug information and additional logging to help troubleshoot any issues.

## Common Issues and Troubleshooting

### User Management Tab Not Visible

If the User Management tab is not visible:

1. Ensure you are logged in as a user with the manager role
2. Check the browser console for any error messages
3. Verify that the `isManager` flag is correctly set in the auth context

### Failed to Fetch Users Error

If you see "Failed to fetch users" error:

1. In development mode, ensure the mock users data is properly configured
2. In production, check that the Supabase configuration is correct and the service has the necessary permissions

### Role Update Failures

If role updates fail:

1. Check that the target user exists
2. Verify that you have the `EDIT_USER_ROLE` permission
3. Ensure you are not attempting to change your own role 
# Coupon Manager Permission Matrix

This document outlines the Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) rules implemented in the Coupon Manager application.

## Roles

The application defines the following roles:

| Role | Description |
|------|-------------|
| `DEMO_USER` | Limited access user for demonstration purposes. Can only view own coupons, cannot create, edit, or delete. |
| `USER` | Standard user with ability to manage their own coupons. |
| `MANAGER` | Administrative user with full access to the system. |

## Permissions

The following permissions define what actions can be performed:

| Permission | Description |
|------------|-------------|
| `VIEW_OWN_COUPONS` | View coupons owned by the current user |
| `VIEW_ANY_COUPON` | View any coupon in the system, regardless of ownership |
| `CREATE_COUPON` | Create a new coupon |
| `EDIT_COUPON` | Edit an existing coupon |
| `DELETE_COUPON` | Delete a coupon |
| `VIEW_USERS` | View the list of users in the system |
| `EDIT_USER_ROLE` | Change a user's role |
| `MANAGE_SYSTEM` | Perform system-wide operations |

## Permission Matrix

The following matrix outlines which permissions are granted to each role:

| Permission | DEMO_USER | USER | MANAGER |
|------------|:---------:|:----:|:-------:|
| `VIEW_OWN_COUPONS` | ✅ | ✅ | ✅ |
| `VIEW_ANY_COUPON` | ❌ | ❌ | ✅ |
| `CREATE_COUPON` | ❌ | ✅ | ✅ |
| `EDIT_COUPON` | ❌ | ⚠️* | ✅ |
| `DELETE_COUPON` | ❌ | ⚠️* | ✅ |
| `VIEW_USERS` | ❌ | ❌ | ✅ |
| `EDIT_USER_ROLE` | ❌ | ❌ | ✅ |
| `MANAGE_SYSTEM` | ❌ | ❌ | ✅ |

*⚠️ = Permission is granted only for resources owned by the user (attribute-based)

## Attribute-Based Access Control (ABAC) Rules

Beyond simple role-based permissions, the following attribute-based rules apply:

1. **Ownership Check**: For `USER` role, the `EDIT_COUPON` and `DELETE_COUPON` permissions 
   only apply to coupons owned by that user. This is enforced by checking the 
   `user_id` field of the coupon against the current user's ID.

2. **Self-modification Restriction**: Even `MANAGER` users cannot change their own role, 
   to prevent accidentally removing admin access.

## Implementation Details

Permission checks are implemented in the `RoleService.js` file using the `checkPermission` method.
The method takes:

- `userId`: The ID of the user requesting the action
- `permission`: The permission being requested (from the `Permissions` enum)
- `options`: Additional context such as the resource ID for ownership checks

Example:
```javascript
// Check if user can edit a coupon
const canEdit = await roleService.checkPermission(
  userId, 
  Permissions.EDIT_COUPON,
  { couponId: couponId }
);
```

## Troubleshooting

When troubleshooting permission issues:

1. Check the user's role in the database/mock data
2. Verify the permissions assigned to that role in `RoleService.js`
3. For attribute-based permissions, check that the resource has the correct attributes 
   (e.g., that the coupon's `user_id` matches the current user's ID)
4. Check the browser console for permission check logs during development 
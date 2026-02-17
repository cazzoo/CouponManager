# Session Persistence Fix - Cypress E2E Tests

## Problem Identified

The Cypress test "should maintain session after page refresh" was failing because:

1. **Custom `loadFromStore()` method was using wrong storage key**
   - [`PocketBaseClient.ts`](src/services/PocketBaseClient.ts:53-65) had a custom `loadFromStore()` method that looked for `localStorage.getItem('pocketbase_auth')`
   - But PocketBase SDK uses its own internal storage key format based on the URL (e.g., `_pb_auth_<base64_url>`)

2. **Storage key mismatch**
   - When `pb.collection('users').authWithPassword()` is called, PocketBase SDK saves auth data using its native storage mechanism
   - The custom `loadFromStore()` was looking for a different key (`pocketbase_auth`)
   - On page reload, the custom loader couldn't find the auth data, so no session was restored

3. **Result**
   - User logs in → PocketBase saves to its internal localStorage key
   - Page reloads → `loadFromStore()` looks for `pocketbase_auth` (wrong key!) → returns null
   - AuthContext initializes with `user: null` → Test fails

## Solution Applied

### 1. Removed Custom `loadFromStore()` Method

**File:** [`src/services/PocketBaseClient.ts`](src/services/PocketBaseClient.ts)

```diff
- private static loadFromStore(): void {
-   try {
-     const storeData = localStorage.getItem('pocketbase_auth');
-     if (storeData && PocketBaseClient.instance) {
-       const authData = JSON.parse(storeData);
-       console.log('​PocketBaseClient: Loading auth from store - token:', authData.token);
-       console.log('​PocketBaseClient: Loading auth from store - model:', authData.model);
-       PocketBaseClient.instance.authStore.save(authData.token, authData.model);
-     }
-   } catch (error) {
-     console.error('​PocketBaseClient: Error loading auth from store:', error);
-   }
- }
```

### 2. Removed `enableAutoAuth` Config Option

```diff
- interface PocketBaseConfig {
-   url: string;
-   enableAutoAuth?: boolean;
-   authMethod?: AuthMethod;
- }
-
- private static config: PocketBaseConfig = {
-   url: '',
-   enableAutoAuth: true,
-   authMethod: 'password'
- };
```

**Changed to:**

```diff
+ interface PocketBaseConfig {
+   url: string;
+   authMethod?: AuthMethod;
+ }
+
+ private static config: PocketBaseConfig = {
+   url: '',
+   authMethod: 'password'
+ };
```

### 3. Updated `initialize()` Method

```diff
  public static initialize(config?: Partial<PocketBaseConfig>): PocketBase {
    if (PocketBaseClient.instance) {
      return PocketBaseClient.instance;
    }

    PocketBaseClient.config = {
      ...PocketBaseClient.config,
      ...config
    };

    PocketBaseClient.instance = new PocketBase(PocketBaseClient.config.url);

-   if (PocketBaseClient.config.enableAutoAuth) {
-     PocketBaseClient.loadFromStore();
-   }

+   // PocketBase SDK natively handles localStorage persistence
+   // The authStore automatically loads from localStorage on initialization
+   // No need for custom loadFromStore() logic

    return PocketBaseClient.instance;
  }
```

## How It Works Now

PocketBase SDK has **built-in localStorage persistence** that works automatically:

1. **Login** → `pb.collection('users').authWithPassword()` saves to localStorage (using SDK's internal key)
2. **Page Reload** → `new PocketBase(url)` automatically loads from localStorage
3. **AuthContext** → `service.getUser()` returns the user from restored authStore

### Flow Diagram

```
User Logs In
    ↓
pb.collection('users').authWithPassword(email, password)
    ↓
PocketBase SDK saves to localStorage (internal key: _pb_auth_<url>)
    ↓
authStore.onChange callback fires
    ↓
AuthContext receives signedIn event
    ↓
user state is set

---

Page Reloads
    ↓
PocketBaseClient.getInstance() called
    ↓
new PocketBase(url) created
    ↓
PocketBase SDK automatically loads from localStorage
    ↓
authStore is restored with previous token/model
    ↓
AuthContext calls service.getUser()
    ↓
Returns user from authStore.model
    ↓
Session is maintained! ✓
```

## Test Files Updated

### [`src/test/services/PocketBaseClient.test.ts`](src/test/services/PocketBaseClient.test.ts)

Removed tests related to `enableAutoAuth` since we now rely on PocketBase's native persistence:

```diff
- describe('Auto Auth Loading', () => {
-   it('should load auth from localStorage when enableAutoAuth is true', () => {
-     // ... test code removed
-   });
-
-   it('should not load auth when enableAutoAuth is false', () => {
-     // ... test code removed
-   });
- });
+ // PocketBase SDK natively handles localStorage persistence
+ // The authStore automatically loads from localStorage on initialization
+ // No need for custom loadFromStore() logic
```

## Running the Tests

Once Cypress is properly installed, the session persistence test should now pass:

```bash
# Make sure PocketBase is running
pnpm pb:start

# Seed test data (first time only)
pnpm db:seed

# Start dev server
pnpm dev

# In another terminal, run Cypress tests
pnpm cy:run --spec "cypress/e2e/auth.cy.ts"
```

The test that should now pass:

```typescript
it('should maintain session after page refresh', () => {
  cy.login(testCredentials.username, testCredentials.password);
  cy.getByTestId('dashboard-container').should('be.visible');
  cy.reload();
  cy.getByTestId('dashboard-container', { timeout: 15000 }).should('be.visible');
  cy.getByTestId('logout-button').should('be.visible');
});
```

## Related Files Modified

1. [`src/services/PocketBaseClient.ts`](src/services/PocketBaseClient.ts) - Removed custom storage logic
2. [`src/test/services/PocketBaseClient.test.ts`](src/test/services/PocketBaseClient.test.ts) - Updated tests

## Additional Notes

- **No changes needed in AuthContext** - it already correctly calls `service.getUser()` to get the initial user
- **No changes needed in PocketBaseAuthService** - the `getUser()` method already returns from `authStore.model`
- The fix was purely about removing the incompatible custom storage layer and letting PocketBase SDK do what it's designed to do

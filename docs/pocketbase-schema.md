# PocketBase Schema Reference

Quick reference for CouponManager PocketBase collections and their structure.

## Collections

### 1. coupons

Stores coupon information with user ownership.

| Field | Type | Required | Description |
|--------|--------|-----------|-------------|
| id | text | Auto | Unique identifier |
| retailer | text | Yes | Store/brand name |
| initialValue | text | Yes | Original coupon value |
| currentValue | text | Yes | Remaining value |
| expirationDate | date | No | Expiration date |
| activationCode | text | No | Activation code |
| pin | text | No | PIN number |
| barcode | text | No | Barcode data |
| reference | text | No | Reference number |
| notes | editor | No | User notes |
| userId | relation | Yes | Link to _users collection |
| created | date | Auto | Creation timestamp |
| updated | date | Auto | Last update timestamp |

**Indexes:**
- `userId`
- `retailer`
- `created`

**API Rules:**
- List/View: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`
- Create: `null` (allow all authenticated)
- Update/Delete: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`

### 2. user_roles

Stores user role assignments.

| Field | Type | Required | Description |
|--------|--------|-----------|-------------|
| id | text | Auto | Unique identifier |
| userId | relation | Yes | Link to _users collection |
| role | select | Yes | Role: user, manager, demo |
| created | date | Auto | Creation timestamp |
| updated | date | Auto | Last update timestamp |

**Indexes:**
- `userId`

**API Rules:**
- List/View: `@request.auth.id != "" && userId = @request.auth.id || @request.auth.id.role = "manager"`
- Create/Update/Delete: `@request.auth.id != "" && (userId = @request.auth.id || @request.auth.id.role = "manager")`

## Field Types

### text
Plain text field.

**Options:**
- `min`: Minimum length (optional)
- `max`: Maximum length (optional)
- `pattern`: Regex pattern (optional)

### date
Date/time field.

**Format:** ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)

### editor
Rich text editor field (like textarea).

**Options:**
- `min`: Minimum length (optional)
- `max`: Maximum length (optional)
- `convertUrls`: Auto-convert URLs to links (optional)

### relation
Relationship to another collection.

**Options:**
- `collectionId`: Target collection ID
- `cascadeDelete`: Delete related records (boolean)
- `minSelect`: Minimum related records to fetch
- `maxSelect`: Maximum related records to fetch
- `displayFields`: Fields to display from related records

### select
Dropdown with predefined options.

**Options:**
- `values`: Array of allowed values
- `maxSelect`: Maximum selections (default: 1)

## API Rules Syntax

PocketBase API rules use simple expression syntax.

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | `userId = @request.auth.id` |
| `!=` | Not equals | `role != "admin"` |
| `>` | Greater than | `age > 18` |
| `<` | Less than | `created < 2024-01-01` |
| `>=` | Greater or equal | `value >= 0` |
| `<=` | Less or equal | `value <= 100` |
| `~` | Contains (text) | `name ~ "test"` |
| `!~` | Not contains (text) | `name !~ "test"` |
| `||` | OR | `a = 1 || b = 2` |
| `&&` | AND | `a = 1 && b = 2` |
| `!` | NOT | `!(a = 1)` |

### Variables

| Variable | Description | Example |
|---------|-------------|---------|
| `@request.auth.id` | Current user ID | `userId = @request.auth.id` |
| `@request.auth.email` | Current user email | `email = @request.auth.email` |
| `@request.auth.role` | User role (custom field) | `role = @request.auth.role` |
| `@request.data.fieldName` | Request data | `name = @request.data.name` |
| `@collection.id` | Record ID (in update/delete) | `id = @collection.id` |
| `@collection.fieldName` | Record field value | `owner = @collection.userId` |
| `@now` | Current timestamp | `created < @now` |

### Examples

**Allow access to own records only:**
```
userId = @request.auth.id
```

**Allow managers to access any record:**
```
userId = @request.auth.id || @request.auth.role = "manager"
```

**Allow only authenticated users:**
```
@request.auth.id != ""
```

**Check field equality:**
```
status = "active" && userId = @request.auth.id
```

## Migration Notes

### From Supabase

| Supabase | PocketBase | Notes |
|----------|-----------|--------|
| `user_id` | `userId` | Field name change |
| `auth.users` | `_users` | System collection name |
| `user_roles` table | `user_roles` collection | Same name |
| `coupons` table | `coupons` collection | Same name |
| `created_at` | `created` | Field name change |
| `updated_at` | `updated` | Field name change |
| `id` (serial) | `id` (text) | Auto-generated text ID |
| `expiration_date` | `expirationDate` | camelCase change |

### Type Mappings

| Supabase Type | PocketBase Type | Notes |
|----------------|----------------|--------|
| `text` | `text` | Same |
| `timestamp` | `date` | Different format |
| `varchar` | `text` | Use text type |
| `integer` | `number` | Not needed for values stored as text |
| `json` | `editor` | For complex data |
| `uuid` | `relation` (to _users) | Foreign keys |

## Query Examples

### Fetch all coupons for current user:

```typescript
const coupons = await pb.collection('coupons').getList(1, 50, {
  filter: `userId = "${currentUserId}"`
});
```

### Fetch with pagination:

```typescript
const coupons = await pb.collection('coupons').getList(page, perPage, {
  sort: '-created',
  filter: `userId = "${currentUserId}"`
});
```

### Create new coupon:

```typescript
const coupon = await pb.collection('coupons').create({
  retailer: 'Amazon',
  initialValue: '50',
  currentValue: '50',
  userId: currentUserId
});
```

### Update existing coupon:

```typescript
const updated = await pb.collection('coupons').update(couponId, {
  currentValue: '0'
});
```

### Delete coupon:

```typescript
await pb.collection('coupons').delete(couponId);
```

### Search by retailer:

```typescript
const coupons = await pb.collection('coupons').getList(1, 50, {
  filter: `userId = "${currentUserId}" && retailer ~ "Amazon"`
});
```

## Common Patterns

### Pagination:

```typescript
let page = 1;
const perPage = 20;
let allCoupons = [];

while (true) {
  const result = await pb.collection('coupons').getList(page, perPage);
  allCoupons.push(...result.items);

  if (result.items.length < perPage) break;
  page++;
}
```

### Full-text search:

```typescript
const results = await pb.collection('coupons').getList(1, 20, {
  filter: `userId = "${currentUserId}" && (notes ~ "gift" || reference ~ "123")`
});
```

### Date range queries:

```typescript
const today = new Date().toISOString();
const results = await pb.collection('coupons').getList(1, 20, {
  filter: `userId = "${currentUserId}" && expirationDate >= "${today}"`
});
```

### Real-time subscriptions:

```typescript
// Subscribe to coupon updates
pb.collection('coupons').subscribe('*', (e) => {
  if (e.action === 'create') {
    console.log('New coupon:', e.record);
  } else if (e.action === 'update') {
    console.log('Updated coupon:', e.record);
  } else if (e.action === 'delete') {
    console.log('Deleted coupon:', e.record);
  }
});
```

## Security Considerations

### API Rules Best Practices:

1. **Always check authentication:**
   ```
   @request.auth.id != ""
   ```

2. **Use field-level access control:**
   ```
   userId = @request.auth.id || @request.auth.role = "manager"
   ```

3. **Validate data ownership:**
   - Check userId matches on update/delete
   - Allow managers to bypass

4. **Be explicit with OR conditions:**
   ```
   (userId = @request.auth.id || @request.auth.role = "manager")
   ```

### Collection Security:

1. **Public collections:** Require null rule for create
2. **Private collections:** Require `@request.auth.id != ""` for all operations
3. **Mixed access:** Use role-based conditions
4. **Admin-only:** Use specific admin role check

### Data Validation:

1. **Validate in application:** Check before sending to PocketBase
2. **Use field constraints:** Set min/max/pattern in schema
3. **Sanitize inputs:** Clean user-provided data
4. **Handle errors:** Catch and display meaningful messages
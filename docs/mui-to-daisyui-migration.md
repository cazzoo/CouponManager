# MUI to DaisyUI Migration Plan

## Overview

This document outlines the comprehensive migration strategy for transitioning the CouponManager application from Material-UI (MUI) to DaisyUI + Tailwind CSS.

**Migration Date:** 2025-01-30
**Current MUI Version:** 5.15.0
**Target DaisyUI Version:** Latest (4.x)
**Complexity:** High - 8 components with extensive MUI usage

---

## Dependencies Analysis

### Dependencies to Remove

```json
{
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "@mui/icons-material": "^5.15.0",
  "@mui/material": "^5.15.0",
  "@mui/x-date-pickers": "^6.19.0"
}
```

### Dependencies to Add

```json
{
  "daisyui": "^4.x.x",
  "lucide-react": "^0.x.x",        // Icon library
  "react-day-picker": "^8.x.x"     // Date picker
}
```

**Note:** Tailwind CSS (v3.3.0) is already installed.

---

## Component Mapping Reference

### Layout Components

| MUI Component | DaisyUI/Tailwind Equivalent | Notes |
|--------------|----------------------------|-------|
| `Box` | `<div>` with Tailwind classes | Use utility classes for margins, padding, flexbox |
| `Container` | `<div className="container mx-auto">` | Tailwind container |
| `Paper` | `<div className="card bg-base-100 shadow-xl">` | DaisyUI card |
| `Grid` | Flexbox/Grid utilities | `grid grid-cols-1 md:grid-cols-2 gap-4` |
| `Stack` | Flexbox utilities | `flex flex-col gap-4` |

### Form Components

| MUI Component | DaisyUI/Tailwind Equivalent | Notes |
|--------------|----------------------------|-------|
| `TextField` | `<input className="input input-bordered">` | |
| `TextField multiline` | `<textarea className="textarea textarea-bordered">` | |
| `Select` | `<select className="select select-bordered">` | |
| `FormControlLabel` | `<label className="label cursor-pointer">` | |
| `Checkbox` | `<input type="checkbox" className="checkbox">` | |
| `Radio` | `<input type="radio" className="radio">` | |
| `Switch` | `<input type="checkbox" className="toggle">` | |
| `Button` | `<button className="btn">` | Variants: `btn-primary`, `btn-secondary`, `btn-outline` |
| `Autocomplete` | Custom component with `<datalist>` or DaisyUI dropdown | |
| `DatePicker` | `react-day-picker` | Need to create wrapper component |

### Feedback Components

| MUI Component | DaisyUI/Tailwind Equivalent | Notes |
|--------------|----------------------------|-------|
| `Alert` | `<div className="alert">` | Variants: `alert-info`, `alert-success`, `alert-warning`, `alert-error` |
| `Snackbar` | `<div className="toast">` | DaisyUI toast component |
| `CircularProgress` | `<span className="loading loading-spinner">` | DaisyUI loading |
| `LinearProgress` | `<progress className="progress">` | DaisyUI progress |
| `Backdrop` | `<div className="modal-open">` + `<div className="modal">` | DaisyUI modal |

### Navigation Components

| MUI Component | DaisyUI/Tailwind Equivalent | Notes |
|--------------|----------------------------|-------|
| `Tabs` / `Tab` | `<div className="tabs">` + `<a className="tab">` | DaisyUI tabs |
| `Menu` | `<ul className="menu">` | DaisyUI menu |
| `MenuItem` | `<li><a>` | DaisyUI menu items |
| `Breadcrumbs` | `<ul className="breadcrumbs">` | DaisyUI breadcrumbs |

### Data Display Components

| MUI Component | DaisyUI/Tailwind Equivalent | Notes |
|--------------|----------------------------|-------|
| `Table` | `<table className="table">` | DaisyUI table |
| `Card` | `<div className="card">` | DaisyUI card |
| `CardHeader` | `<div className="card-body">` | |
| `CardContent` | `<div className="card-body">` | |
| `CardActions` | `<div className="card-actions">` | |
| `List` | `<ul className="menu">` | DaisyUI menu |
| `ListItem` | `<li>` | |
| `Divider` | `<div className="divider">` | DaisyUI divider |
| `Chip` | `<div className="badge">` | DaisyUI badge |
| `Tooltip` | `<div className="tooltip">` | DaisyUI tooltip |
| `Avatar` | `<div className="avatar">` | DaisyUI avatar |
| `Badge` | `<div className="badge">` | DaisyUI badge |
| `IconButton` | `<button className="btn btn-circle">` | DaisyUI circle button |

### Dialog Components

| MUI Component | DaisyUI/Tailwind Equivalent | Notes |
|--------------|----------------------------|-------|
| `Dialog` | `<dialog className="modal">` | DaisyUI modal |
| `DialogTitle` | `<h3 className="font-bold text-lg">` | |
| `DialogContent` | `<div className="modal-box">` | |
| `DialogActions` | `<div className="modal-action">` | |

### Typography

| MUI Component | DaisyUI/Tailwind Equivalent | Notes |
|--------------|----------------------------|-------|
| `Typography` | Native HTML + Tailwind classes | `text-xl`, `font-bold`, `text-primary` |
| `h1` | `<h1 className="text-5xl font-bold">` | |
| `h2` | `<h2 className="text-4xl font-bold">` | |
| `h3` | `<h3 className="text-3xl font-bold">` | |
| `h4` | `<h4 className="text-2xl font-bold">` | |
| `h5` | `<h5 className="text-xl font-bold">` | |
| `h6` | `<h6 className="text-lg font-bold">` | |
| `body1` | `<p className="text-base">` | |
| `body2` | `<p className="text-sm">` | |
| `caption` | `<span className="text-xs">` | |

### Icons

| MUI Icons | Lucide React | Notes |
|-----------|--------------|-------|
| `PersonIcon` | `User` | |
| `ShieldIcon` | `Shield` | |
| `VisibilityOffIcon` | `EyeOff` | |
| `LanguageIcon` | `Languages` | |
| `EditIcon` | `Edit` | |
| `ContentCopyIcon` | `Copy` | |
| `MoneyOffIcon` | `CircleDollarSign` with slash | |
| `PaymentIcon` | `CreditCard` | |
| `CancelIcon` | `X` | |
| `QrCodeScannerIcon` | `Scan` | |

---

## Component Migration Strategy

### Phase 1: Setup & Configuration

1. **Install Dependencies**
   ```bash
   pnpm add daisyui
   pnpm add lucide-react
   pnpm add react-day-picker
   ```

2. **Configure Tailwind CSS**
   - Update `tailwind.config.js` to include DaisyUI plugins
   - Configure DaisyUI themes

3. **Create Theme Configuration**
   - Map MUI theme colors to DaisyUI theme tokens
   - Configure custom DaisyUI theme if needed

### Phase 2: Component Migration (Ordered by Complexity)

#### Wave 1: Simple Components (Can be done in parallel)

1. **BarcodeScanner.tsx** (93 lines)
   - Low complexity
   - Dialog, Button, Typography, Box, Alert
   - No complex state or interactions

2. **LanguageSelector.tsx** (104 lines)
   - Medium complexity
   - Select, Menu, responsive design
   - Icon replacement needed

#### Wave 2: Medium Complexity Components

3. **DevUserSwitcher.tsx** (257 lines)
   - Medium complexity
   - Multiple icons, badges, responsive
   - More complex state management

4. **LoginForm.tsx** (250 lines)
   - Medium complexity
   - Form validation, tabs, loading states
   - Critical authentication flow

#### Wave 3: Complex Components (Sequential due to dependencies)

5. **AddCouponForm.tsx** (339 lines)
   - High complexity
   - Form with DatePicker, Autocomplete
   - Barcode scanner integration
   - Complex form validation

6. **RetailerList.tsx** (300 lines)
   - High complexity
   - Statistics calculations
   - Table and card responsive views
   - Sorting functionality

7. **UserManagement.tsx** (420 lines)
   - High complexity
   - Role-based permissions
   - Async operations
   - Complex state management

8. **CouponList.tsx** (578 lines) - **LARGEST COMPONENT**
   - Highest complexity
   - Filtering, sorting, pagination
   - Responsive table/card views
   - Multiple dialogs and actions
   - Copy to clipboard functionality
   - Partial use calculations

### Phase 3: Integration & Cleanup

9. **Update App.tsx**
   - Remove MUI ThemeProvider
   - Add DaisyUI theme provider if needed
   - Update any remaining MUI imports

10. **Remove MUI Dependencies**
    ```bash
    pnpm remove @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled
    ```

### Phase 4: Testing Migration

11. **Update Test Files**
    - Update component imports
    - Replace MUI-specific queries with standard queries
    - Update snapshots if needed

12. **Verification**
    - Build: `pnpm build`
    - Unit tests: `pnpm test`
    - E2E tests: `pnpm test:e2e`
    - Coverage: `pnpm test:coverage`

---

## Key Implementation Patterns

### Styling Migration

**MUI Pattern:**
```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
  <Typography variant="h6" sx={{ color: 'primary.main' }}>
    Title
  </Typography>
</Box>
```

**DaisyUI/Tailwind Pattern:**
```tsx
<div className="flex flex-col gap-2 p-3">
  <h6 className="text-lg font-bold text-primary">
    Title
  </h6>
</div>
```

### Responsive Design Migration

**MUI Pattern:**
```tsx
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

return isMobile ? <MobileView /> : <DesktopView />;
```

**DaisyUI/Tailwind Pattern:**
```tsx
// Using Tailwind responsive classes
return (
  <>
    <div className="hidden md:block">
      <DesktopView />
    </div>
    <div className="md:hidden">
      <MobileView />
    </div>
  </>
);

// Or using conditional rendering with CSS
const isMobile = useMediaQuery('(max-width: 768px)');
return isMobile ? <MobileView /> : <DesktopView />;
```

### Form Validation Migration

**MUI Pattern:**
```tsx
<TextField
  error={!!errors.email}
  helperText={errors.email}
  label="Email"
  value={email}
  onChange={handleChange}
/>
```

**DaisyUI/Tailwind Pattern:**
```tsx
<div className="form-control">
  <label className="label">
    <span className="label-text">Email</span>
  </label>
  <input
    type="text"
    placeholder="Email"
    className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
    value={email}
    onChange={handleChange}
  />
  {errors.email && (
    <label className="label">
      <span className="label-text-alt text-error">{errors.email}</span>
    </label>
  )}
</div>
```

### Icon Migration

**MUI Pattern:**
```tsx
import EditIcon from '@mui/icons-material/Edit';
<IconButton onClick={handleEdit}>
  <EditIcon />
</IconButton>
```

**DaisyUI/Tailwind Pattern:**
```tsx
import { Edit } from 'lucide-react';
<button className="btn btn-circle btn-ghost" onClick={handleEdit}>
  <Edit className="w-5 h-5" />
</button>
```

### Dialog Migration

**MUI Pattern:**
```tsx
<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </DialogActions>
</Dialog>
```

**DaisyUI/Tailwind Pattern:**
```tsx
<dialog className={`modal ${open ? 'modal-open' : ''}`}>
  <div className="modal-box">
    <h3 className="font-bold text-lg">Title</h3>
    <div className="py-4">
      Content
    </div>
    <div className="modal-action">
      <button className="btn" onClick={handleClose}>Cancel</button>
      <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
    </div>
  </div>
</dialog>
```

---

## Testing Strategy

### Test Updates Required

1. **Component Imports**
   ```tsx
   // Before
   import { Button } from '@mui/material';

   // After
   // No import needed - using HTML elements
   ```

2. **Test Queries**
   ```tsx
   // Before (MUI-specific)
   screen.getByRole('button', { name: /submit/i });

   // After (Standard queries - still work!)
   screen.getByRole('button', { name: /submit/i });
   ```

3. **Snapshot Tests**
   - All component snapshots will need updating
   - Run `pnpm test -u` to update snapshots

### Critical Test Paths

1. **Authentication Flow** (LoginForm)
2. **Form Validation** (AddCouponForm)
3. **Sorting & Filtering** (CouponList, RetailerList)
4. **Responsive Behavior** (All components)
5. **User Role Management** (UserManagement, DevUserSwitcher)
6. **Internationalization** (LanguageSelector)

---

## Risk Mitigation

### High-Risk Areas

1. **DatePicker Migration**
   - Risk: MUI DatePicker has rich features
   - Mitigation: Create comprehensive wrapper around react-day-picker
   - Validation: Test all date formats, locales, and validations

2. **Autocomplete Migration**
   - Risk: MUI Autocomplete has advanced features
   - Mitigation: Implement custom autocomplete with DaisyUI dropdown
   - Validation: Test keyboard navigation, filtering, selection

3. **Responsive Tables**
   - Risk: MUI Table has responsive features
   - Mitigation: Use DaisyUI table with custom responsive classes
   - Validation: Test on mobile, tablet, desktop viewports

4. **Form Validation**
   - Risk: MUI TextField has built-in validation UI
   - Mitigation: Create reusable DaisyUI input components with validation
   - Validation: Test all validation states and error messages

### Rollback Strategy

1. **Git Branching**
   - Create branch `feature/mui-to-daisyui`
   - Commit each component migration separately
   - Tag critical milestones

2. **Feature Flags**
   - Consider adding feature flags for gradual rollout
   - A/B testing if needed

3. **Testing Gates**
   - Each component must pass tests before proceeding
   - Build must succeed after each wave
   - Manual testing checkpoint after each wave

---

## Success Criteria

### Functional Requirements

- [ ] All 8 components migrated to DaisyUI
- [ ] All features work identically to MUI version
- [ ] All tests pass (unit + E2E)
- [ ] Test coverage ≥ 80%
- [ ] Build succeeds without errors
- [ ] No MUI imports remain in codebase

### Performance Requirements

- [ ] Bundle size not significantly increased
- [ ] First Contentful Paint ≤ 1.5s
- [ ] Time to Interactive ≤ 3s

### UX Requirements

- [ ] Responsive design maintained on all viewports
- [ ] Accessibility (WCAG 2.1 AA) maintained
- [ ] Internationalization works for all languages
- [ ] Theme switching (if implemented) works

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Setup | Install deps, configure Tailwind/DaisyUI | 1-2 hours |
| Phase 2: Wave 1 | BarcodeScanner, LanguageSelector | 2-3 hours |
| Phase 2: Wave 2 | DevUserSwitcher, LoginForm | 3-4 hours |
| Phase 2: Wave 3 | AddCouponForm, RetailerList, UserManagement | 6-8 hours |
| Phase 2: Wave 4 | CouponList (largest) | 4-6 hours |
| Phase 3: Integration | App.tsx, cleanup, remove deps | 1-2 hours |
| Phase 4: Testing | Update tests, verification | 3-4 hours |
| **Total** | | **20-29 hours** |

---

## Resources

### Documentation
- [DaisyUI Components](https://daisyui.com/docs/components/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/icons/)
- [react-day-picker](https://daypicker.dev/)

### Migration Guides
- [Material-UI to Tailwind CSS](https://tailwindcss.com/docs/material-ui)
- [MUI Component Alternatives](https://github.com/anubra266/study-mui-to-tailwind)

---

## Notes

- This migration will change the underlying HTML structure of components
- All E2E tests may need updates to selectors
- Manual QA testing will be critical
- Consider creating a migration checklist for each component

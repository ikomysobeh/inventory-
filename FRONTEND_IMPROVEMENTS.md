# Frontend Improvement Guide

> This document maps every repeated pattern in the codebase, what should become a shared component,
> what should live in one place, and what improvements will make the UI better.
> **If a change is in a shared component or `styles.ts`, it automatically applies everywhere.**

---

## 1. The Core Problem: Copy-Paste Architecture

Right now the same code is written 4–5 times across the pages.
Every time you fix a bug or change a style, you must change it in every page.

| Pattern | Repeated in |
|---|---|
| Modal (overlay + form shell) | ItemsPage, CategoriesPage, SuppliersPage, UsersPage |
| Table (thead, tbody, row hover) | All 5 pages |
| Input with onFocus/onBlur handlers | ~30 times across all pages |
| Edit + Delete action buttons | ItemsPage, CategoriesPage, SuppliersPage, UsersPage |
| Loading spinner | All 5 pages |
| `+ Add X` button header | All 4 CRUD pages |
| Form group (label + input) | ~30 times across all pages |
| Nav link with hover handler | Layout.tsx × 5 links |

---

## 2. Components to Create

Each component below removes repetition. **Create them in `resources/js/components/ui/`.**

---

### 2.1 `<Modal>` — highest priority

**Problem:** The entire modal shell (overlay, container, header with icon+title+subtitle, error banner,
Cancel/Save buttons) is copy-pasted into every CRUD page. Any padding, shadow, or button change
must be applied 4 times.

**What it replaces in:** `ItemsPage`, `CategoriesPage`, `SuppliersPage`, `UsersPage`

```tsx
// resources/js/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  icon?: string;
  onClose: () => void;
  onSubmit: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  error?: string | null;
  children: React.ReactNode;
}
```

**Usage after:**
```tsx
<Modal
  isOpen={isOpen}
  title={editingId ? 'Edit Item' : 'Add New Item'}
  icon="📦"
  onClose={handleClose}
  onSubmit={() => saveMutation.mutate(formData)}
  isSaving={saveMutation.isPending}
  error={saveMutation.error?.response?.data?.message}
>
  {/* only the fields go here */}
</Modal>
```

---

### 2.2 `<FormInput>` and `<FormSelect>` — second highest priority

**Problem:** Every single input repeats 8 lines of onFocus/onBlur for the orange highlight effect.
There are ~30 of these across the codebase. If you want to change the focus ring color,
you must edit 30 places.

**The `inputFocus` key already exists in `styles.ts` but is never used — the handlers do it manually.**

```tsx
// resources/js/components/ui/FormInput.tsx
interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  error?: string;
}
```

```tsx
// resources/js/components/ui/FormSelect.tsx
interface FormSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string | number; label: string }[];
  required?: boolean;
}
```

**Usage after:**
```tsx
<FormInput label="Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} required />
<FormSelect label="Category" value={formData.category_id} onChange={(v) => setFormData({...formData, category_id: v})} options={categories.map(c => ({ value: c.id, label: c.name }))} />
```

---

### 2.3 `<DataTable>` — table shell only

**Problem:** The card wrapper, `overflowX: auto`, `<table>`, `<thead>`, and row hover effects
are copy-pasted into every page. The hover is done with `onMouseEnter/onMouseLeave` DOM
manipulation — changing it means editing 5 files.

```tsx
// resources/js/components/ui/DataTable.tsx
interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
}
```

**Usage after:**
```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category', render: (row) => row.category.name },
    { key: 'actions', label: 'Actions', align: 'center', render: (row) => <RowActions ... /> },
  ]}
  data={items}
  keyField="id"
  emptyMessage="No items yet. Click + Add Item to get started."
/>
```

---

### 2.4 `<RowActions>` — Edit / Delete / Reset buttons

**Problem:** The same 2–3 buttons with the same sizes and spacing appear in every table.
Changing button padding or adding a confirmation step means editing 4 files.

```tsx
// resources/js/components/ui/RowActions.tsx
interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onReset?: () => void;          // for UsersPage only
  isDeleting?: boolean;
  deleteConfirm?: string;         // shows a confirm dialog with this message before deleting
}
```

---

### 2.5 `<PageHeader>` — title + Add button row

**Problem:** Every CRUD page has the same `flexBetween` div with a title (passed through `Layout`)
and an `+ Add X` button. The button is always the same style.

```tsx
// resources/js/components/ui/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  addLabel?: string;
  onAdd?: () => void;
}
```

---

### 2.6 `<LoadingSpinner>`

**Problem:** The spinner div + `@keyframes spin` style tag are copy-pasted in every page.
`DashboardPage` injects the `@keyframes` via a `<style>` tag; other pages rely on it being
there from the Dashboard render — fragile.

```tsx
// resources/js/components/ui/LoadingSpinner.tsx
// Renders the spinner + owns the @keyframes — no page needs to inject CSS anymore.
export function LoadingSpinner() { ... }
```

---

### 2.7 `<Badge>`

**Problem:** Badge styles are scattered — some pages use `styles.badgeActive`, some inline the
purple/blue role badges. There is no single place to define what a "manager" badge looks like.

```tsx
// resources/js/components/ui/Badge.tsx
type BadgeVariant = 'active' | 'inactive' | 'low-stock' | 'manager' | 'employee';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
}
```

---

### 2.8 Fix `<Layout>` — NavLink + import styles

**Two problems in `Layout.tsx`:**

1. It defines its own local `styles` object with hardcoded color strings (`'#0f1117'`, `'#f97316'`).
   These are duplicates of `colors` in `lib/styles.ts`. If you change the accent color in `styles.ts`
   it will NOT update the nav active color or logout button — they are separate hardcoded strings.

2. Navigation links use `<a href>` which causes a full page reload on every click.
   They should use `<Link>` from `react-router-dom`.

3. Each nav link repeats the same `onMouseEnter`/`onMouseLeave` 5 times.

**Fix:**
```tsx
// In Layout.tsx — replace the 5 <a> tags with one NavLink component:
import { Link, useLocation } from 'react-router-dom';
import { colors } from '../lib/styles';  // use shared colors, not hardcoded strings

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link to={to} style={{ ...navLinkStyle, ...(isActive ? navLinkActiveStyle : {}) }}>
      {children}
    </Link>
  );
}
```

---

## 3. What Must Stay in `lib/styles.ts` (Single Source of Truth)

These are already there but need fixes so they actually work as a single source of truth:

| Thing | Current Problem | Fix |
|---|---|---|
| `colors.accent` | Not used in `Layout.tsx` — it hardcodes `'#f97316'` | Import `colors` in Layout |
| `colors.bgBase` | Not used in `Layout.tsx` — it hardcodes `'#0f1117'` | Import `colors` in Layout |
| `styles.inputFocus` | Defined but never used — all inputs do it manually | Use it inside `<FormInput>` |
| `hoverStyles` | DOM manipulation (`e.currentTarget.style.X`) — anti-React pattern | Replace with CSS classes or inline state |
| `styles.buttonDanger` | Missing `minHeight: '44px'` (other buttons have it) | Add for consistency |

### Colors that should be added to `colors` in `styles.ts`:
```ts
// Add these — they are currently hardcoded inline in pages:
roleBadgeManager: { color: '#a855f7', bg: '#3b0764' },
roleBadgeEmployee: { color: '#3b82f6', bg: '#1e3a8a' },
errorRed: '#ef4444',           // already exists as colors.red
errorBg: 'rgba(239,68,68,0.1)',
```

---

## 4. UX Improvements

These are improvements to how the app works, not just code structure.

### 4.1 Replace `alert()` with Toast Notifications

**File:** `UsersPage.tsx:60`
```tsx
// Current — blocks the whole UI:
alert('Password reset successfully. User should check their email.');

// Fix — use a toast library (sonner is already installed in the project):
import { toast } from 'sonner';
toast.success('Password reset successfully.');
```

### 4.2 Delete Confirmation Dialog

**Problem:** Clicking Delete immediately calls the API with no "are you sure?" step.
One mis-click deletes a record permanently.

**Fix:** Add `deleteConfirm` prop to `<RowActions>` that shows a native `confirm()` dialog
or a small inline confirmation state ("Are you sure? Yes / No") before calling the mutation.

### 4.3 Empty State for Tables

**Problem:** When a table has no data, it shows a completely blank card with no explanation.

**Fix:** Show a message when `data.length === 0`:
```tsx
{data.length === 0 && (
  <tr>
    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
      No records found.
    </td>
  </tr>
)}
```

### 4.4 Error Feedback on All Mutations

**Problem:** Only `UsersPage` shows a mutation error inside the modal. `ItemsPage`,
`CategoriesPage`, `SuppliersPage` silently fail — the save button just stops loading
with no message.

**Fix:** The `<Modal>` component (section 2.1) should accept an `error` prop and render
it automatically — so every page gets error feedback for free once it uses `<Modal>`.

### 4.5 Success Feedback on Save

**Problem:** When you save a record the modal just closes — no confirmation.
Users are not sure if it worked.

**Fix:** Add a toast on `onSuccess` inside `<Modal>`:
```tsx
toast.success(`${title} saved successfully.`);
```

### 4.6 Navigation — `<a href>` causes full page reloads

**File:** `Layout.tsx` — all 5 nav links, `DashboardPage.tsx` quick action links
**Fix:** Replace with `<Link to="...">` from `react-router-dom`. This keeps React state
alive and makes navigation instant.

---

## 5. Implementation Priority

Do these in order. Each step is independent and safe.

```
Step 1 — Fix Layout.tsx
  - Import colors from lib/styles.ts (remove hardcoded strings)
  - Replace <a href> with <Link to> from react-router-dom
  - Extract repeated nav link into a local NavLink component
  Result: nav works as SPA, color changes propagate from one file

Step 2 — Create <FormInput> and <FormSelect>
  - Encapsulate the 8-line onFocus/onBlur block
  - Replace in all pages one at a time
  Result: ~30 blocks collapse to ~30 one-liners

Step 3 — Create <Modal>
  - Encapsulate overlay, container, header, error banner, footer buttons
  - Replace in ItemsPage, CategoriesPage, SuppliersPage, UsersPage
  Result: 4 modals become 4 <Modal> usages, one place to style

Step 4 — Create <LoadingSpinner>
  - Move the spinner div and @keyframes into the component
  - Replace in all pages
  Result: @keyframes no longer leaks from Dashboard

Step 5 — Create <Badge>
  - Unify badgeActive, badgeInactive, role badges into variants
  Result: one place to change what any badge looks like

Step 6 — Create <RowActions>
  - Add delete confirmation
  Result: delete is safe everywhere, button style consistent

Step 7 — Create <DataTable>
  - Wrap table shell, remove per-page row hover handlers
  - Add empty state
  Result: tables consistent, empty state everywhere

Step 8 — Replace alert() with toast
  - Install/use sonner (already in project)
  Result: no more blocking alerts
```

---

## 6. File Map After Refactor

```
resources/js/
├── lib/
│   └── styles.ts          ← SINGLE SOURCE for all colors, spacing, base styles
├── components/
│   ├── Layout.tsx          ← uses colors from styles.ts, Link instead of <a>
│   └── ui/
│       ├── Modal.tsx       ← used by all CRUD pages
│       ├── FormInput.tsx   ← used everywhere a text/password/number input appears
│       ├── FormSelect.tsx  ← used everywhere a <select> appears
│       ├── DataTable.tsx   ← used by all 5 pages
│       ├── RowActions.tsx  ← used by all table pages
│       ├── Badge.tsx       ← used by Items, Users, Inventory pages
│       ├── LoadingSpinner.tsx
│       └── PageHeader.tsx
└── pages/
    ├── DashboardPage.tsx   ← uses DataTable, Badge, Link
    ├── InventoryPage.tsx   ← uses DataTable, Badge, FormInput
    ├── ItemsPage.tsx       ← uses Modal, DataTable, RowActions, FormInput, FormSelect
    ├── CategoriesPage.tsx  ← uses Modal, DataTable, RowActions, FormInput
    ├── SuppliersPage.tsx   ← uses Modal, DataTable, RowActions, FormInput
    └── UsersPage.tsx       ← uses Modal, DataTable, RowActions, FormInput, Badge
```

**After this refactor:** changing button padding, border-radius, accent color, or modal layout
is a single-line edit in one file that propagates to the entire app automatically.

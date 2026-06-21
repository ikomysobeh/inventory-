# Frontend Implementation Guide — Restaurant Inventory Management System

> React 18 + Vite + TypeScript  
> TanStack Query · Zustand · React Router v6 · Axios  
> Dark Theme "Clean Kitchen" Design System  
> Date: 2026-06-07

---

## Project Structure

```
resources/js/
├── app.tsx                    # Main app entry point with routing
├── stores/
│   └── authStore.ts          # Zustand auth state with localStorage persistence
├── lib/
│   └── api.ts                # Axios instance with auth interceptors
├── components/
│   ├── Layout.tsx            # Header + Navigation + Content wrapper
│   ├── ProtectedRoute.tsx     # Route guard for auth + roles
│   └── (future: UI components)
├── pages/
│   ├── LoginPage.tsx          # ✅ DONE - Employee login
│   ├── DashboardPage.tsx      # ✅ DONE - Manager dashboard (basic)
│   ├── InventoryPage.tsx      # 🔄 TODO - Employee checklist
│   ├── ItemsPage.tsx          # 🔄 TODO - Manager item CRUD
│   ├── CategoriesPage.tsx     # 🔄 TODO - Manager category CRUD
│   ├── SuppliersPage.tsx      # 🔄 TODO - Manager supplier CRUD
│   └── UsersPage.tsx          # 🔄 TODO - Manager user CRUD
├── hooks/
│   └── (future: custom React hooks)
├── types/
│   └── (future: TypeScript types)
└── routes/
    └── (future: route definitions)
```

---

## ✅ COMPLETED: Phase 1 — Foundation & Auth

### 1.1 Project Setup (`app.tsx`)
- ✅ React Router v6 with BrowserRouter
- ✅ React Query QueryClientProvider
- ✅ Auth store initialization with `initAuth()` on app load
- ✅ ProtectedRoute wrapper for auth + role checks
- ✅ Route guards redirect unauthenticated users to /login

**Code Location:** [resources/js/app.tsx](resources/js/app.tsx)

### 1.2 Auth Store (`stores/authStore.ts`)
- ✅ Zustand store with persist middleware
- ✅ State: user, token, isLoading, isAuthenticated
- ✅ Actions: login(), logout(), setUser(), setToken(), me()
- ✅ Persist to localStorage
- ✅ initAuth() restores state on app startup

**Key Features:**
```typescript
// Persist middleware saves to localStorage
const authStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      login: async (email, password) => { ... },
      logout: async () => { ... },
      setUser: (user) => { ... },
      setToken: (token) => { ... },
      me: async () => { ... },
      initAuth: () => { ... },
    }),
    { name: 'auth-storage' }
  )
)
```

**Code Location:** [resources/js/stores/authStore.ts](resources/js/stores/authStore.ts)

### 1.3 API Instance (`lib/api.ts`)
- ✅ Axios instance with VITE_API_URL base URL
- ✅ Token auto-injection in Authorization header
- ✅ 401 interceptor: clear auth → redirect to /login
- ✅ 403 interceptor: show error message

**Code Location:** [resources/js/lib/api.ts](resources/js/lib/api.ts)

### 1.4 ProtectedRoute Component (`components/ProtectedRoute.tsx`)
- ✅ Checks isAuthenticated before rendering page
- ✅ Checks requiredRole if specified
- ✅ Redirects to /login if not authenticated
- ✅ Redirects to /inventory if employee tries manager route
- ✅ Shows loading state while auth is initializing

**Code Location:** [resources/js/components/ProtectedRoute.tsx](resources/js/components/ProtectedRoute.tsx)

---

## ✅ COMPLETED: Phase 2 — Layout & Navigation

### 2.1 Layout Component (`components/Layout.tsx`)
- ✅ Dark theme header with white title + orange accent
- ✅ Red Logout button with hover effect
- ✅ Navigation bar with active link highlighting
- ✅ Manager shows all menu items, employee shows limited
- ✅ All styling via inline styles for dark "Clean Kitchen" theme

**Color Palette:**
- Background: #0f1117 (very dark slate)
- Cards: #1e2333 (dark slate)
- Header/Nav: #1a1f2e (darker slate)
- Borders: #2e3549 (subtle gray)
- Text: #f0f2f8 (bright white)
- Secondary Text: #8892a4 (gray)
- Accent: #f97316 (orange)
- Hover Accent: #fb923c (lighter orange)
- Red: #ef4444 (status/destructive)

**Code Location:** [resources/js/components/Layout.tsx](resources/js/components/Layout.tsx)

---

## ✅ COMPLETED: Phase 3 — Authentication Pages

### 3.1 LoginPage (`pages/LoginPage.tsx`)
**Visual Design:**
- Dark background (#0f1117) with radial dot-grid pattern
- Centered card (#1e2333) with subtle border
- Flame emoji (🔥) + "Restaurant" white title + "Inventory" orange accent
- Dark input fields with orange focus glow
- Orange button with arrow (→)
- Demo credentials display card
- API connection info card

**Functionality:**
- ✅ Email + password fields with inline dark styling
- ✅ Login via authStore.login()
- ✅ Error messages displayed in red box
- ✅ Loading spinner during request
- ✅ Auto-redirect based on role (manager → /dashboard, employee → /inventory)

**Code Location:** [resources/js/pages/LoginPage.tsx](resources/js/pages/LoginPage.tsx)

**Example Login:** manager@restaurant.local / password

---

## ✅ COMPLETED: Phase 4 — Manager Dashboard (Basic)

### 4.1 DashboardPage (`pages/DashboardPage.tsx`)
**Visual Design:**
- Greeting header with current date
- 3 stat cards in responsive grid:
  - **Total Items**: Shows count, emoji 📦
  - **Low Stock**: Red left border, red text count, emoji 🔴
  - **Last Count**: Orange text, emoji 📅
- Quick action cards (4 items):
  - Count Inventory → /inventory
  - Manage Items → /items
  - Categories → /categories
  - Suppliers → /suppliers
- All with orange arrows that move on hover

**Functionality:**
- ✅ Fetches dashboard summary via TanStack Query
- ✅ Displays stats from API
- ✅ Loading spinner while fetching
- ✅ All styling via inline styles

**Code Location:** [resources/js/pages/DashboardPage.tsx](resources/js/pages/DashboardPage.tsx)

**Status:** Basic implementation complete. Still need to add:
- [ ] Low-stock alert table
- [ ] Export buttons (CSV, PDF)
- [ ] Shopping list link

---

## 🔄 IN PROGRESS / TODO

### Phase 5 — Employee Inventory Checklist

**File:** `pages/InventoryPage.tsx`

**What to Build:**
1. Fetch checklist from `/api/inventory` (TanStack Query)
2. Group items by category (collapsible sections)
3. Display each item with:
   - Item name
   - Restaurant qty input (inputmode="numeric")
   - Office qty input (inputmode="numeric")
   - Unit display
   - Red 🔴 badge if low stock (total qty < par_level)
4. Progress bar: "X of Y items filled" (qty > 0 in either field)
5. Auto-save:
   - Debounce 2 seconds after last change
   - Collect all changed entries
   - POST to `/api/inventory/save`
   - Show "Saving..." indicator
6. Manual save button at bottom
7. Success/error toasts
8. Loading skeleton while fetching

**Styling:**
- Use inline styles like DashboardPage
- Dark card background for each category section
- Input fields: dark background, white text, orange focus
- Number inputs: min 44px height, font size 18px+
- Progress bar: orange gradient fill

**Implementation Pattern:**
```typescript
// 1. Create API function
export async function getChecklist(date?: string) {
  const response = await api.get('/inventory', { params: { date } });
  return response.data.data;
}

// 2. Use in component
const { data: checklist } = useQuery({
  queryKey: ['inventory', selectedDate],
  queryFn: () => getChecklist(selectedDate),
});

// 3. Handle auto-save
const debouncedSave = useMemo(
  () => debounce(async (entries) => {
    await saveInventoryEntries(entries);
  }, 2000),
  []
);

// 4. Build UI with inline styles
const styles = { ... };
```

---

### Phase 6 — Manager Items CRUD

**Files:** 
- `pages/ItemsPage.tsx` - List view with search/filter
- `pages/ItemFormPage.tsx` - Create/edit form

**What to Build:**

**ItemsPage:**
1. Search box (search by name)
2. Filters:
   - Category dropdown
   - Supplier dropdown
   - Status: Active / Inactive toggle
3. Table/list view showing:
   - Item name
   - Category badge
   - Supplier name
   - Unit
   - Par level
   - Active/Inactive badge
4. Edit button → navigate to /items/:id/edit
5. Deactivate button → confirm dialog → API call
6. Add Item button → navigate to /items/new
7. Loading skeleton + empty state

**ItemFormPage (shared for create/edit):**
1. Form fields:
   - Name (text, required)
   - Full Name (text, optional)
   - Category (dropdown, required)
   - Supplier (dropdown, optional)
   - Unit (text input)
   - Par Level (number input)
   - Notes (textarea)
   - Active toggle
2. Create: POST /api/items → success toast → redirect to /items
3. Edit: PUT /api/items/:id → success toast
4. Validation errors shown inline
5. Cancel button → go back
6. Loading state on submit

**Styling:** Same dark theme, inline styles

---

### Phase 7 — Manager Shopping List

**File:** `pages/ShoppingListPage.tsx`

**What to Build:**
1. Fetch shopping list from `/api/dashboard/shopping-list` (TanStack Query)
2. Group items by supplier
3. Each supplier section:
   - Header: Supplier Name + item count badge
   - Items: name + qty_needed + unit
4. "No Supplier" section at bottom for unassigned items
5. Buttons:
   - Export PDF → GET `/api/dashboard/shopping-list/pdf` → download
   - Export CSV → GET `/api/dashboard/export-csv` → download
6. Empty state: "All items well stocked 🎉"
7. Loading skeleton

**Styling:** Same dark theme

---

### Phase 8 — Manager Master Data (Categories, Suppliers, Users)

**CategoriesPage.tsx:**
1. List all categories with: icon, name, color swatch, sort_order, item count
2. Buttons on each row: Edit, Delete
3. Add button → modal form
4. Edit modal: name, icon, color, sort_order
5. Delete: confirm dialog → show error if items linked

**SuppliersPage.tsx:**
1. List all suppliers: name, phone, notes, item count
2. Add/Edit modal: name, phone, notes
3. Delete: confirm dialog → show error if items linked

**UsersPage.tsx:**
1. List all users: name, email, role badge, is_active toggle
2. Add modal: name, email, password, password_confirm, role
3. Edit modal: name, email, role, is_active
4. Reset Password modal: new password, password_confirm
5. Delete: confirm dialog before deactivating

**Styling:** Same dark theme with modal dialogs

---

### Phase 9 — Polish & Mobile

**Remaining Tasks:**
- [ ] Implement all loading skeletons (not just spinners)
- [ ] Implement all empty states with messaging
- [ ] Confirm dialogs on destructive actions
- [ ] Toast notifications (success/error/info)
- [ ] Mobile responsive adjustments
- [ ] Input validation on frontend
- [ ] Test on real devices

---

## Design System Details

### Color Palette (Established)

**Backgrounds:**
- Primary: `#0f1117` - Page background
- Card: `#1e2333` - Card backgrounds
- Input: `#252b3b` - Input field background
- Hover: `#2a3045` - Hover states
- Subtle: `#1a1f2e` - Header/nav background

**Borders:**
- Strong: `#3d4666` - Primary borders
- Subtle: `#2e3549` - Secondary borders

**Text:**
- Primary: `#f0f2f8` - Main text
- Secondary: `#8892a4` - Labels, helper text
- Tertiary: `#4e5770` - Disabled text

**Accent Colors:**
- Orange Primary: `#f97316`
- Orange Hover: `#fb923c`
- Orange Light (bg): `#7c3a0f`
- Red Status: `#ef4444`
- Red BG: `#450a0a`
- Green Status: `#22c55e`
- Green BG: `#052e16`
- Amber Status: `#f59e0b`
- Amber BG: `#451a03`

### Typography

**Font Families:**
- Body: `'DM Sans', system-ui, sans-serif`
- Mono: `'DM Mono', monospace` (for numbers, quantities)

**Font Sizes & Weights:**
- Page Title: 30px, bold
- Card Label: 10px, bold, uppercase, 0.1em letter-spacing
- Card Value: 36px, bold, monospace
- Button: 16px, 600 weight
- Input: 14px

### Component Sizing

**Minimum Touch Targets:**
- Inputs: min-height 44px
- Buttons: min-height 48-56px
- Number inputs: font-size 18px+

**Spacing Scale:**
- Extra small: 4px
- Small: 8px
- Medium: 12px
- Large: 16px
- Extra large: 24px
- 2XL: 32px
- 3XL: 48px

### Animations

**Applied:**
- Input focus glow (orange)
- Button hover (background color change)
- Loading spinner (rotate)
- Link hover (color transition)

---

## Implementation Patterns

### Using Inline Styles

All new pages should follow the LoginPage/DashboardPage pattern:

```typescript
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  card: {
    backgroundColor: '#1e2333',
    border: '1px solid #2e3549',
    borderRadius: '12px',
    padding: '20px',
  },
  // ... more style objects
};

// Use in JSX
<div style={styles.container}>
  <div style={styles.card}>
    Content
  </div>
</div>
```

### Using TanStack Query

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['itemId', id],
  queryFn: () => getItem(id),
});

if (isLoading) return <LoadingSkeletonComponent />;
if (error) return <ErrorComponent message={error.message} />;
if (!data) return <EmptyStateComponent />;

return <div>{ /* content */ }</div>;
```

### Auto-save Pattern (InventoryPage)

```typescript
const debouncedSave = useMemo(
  () => debounce(async (entries) => {
    setIsSaving(true);
    try {
      await saveInventoryEntries(entries);
      showToast('success', 'Saved successfully');
    } catch (err) {
      showToast('error', 'Save failed', () => retry());
    } finally {
      setIsSaving(false);
    }
  }, 2000),
  []
);

// When user changes input
const handleQuantityChange = (itemId, field, value) => {
  setEntries(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
  debouncedSave(Object.values(entries));
};
```

---

## Environment Setup

**.env.local:**
```
VITE_API_URL=http://127.0.0.1:8000/api
```

**Dev Server:**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Build:**
```bash
npm run build
# Output in dist/
```

---

## Testing Checklist

Before marking a page complete:
- [ ] Component renders without errors
- [ ] Loading state shows correctly
- [ ] Data fetches and displays
- [ ] Dark theme colors apply correctly
- [ ] All interactive elements work (buttons, inputs, links)
- [ ] Form validation shows error messages
- [ ] API calls go to correct endpoints
- [ ] Success/error toasts appear
- [ ] Mobile responsive (landscape + portrait)
- [ ] All inputs have min 44px height
- [ ] Number inputs use inputmode="numeric"

---

## Next Steps (Priority Order)

1. **HIGH PRIORITY:** Build InventoryPage (employee checklist)
   - This is the main feature employees use daily
   - Required for end-to-end testing

2. **HIGH PRIORITY:** Build ItemsPage + ItemFormPage
   - Manager needs to manage inventory items
   - Changes affect checklist immediately

3. **MEDIUM:** Build Shopping List page
   - Grouping by supplier is important
   - Export functions needed

4. **MEDIUM:** Build master data pages (Categories, Suppliers, Users)
   - Complete manager feature set

5. **LOW:** Polish, animations, PWA setup
   - Quality of life improvements
   - Not blocking core functionality

---

## Debugging Tips

### Auth Issues
- Check `localStorage` for 'auth-storage' key
- Verify token in Axios Authorization header (DevTools → Network)
- Check console logs with 🔐 emoji prefix

### API Issues
- Verify backend running on port 8000
- Check VITE_API_URL in .env.local
- Check browser Network tab for failed requests
- Verify 401/403 interceptors working

### Styling Issues
- Check inline styles are being applied (DevTools → Inspect)
- Verify hex color values (#xxxxxx format)
- Check flexbox/grid is rendering correctly
- Use DevTools computed styles to verify cascading

---

## Resources

- React Docs: https://react.dev
- TanStack Query: https://tanstack.com/query
- Zustand: https://github.com/pmndrs/zustand
- React Router: https://reactrouter.com
- Axios: https://axios-http.com

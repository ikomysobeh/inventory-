# Implementation Tasks — Restaurant Inventory Management System

> Laravel 13 (API) · React 18 + Vite (Frontend) · MySQL · Tailwind CSS  
> Two roles: Manager (admin) · Employee  
> Mobile-first — employees use phones to count stock  
> Date: 2026-06-07

---

## Overview

This document defines all backend and frontend implementation tasks. Follow the same clean architecture throughout:

**Key Principles:**
- Controllers: validation dispatch + response only — no business logic
- Services: all business logic lives here
- API Resources: all response formatting goes through Resources
- Form Requests: all validation rules defined here
- Transactions for any multi-step DB operations
- No raw queries in controllers or models where a service can own it

**Business Rules (Locked):**
- Two roles only: `manager` and `employee`. Manager is the admin.
- Each item has two quantity fields per day: `qty_restaurant` and `qty_office`.
- One inventory entry per item per day (upsert on save).
- Par level is the combined minimum (Restaurant + Office total).
- Shopping list need = `par_level - (qty_restaurant + qty_office)`. If ≤ 0, item is fine.
- Manager can edit unit on any item at any time — takes effect immediately on checklist.
- CSV export uses Laravel `StreamedResponse` — no extra package.
- PDF export uses `barryvdh/laravel-dompdf`.
- Employee cannot access any manager route.

---

## Phase 1: Schema & Migrations (Backend)

- [ ] 1.1 Create migration for `users`
  - [ ] Columns: id, name, email(unique), password, role(enum: manager/employee, default employee), is_active(bool default true), timestamps
  - [ ] Add index on email and role

- [ ] 1.2 Create migration for `suppliers`
  - [ ] Columns: id, name, phone(nullable), notes(nullable), is_active(bool default true), timestamps
  - [ ] Add index on name

- [ ] 1.3 Create migration for `categories`
  - [ ] Columns: id, name, icon(varchar 10, nullable), color(varchar 20, nullable), sort_order(int default 0), is_active(bool default true), timestamps
  - [ ] Add index on sort_order

- [ ] 1.4 Create migration for `items`
  - [ ] Columns: id, name, full_name(nullable), category_id(FK), supplier_id(FK nullable), unit(varchar 50, nullable), par_level(decimal 10,2 nullable), notes(nullable), sort_order(int default 0), is_active(bool default true), timestamps
  - [ ] FK: category_id → categories.id
  - [ ] FK: supplier_id → suppliers.id (nullable)
  - [ ] Add indexes on category_id, supplier_id, is_active

- [ ] 1.5 Create migration for `inventory_entries`
  - [ ] Columns: id, item_id(FK), entry_date(date), qty_restaurant(decimal 10,2 default 0), qty_office(decimal 10,2 default 0), entered_by(FK users), notes(nullable), timestamps
  - [ ] FK: item_id → items.id
  - [ ] FK: entered_by → users.id
  - [ ] UNIQUE KEY on (item_id, entry_date) — one entry per item per day
  - [ ] Add index on entry_date

- [ ] 1.6 Run migrations on clean DB
  - [ ] Verify all constraints, FKs, unique keys
  - [ ] Confirm schema matches scope exactly

**Definition of Done:** All 5 tables migrated cleanly with correct constraints and indexes.

---

## Phase 2: Models & Relationships (Backend)

- [ ] 2.1 Create/update `User` model
  - [ ] Fillable: name, email, password, role, is_active
  - [ ] Cast: is_active → boolean, role → string
  - [ ] Relationship: hasMany inventoryEntries

- [ ] 2.2 Create `Supplier` model
  - [ ] Fillable: name, phone, notes, is_active
  - [ ] Cast: is_active → boolean
  - [ ] Relationship: hasMany items

- [ ] 2.3 Create `Category` model
  - [ ] Fillable: name, icon, color, sort_order, is_active
  - [ ] Cast: is_active → boolean, sort_order → integer
  - [ ] Relationship: hasMany items
  - [ ] Default scope: orderBy sort_order

- [ ] 2.4 Create `Item` model
  - [ ] Fillable: name, full_name, category_id, supplier_id, unit, par_level, notes, sort_order, is_active
  - [ ] Casts: is_active → boolean, par_level → decimal, sort_order → integer
  - [ ] Relationships: belongsTo category, belongsTo supplier, hasMany inventoryEntries
  - [ ] Scope: scopeActive() → where is_active = true

- [ ] 2.5 Create `InventoryEntry` model
  - [ ] Fillable: item_id, entry_date, qty_restaurant, qty_office, entered_by, notes
  - [ ] Casts: qty_restaurant → decimal, qty_office → decimal, entry_date → date
  - [ ] Relationships: belongsTo item, belongsTo enteredBy(User)

- [ ] 2.6 Verify relationships in tinker
  - [ ] Eager loading works for all relationships
  - [ ] Relationship names consistent with Resources

**Definition of Done:** All models are consistent, related, and query-safe.

---

## Phase 3: Seeders (Backend)

- [ ] 3.1 Create `CategorySeeder`
  - [ ] Seed all 10 categories from scope with icon and color
  - [ ] Vegetables & Produce 🥦, Fruits 🍋, Canned & Jarred Items 🥫, Raw Meat 🥩, Dairy & Pantry 🧀, Grains & Dry Goods 🌾, Bread 🫓, Oils & Liquids 🫙, Drinks 🥤, Packaging & Supplies 📦
  - [ ] Set sort_order 1–10

- [ ] 3.2 Create `SupplierSeeder`
  - [ ] Seed all 13 suppliers from scope: Sysco, Sam's Club, Arabic Store (Silwady), Saad Wholesale Meat, Atlantic Food, Banyan Food Service, Web Restaurant, Restaurant Depot, Kroger, Costco, Amazon, ARYZ Wholesale, AlShams Bakery MI

- [ ] 3.3 Create `ItemSeeder`
  - [ ] Seed all items from the General sheet of Master_Inventory.xlsx
  - [ ] Map each item to correct category and supplier
  - [ ] Set unit per item (Case, LB, Bag, Bottle, etc.)
  - [ ] Set par_level from the "Must Have" column where available
  - [ ] Set sort_order within each category

- [ ] 3.4 Create `UserSeeder`
  - [ ] Seed one default manager account (email + password from .env)
  - [ ] Do not seed employee accounts (created by manager via UI)

- [ ] 3.5 Register all seeders in `DatabaseSeeder`
  - [ ] Run in correct order: Categories → Suppliers → Items → Users
  - [ ] Verify `php artisan db:seed` runs clean with no errors

**Definition of Done:** `php artisan db:seed` populates all master data from the Excel source.

---

## Phase 4: Form Requests (Backend)

- [ ] 4.1 Create `LoginRequest`
  - [ ] Rules: email(required, email), password(required, string)

- [ ] 4.2 Create `SaveInventoryRequest`
  - [ ] Accepts array of entries: `entries[]`
  - [ ] Each entry: item_id(required, exists:items,id), qty_restaurant(required, numeric, min:0), qty_office(required, numeric, min:0), notes(nullable, string, max:500)

- [ ] 4.3 Create `StoreItemRequest`
  - [ ] Rules: name(required, string, max:200), full_name(nullable, string, max:300), category_id(required, exists:categories,id), supplier_id(nullable, exists:suppliers,id), unit(nullable, string, max:50), par_level(nullable, numeric, min:0), notes(nullable, string), sort_order(nullable, integer, min:0), is_active(nullable, boolean)

- [ ] 4.4 Create `UpdateItemRequest`
  - [ ] Same rules as StoreItemRequest but all fields nullable (partial update allowed)

- [ ] 4.5 Create `StoreCategoryRequest`
  - [ ] Rules: name(required, string, max:100, unique:categories,name), icon(nullable, string, max:10), color(nullable, string, max:20), sort_order(nullable, integer, min:0)

- [ ] 4.6 Create `UpdateCategoryRequest`
  - [ ] Rules: name(nullable, string, max:100, unique:categories,name ignore current), icon(nullable), color(nullable), sort_order(nullable, integer)

- [ ] 4.7 Create `StoreSupplierRequest`
  - [ ] Rules: name(required, string, max:150, unique:suppliers,name), phone(nullable, string, max:50), notes(nullable, string)

- [ ] 4.8 Create `UpdateSupplierRequest`
  - [ ] Same as StoreSupplierRequest but name unique ignores current record

- [ ] 4.9 Create `StoreUserRequest`
  - [ ] Rules: name(required, string, max:100), email(required, email, unique:users,email), password(required, string, min:8, confirmed), role(required, in:manager,employee)

- [ ] 4.10 Create `UpdateUserRequest`
  - [ ] Rules: name(nullable, string), email(nullable, email, unique ignore current), is_active(nullable, boolean), role(nullable, in:manager,employee)

- [ ] 4.11 Create `ResetPasswordRequest`
  - [ ] Rules: password(required, string, min:8, confirmed)

**Definition of Done:** All create/update inputs validated via Form Requests only — no validation in controllers.

---

## Phase 5: Service Layer (Backend)

- [ ] 5.1 Create `AuthService` — `app/Services/AuthService.php`
  - [ ] `login(email, password)` → validate credentials, return Sanctum token + user data
  - [ ] `logout(user)` → revoke current token
  - [ ] `me(user)` → return user with role

- [ ] 5.2 Create `InventoryService` — `app/Services/InventoryService.php`
  - [ ] `getChecklist(date)` → return all active items with today's qty_restaurant, qty_office, grouped by category ordered by sort_order
  - [ ] `saveEntries(userId, entries[], date)` → upsert inventory_entries for today using transaction; one row per item per day
  - [ ] `getHistory(itemId, days)` → return daily entries for the last N days for trend view

- [ ] 5.3 Create `DashboardService` — `app/Services/DashboardService.php`
  - [ ] `getSummary()` → return: total active items count, low-stock count (items where qty_restaurant + qty_office < par_level), last entry date
  - [ ] `getLowStock()` → return items where (qty_restaurant + qty_office) < par_level, include rest/office/par/need values, sorted by shortage amount descending
  - [ ] `getShoppingList()` → return low-stock items grouped by supplier, each item includes need quantity and unit
  - [ ] `exportCsv()` → return StreamedResponse with all active items and today's quantities: Item, Full Name, Category, Supplier, Unit, Par Level, Restaurant Qty, Office Qty, Total Qty, Status (OK/LOW), Date
  - [ ] `exportShoppingListPdf()` → return DomPDF download response, shopping list grouped by supplier

- [ ] 5.4 Create `ItemService` — `app/Services/ItemService.php`
  - [ ] `getAll(filters)` → paginated list, filterable by category_id, supplier_id, is_active, search(name)
  - [ ] `getById(id)` → single item with category and supplier
  - [ ] `create(data)` → create item, return ItemResource
  - [ ] `update(item, data)` → update item including unit and par_level, return ItemResource
  - [ ] `deactivate(item)` → set is_active = false (never hard delete)

- [ ] 5.5 Create `CategoryService` — `app/Services/CategoryService.php`
  - [ ] `getAll()` → all active categories ordered by sort_order
  - [ ] `create(data)` → create category
  - [ ] `update(category, data)` → update including sort_order
  - [ ] `delete(category)` → block deletion if category has active items linked; return error message

- [ ] 5.6 Create `SupplierService` — `app/Services/SupplierService.php`
  - [ ] `getAll()` → all active suppliers ordered by name
  - [ ] `create(data)` → create supplier
  - [ ] `update(supplier, data)` → update supplier
  - [ ] `delete(supplier)` → block if supplier has active items linked

- [ ] 5.7 Create `UserService` — `app/Services/UserService.php`
  - [ ] `getAll()` → all users, filterable by role and is_active
  - [ ] `create(data)` → create user with hashed password
  - [ ] `update(user, data)` → update name, email, role, is_active
  - [ ] `resetPassword(user, newPassword)` → hash and save new password, revoke all tokens

**Definition of Done:** All business logic lives in services. Zero business logic in controllers.

---

## Phase 6: API Resources (Backend)

- [ ] 6.1 Create `UserResource`
  - [ ] Fields: id, name, email, role, is_active, created_at
  - [ ] Never expose password

- [ ] 6.2 Create `SupplierResource`
  - [ ] Fields: id, name, phone, notes, is_active

- [ ] 6.3 Create `CategoryResource`
  - [ ] Fields: id, name, icon, color, sort_order, is_active

- [ ] 6.4 Create `ItemResource`
  - [ ] Fields: id, name, full_name, unit, par_level, notes, sort_order, is_active
  - [ ] Include: category (CategoryResource), supplier (SupplierResource, nullable)

- [ ] 6.5 Create `InventoryEntryResource`
  - [ ] Fields: id, item_id, entry_date, qty_restaurant, qty_office, notes, entered_by(name only)

- [ ] 6.6 Create `ChecklistItemResource`
  - [ ] Fields: item_id, name, full_name, unit, par_level, qty_restaurant, qty_office, is_low_stock(bool: total < par_level)
  - [ ] Grouped by category in the response

- [ ] 6.7 Create `DashboardSummaryResource`
  - [ ] Fields: total_items, low_stock_count, last_entry_date

- [ ] 6.8 Create `LowStockItemResource`
  - [ ] Fields: item_id, name, unit, par_level, qty_restaurant, qty_office, qty_total, qty_needed, category(name), supplier(name, nullable)

- [ ] 6.9 Create `ShoppingListResource`
  - [ ] Grouped structure: supplier_name → [ { item_name, unit, qty_needed } ]
  - [ ] Items with no supplier grouped under "No Supplier"

**Definition of Done:** Every API response is formatted through a Resource — no raw array returns.

---

## Phase 7: Controllers & Routes (Backend)

- [ ] 7.1 Create `AuthController`
  - [ ] `POST /api/auth/login` → LoginRequest → AuthService::login
  - [ ] `POST /api/auth/logout` → AuthService::logout (auth:sanctum)
  - [ ] `GET  /api/auth/me` → AuthService::me (auth:sanctum)

- [ ] 7.2 Create `InventoryController`
  - [ ] `GET  /api/inventory` → InventoryService::getChecklist (auth:sanctum)
  - [ ] `POST /api/inventory/save` → SaveInventoryRequest → InventoryService::saveEntries (auth:sanctum)
  - [ ] `GET  /api/inventory/history` → InventoryService::getHistory (auth:sanctum, manager only)

- [ ] 7.3 Create `DashboardController` (manager only)
  - [ ] `GET /api/dashboard` → DashboardService::getSummary
  - [ ] `GET /api/dashboard/low-stock` → DashboardService::getLowStock
  - [ ] `GET /api/dashboard/shopping-list` → DashboardService::getShoppingList
  - [ ] `GET /api/dashboard/shopping-list/pdf` → DashboardService::exportShoppingListPdf
  - [ ] `GET /api/dashboard/export-csv` → DashboardService::exportCsv

- [ ] 7.4 Create `ItemController` (manager only)
  - [ ] `GET    /api/items` → ItemService::getAll (with filters)
  - [ ] `POST   /api/items` → StoreItemRequest → ItemService::create
  - [ ] `GET    /api/items/{id}` → ItemService::getById
  - [ ] `PUT    /api/items/{id}` → UpdateItemRequest → ItemService::update
  - [ ] `DELETE /api/items/{id}` → ItemService::deactivate

- [ ] 7.5 Create `CategoryController` (manager only)
  - [ ] `GET    /api/categories` → CategoryService::getAll
  - [ ] `POST   /api/categories` → StoreCategoryRequest → CategoryService::create
  - [ ] `PUT    /api/categories/{id}` → UpdateCategoryRequest → CategoryService::update
  - [ ] `DELETE /api/categories/{id}` → CategoryService::delete

- [ ] 7.6 Create `SupplierController` (manager only)
  - [ ] `GET    /api/suppliers` → SupplierService::getAll
  - [ ] `POST   /api/suppliers` → StoreSupplierRequest → SupplierService::create
  - [ ] `PUT    /api/suppliers/{id}` → UpdateSupplierRequest → SupplierService::update
  - [ ] `DELETE /api/suppliers/{id}` → SupplierService::delete

- [ ] 7.7 Create `UserController` (manager only)
  - [ ] `GET    /api/users` → UserService::getAll
  - [ ] `POST   /api/users` → StoreUserRequest → UserService::create
  - [ ] `PUT    /api/users/{id}` → UpdateUserRequest → UserService::update
  - [ ] `POST   /api/users/{id}/reset-password` → ResetPasswordRequest → UserService::resetPassword

- [ ] 7.8 Create `ManagerMiddleware`
  - [ ] Check auth user role === 'manager'
  - [ ] Return 403 if employee tries to reach manager routes
  - [ ] Apply to: dashboard, items, categories, suppliers, users routes

- [ ] 7.9 Register all routes in `api.php`
  - [ ] Auth routes: public (login), protected (logout, me)
  - [ ] Inventory routes: auth:sanctum (all roles)
  - [ ] Manager routes: auth:sanctum + manager middleware

**Definition of Done:** All routes registered, controllers thin, middleware protecting manager-only endpoints.

---

## Phase 8: Feature Tests (Backend)

- [ ] 8.1 `AuthApiTest`
  - [ ] Login with valid credentials → returns token + user
  - [ ] Login with wrong password → 401
  - [ ] Logout invalidates token
  - [ ] Me returns correct user data

- [ ] 8.2 `InventoryApiTest`
  - [ ] Employee can GET checklist → returns all active items grouped by category
  - [ ] Checklist includes today's quantities if entry exists
  - [ ] Checklist returns 0 quantities if no entry yet for today
  - [ ] Employee can POST save entries → upsert works correctly
  - [ ] Saving same item twice today → updates existing entry (no duplicate)
  - [ ] is_low_stock flag is correct when total < par_level

- [ ] 8.3 `DashboardApiTest`
  - [ ] Employee cannot access /api/dashboard → 403
  - [ ] Manager can GET dashboard summary → correct counts
  - [ ] Low-stock list only includes items below par level
  - [ ] Shopping list grouped by supplier
  - [ ] Items with no supplier appear under "No Supplier"
  - [ ] CSV export returns correct headers and row data
  - [ ] PDF export returns a downloadable response

- [ ] 8.4 `ItemApiTest`
  - [ ] Employee cannot access /api/items → 403
  - [ ] Manager can create item with all fields
  - [ ] Manager can update item unit → unit changes immediately
  - [ ] Manager can deactivate item → item disappears from checklist
  - [ ] Cannot hard delete an item

- [ ] 8.5 `CategoryApiTest`
  - [ ] Manager can create / update / reorder categories
  - [ ] Cannot delete category that has active items linked → returns error
  - [ ] Can delete category with no items

- [ ] 8.6 `SupplierApiTest`
  - [ ] Manager can create / update suppliers
  - [ ] Cannot delete supplier linked to active items

- [ ] 8.7 `UserApiTest`
  - [ ] Manager can create employee and manager accounts
  - [ ] Manager can deactivate a user
  - [ ] Manager can reset password → old tokens revoked
  - [ ] Employee cannot access /api/users → 403

- [ ] 8.8 Run full test suite
  - [ ] `php artisan test`
  - [ ] All tests pass with no warnings

**Definition of Done:** Full feature and security test coverage passing.

---

## Phase 9: Frontend Foundation (React)

- [x] 9.1 Initialize React + Vite project
  - [x] Install Tailwind CSS v4
  - [x] Install TanStack Query, Zustand, React Hook Form, React Router v6, Axios

- [x] 9.2 Setup Axios instance
  - [x] Base URL from `VITE_API_URL` environment variable
  - [x] Attach token from Zustand store on every request
  - [x] Intercept 401 → clear store → redirect to login
  - [x] Intercept 403 → show error message

- [x] 9.3 Setup Zustand `authStore`
  - [x] State: user(id, name, role), token, isAuthenticated, isLoading
  - [x] Actions: login(email, password), logout(), setUser(), setToken(), me()
  - [x] Persist to localStorage with middleware
  - [x] initAuth() function to restore auth on app startup

- [x] 9.4 Setup TanStack Query `QueryClientProvider`
  - [x] Default staleTime: 30 seconds
  - [x] Default retry: 1

- [x] 9.5 Setup React Router with routing
  - [x] Public routes: /login
  - [x] Protected employee routes: /inventory
  - [x] Protected manager routes: /dashboard, /items, /categories, /suppliers, /users
  - [x] Guard: if not authenticated → redirect to /login
  - [x] Guard: if employee tries manager route → redirect to /inventory

- [x] 9.6 Create `Layout.jsx` with dark theme
  - [x] Header: white title + user name + red logout button
  - [x] Navigation: dark background with orange active indicators
  - [x] Manager role shows all menu items, employee shows limited
  - [x] Inline styles for dark "Clean Kitchen" theme

- [x] 9.7 LoginPage with beautiful dark design
  - [x] Dark background with dot-grid pattern
  - [x] Card-based form with inline styles
  - [x] Orange "Inventory" accent title
  - [x] Demo credentials display
  - [x] Error message styling
  - [x] Loading state with spinner

- [x] 9.8 DashboardPage with stat cards
  - [x] Greeting header with current date
  - [x] Stat cards: Total Items, Low Stock (red border), Last Count (orange accent)
  - [x] Quick action cards with orange arrows
  - [x] All styling via inline styles for dark theme

**Definition of Done:** Project boots, routing works, auth store persists, shared components render correctly.

---

## Phase 10: Login Page (Frontend)

- [x] 10.1 Build `LoginPage.tsx`
  - [x] Email + password fields with inline dark styling
  - [x] Submit calls `POST /api/auth/login` via authStore
  - [x] On success: redirects based on role (manager → /dashboard, employee → /inventory)
  - [x] On error: shows inline error message with red styling
  - [x] Loading state with orange spinner on button
  - [x] Auto-redirect to home if already authenticated

**Definition of Done:** ✅ Login works end-to-end with beautiful dark design.

---

## Phase 11: Employee Checklist Page (Frontend)

- [ ] 11.1 Build `src/api/inventory.ts`
  - [ ] `getChecklist(date?)` → GET /api/inventory with TanStack Query
  - [ ] `saveEntries(entries[])` → POST /api/inventory/save

- [ ] 11.2 Build `InventoryPage.tsx`
  - [ ] Fetch checklist with TanStack Query on mount (today's date)
  - [ ] Show progress bar: X of Y items have been entered (qty > 0 in either field)
  - [ ] Render categories as collapsible sections (open by default)
  - [ ] Each category shows items with name, restaurant qty, office qty, unit
  - [ ] Number inputs use inputmode="numeric", min height 44px, font size 18px
  - [ ] Red 🔴 badge if is_low_stock === true (qty_restaurant + qty_office < par_level)
  - [ ] Auto-save debounced: collect changed entries, POST /api/inventory/save every 2 seconds
  - [ ] Show "Saving..." indicator while auto-save in flight
  - [ ] Manual Save button at bottom — always visible, triggers immediate save
  - [ ] Show success toast when save completes
  - [ ] Show error toast if save fails (with retry option)
  - [ ] Loading skeleton while checklist is fetching
  - [ ] Empty state if no active items
  - [ ] Apply dark theme with inline styles

**Definition of Done:** Employee can open checklist, enter quantities for all items, and save. Low-stock 🔴 shows correctly. Auto-save works.

---

## Phase 12: Manager Dashboard Page (Frontend)

- [x] 12.1 Build `src/api/dashboard.ts`
  - [x] `getDashboardSummary()` → GET /api/dashboard
  - [ ] `getLowStock()` → GET /api/dashboard/low-stock
  - [ ] `getShoppingList()` → GET /api/dashboard/shopping-list
  - [ ] `exportCsv()` → GET /api/dashboard/export-csv → trigger file download
  - [ ] `exportShoppingListPdf()` → GET /api/dashboard/shopping-list/pdf → trigger file download

- [x] 12.2 Build `DashboardPage.tsx` (Manager Dashboard)
  - [x] Summary cards: Total Items, Low Stock Items (red border), Last Entry Date
  - [x] Quick action cards with orange arrows linking to other manager pages
  - [x] Apply dark theme with inline styles
  - [x] Loading spinner while fetching data
  - [ ] Add low-stock alert table: columns — Item, Restaurant, Office, Par, Need, Unit
  - [ ] Add 🔴 badge on each low-stock row
  - [ ] Add buttons: Generate Shopping List, Export CSV

**Definition of Done:** Manager sees real-time dashboard with low-stock summary (partial - table to be added).

---

## Phase 13: Manager Shopping List Page (Frontend)

- [ ] 13.1 Build `ShoppingListPage.tsx`
  - [ ] Fetch shopping list with TanStack Query
  - [ ] Render supplier groups as collapsible sections (open by default)
  - [ ] Each section header: Supplier Name + item count badge
  - [ ] Each row: Item name · Qty needed · Unit
  - [ ] "No Supplier" group at the bottom for unassigned items
  - [ ] Button: Export PDF → calls exportShoppingListPdf(), downloads file
  - [ ] Button: Export CSV → calls exportCsv(), downloads file
  - [ ] Empty state: "All items are well stocked 🎉" when list is empty
  - [ ] Loading skeleton while fetching
  - [ ] Apply dark theme with inline styles

**Definition of Done:** Manager sees shopping list grouped by supplier and can export PDF and CSV.

---

## Phase 14: Manager Items Page (Frontend)

- [ ] 14.1 Build `src/api/manager.ts`
  - [ ] `getItems(filters)` → GET /api/items
  - [ ] `getItem(id)` → GET /api/items/:id
  - [ ] `createItem(data)` → POST /api/items
  - [ ] `updateItem(id, data)` → PUT /api/items/:id
  - [ ] `deactivateItem(id)` → DELETE /api/items/:id
  - [ ] `getCategories()` → GET /api/categories
  - [ ] `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)`
  - [ ] `getSuppliers()` → GET /api/suppliers
  - [ ] `createSupplier(data)`, `updateSupplier(id, data)`, `deleteSupplier(id)`
  - [ ] `getUsers()`, `createUser(data)`, `updateUser(id, data)`, `resetPassword(id, data)`

- [ ] 14.2 Build `ItemsPage.tsx`
  - [ ] Searchable list of all items (search by name)
  - [ ] Filter by: Category dropdown, Supplier dropdown, Status (Active/Inactive)
  - [ ] Each row: name, category badge, supplier, unit, par level, status badge
  - [ ] Edit button on each row → navigate to /items/:id/edit
  - [ ] Deactivate button on each row → show ConfirmDialog → call deactivateItem
  - [ ] Add Item button → navigate to /items/new
  - [ ] Apply dark theme with inline styles
  - [ ] Loading skeleton + empty state

- [ ] 14.3 Build `ItemFormPage.tsx` (shared for create and edit)
  - [ ] Fields: Name, Full Name, Category (dropdown), Supplier (dropdown, nullable), Unit (text input), Par Level (number), Notes (textarea), Active toggle
  - [ ] On create: POST /api/items → success toast → redirect to /items
  - [ ] On edit: pre-fill all fields → PUT /api/items/:id → success toast
  - [ ] Validation errors shown inline under each field
  - [ ] Cancel button → go back to /items
  - [ ] Loading state on submit button
  - [ ] Apply dark theme

**Definition of Done:** Manager can add, edit unit/par level, and deactivate items. Changes reflect on checklist immediately.

---

## Phase 15: Manager Categories, Suppliers, Users Pages (Frontend)

- [ ] 15.1 Build `CategoriesPage.tsx`
  - [ ] List all categories: icon, name, color swatch, sort_order, item count
  - [ ] Add category: modal form with name, icon, color, sort_order
  - [ ] Edit category: same modal pre-filled
  - [ ] Delete category: show ConfirmDialog → call deleteCategory → show error if items linked
  - [ ] Reorder sort_order: edit field or up/down buttons
  - [ ] Apply dark theme with inline styles

- [ ] 15.2 Build `SuppliersPage.tsx`
  - [ ] List all suppliers: name, phone, notes, item count
  - [ ] Add supplier: modal form with name, phone, notes
  - [ ] Edit supplier: same modal pre-filled
  - [ ] Delete supplier: show ConfirmDialog → call deleteSupplier → show error if items linked
  - [ ] Apply dark theme

- [ ] 15.3 Build `UsersPage.tsx`
  - [ ] List all users: name, email, role badge, active status
  - [ ] Add user: modal form with name, email, password + confirm, role selector
  - [ ] Edit user: modal form for name, email, role, is_active toggle
  - [ ] Reset password: separate small modal with new password + confirm
  - [ ] Deactivate toggle: confirm dialog before deactivating
  - [ ] Apply dark theme

**Definition of Done:** Manager can fully manage categories, suppliers, and users from the UI.

---

## Phase 16: PWA & Mobile Polish (Frontend)

- [ ] 16.1 Add `manifest.json`
  - [ ] App name, short_name, start_url, display: standalone
  - [ ] Icons for iOS and Android (192px, 512px)
  - [ ] theme_color and background_color

- [ ] 16.2 Register service worker
  - [ ] Cache app shell and static assets
  - [ ] Show offline banner when network is unavailable
  - [ ] Queue failed saves and retry when online

- [ ] 16.3 Mobile UX final pass
  - [ ] All tap targets minimum 44 × 44 px
  - [ ] All number inputs use inputmode="numeric"
  - [ ] No horizontal scroll on any page
  - [ ] Test on real iPhone (Safari) and Android (Chrome)
  - [ ] Test landscape and portrait orientations

- [ ] 16.4 Error and empty state coverage
  - [ ] Every page has a loading skeleton (not a spinner alone)
  - [ ] Every page has an empty state with message
  - [ ] Every destructive action has a confirm dialog
  - [ ] Network errors show toast with retry option

**Definition of Done:** App installable on phone via "Add to Home Screen", works on weak WiFi, all mobile UX rules met.

---

## Phase 17: Deploy

- [ ] 17.1 Backend deploy
  - [ ] Server: DigitalOcean / Forge or equivalent
  - [ ] Set all `.env` production values
  - [ ] Run `php artisan migrate --force`
  - [ ] Run `php artisan db:seed --force` (first deploy only)
  - [ ] Run `php artisan config:cache && php artisan route:cache`
  - [ ] Set up SSL certificate

- [ ] 17.2 Frontend deploy
  - [ ] Set `VITE_API_BASE_URL` in production `.env`
  - [ ] Run `npm run build`
  - [ ] Deploy `dist/` to Vercel or serve from same server via Nginx
  - [ ] Verify PWA manifest loads correctly in production

- [ ] 17.3 Post-deploy verification
  - [ ] Login works for manager and employee
  - [ ] Employee checklist loads and saves correctly
  - [ ] Manager dashboard shows correct low-stock data
  - [ ] CSV and PDF downloads work
  - [ ] App can be added to home screen on iOS and Android

**Definition of Done:** App is live, SSL active, both roles verified working in production.

---

## Final Definition of Done (Full Project)

Project is complete when all checks pass:

- [ ] All 5 tables migrated and seeded from Excel data
- [ ] All models, relationships, and scopes are correct
- [ ] Controllers are thin — all logic in services
- [ ] Form Requests validate all inputs
- [ ] Resources format all API responses
- [ ] Employee can log in, fill checklist with Restaurant + Office quantities, and save
- [ ] Manager can view dashboard with accurate low-stock alerts
- [ ] Shopping list is grouped by supplier with correct need quantities
- [ ] CSV export downloads with correct columns and data
- [ ] PDF export downloads a clean shopping list
- [ ] Manager can add/edit items including unit and par level
- [ ] Manager can manage categories, suppliers, and users
- [ ] Employee cannot reach any manager-only route (403 returned)
- [ ] All feature tests pass: `php artisan test`
- [ ] App is installable as PWA on phone
- [ ] App works on real iPhone and Android

---

## Notes

- Never hard-delete items — only deactivate (is_active = false).
- Never expose password in any API Resource or response.
- Unit field lives on `items` — one unit per item, manager edits it directly.
- Par level is always the combined Restaurant + Office minimum.
- Do not add location-based routing for employees — one checklist, two columns.
- Keep CSV generation in service via StreamedResponse — no extra packages.
- Keep the scope simple — do not add features outside this document without updating the scope first.

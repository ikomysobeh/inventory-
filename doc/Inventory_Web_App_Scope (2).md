# 📋 Restaurant Inventory Management System
## Project Scope — v3.0

> **Stack:** Laravel 13 (API) · React 18 + Vite (Frontend) · MySQL · Tailwind CSS  
> **Users:** Entry-level Employees (mobile-first) · Manager (controls everything)  
> **Source data:** `Master_Inventory.xlsx` (General, Categories, Supplier sheets)

---

## 1. Project Overview

A simple, mobile-first web app that replaces the Excel inventory sheet.

The employee opens the app, sees every item, and for each item enters **two quantities side by side — Restaurant and Office** — exactly like the Excel columns. One screen, one save. The manager then sees what is low, gets a shopping list grouped by supplier, and can export everything to CSV or PDF.

### Core Concepts from Excel → App

| Excel | App |
|---|---|
| Supplier columns (Sysco, Sam's Club, etc.) | `suppliers` table |
| Restaurant column | `qty_restaurant` on each inventory entry |
| Office column | `qty_office` on each inventory entry |
| Must Have column | `par_level` on each item |
| Categories sheet | `categories` table |
| General sheet (product list) | `items` table |

---

## 2. User Roles

Two roles only. Manager is also the admin.

### Employee
- Opens app → sees full item list grouped by category
- For each item enters: **qty in Restaurant** and **qty in Office**
- Saves — done
- Cannot change any settings, items, units, or par levels

### Manager
- Does everything an employee can do
- Dashboard: low-stock alerts across both locations combined
- Edit any item: name, unit, par level, category, supplier, notes
- Add / remove items, categories, suppliers
- Manage users
- Generate shopping list grouped by supplier
- **Export inventory data to CSV**
- Export shopping list to PDF

---

## 3. System Workflow

### Daily Inventory Workflow

```
EMPLOYEE                                    MANAGER
────────────────────────────────────────    ──────────────────────────────────────

1. Open app, log in

2. See all items in one list, two columns:

   ITEM              RESTAURANT   OFFICE
   ─────────────────────────────────────
   Tomatoes          [  12 ]      [  3 ]
   Parsley           [   2 ]      [  0 ]   ← 🔴 low vs par=5
   Feta Cheese       [   0 ]      [  1 ]   ← 🔴 low vs par=2
   Olive Oil         [   3 ]      [  2 ]
   Sprite            [  24 ]      [  0 ]
   Forks             [  ─  ]      [  8 ]   ← some items office-only or rest-only
   ...

3. Fill in all quantities
4. Hit SAVE ✅ — done for today

                                            5. Manager opens Dashboard
                                            6. Sees combined low-stock list:
                                               🔴 Parsley   Rest:2  Off:0  Par:5
                                               🔴 Feta      Rest:0  Off:1  Par:2

                                            7. Opens Shopping List
                                               (auto-calculated: par - total on hand)
                                               grouped by supplier:

                                               SYSCO
                                               · Parsley     need 3 Cases
                                               · Feta        need 1 Bag

                                               SAM'S CLUB
                                               · Red Onion   need 4 Bags

                                            8. Exports CSV or PDF
                                            9. Places orders

── Repeat next day ─────────────────────────────────────────────────────────────
```

### Manager Settings Workflow (one-time or as needed)

```
Manager → Settings

  Items
  ├── Add item        → name, unit, par level, category, supplier
  ├── Edit item       → change name / unit / par level / supplier / notes
  └── Deactivate item → hides from employee checklist

  Categories
  ├── Add / Edit / Reorder

  Suppliers
  ├── Add / Edit

  Users
  ├── Create employee account
  └── Deactivate / reset password

  Export
  └── Download full inventory CSV (all items, today's quantities, par levels)
```

---

## 4. Database Schema

Five tables. Clean and minimal.

```sql
-- Users
CREATE TABLE users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('manager','employee') DEFAULT 'employee',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
);

-- Suppliers (Sysco, Sam's Club, Arabic Store Silwady, etc.)
CREATE TABLE suppliers (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  phone       VARCHAR(50) NULL,
  notes       TEXT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
);

-- Categories (Vegetables, Dairy, Meats, Drinks, Supplies, etc.)
CREATE TABLE categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(10) NULL,      -- emoji e.g. "🥦"
  color       VARCHAR(20) NULL,      -- hex e.g. "#22c55e"
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
);

-- Items (master product list)
CREATE TABLE items (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,    -- e.g. "Tomatoes"
  full_name    VARCHAR(300) NULL,        -- e.g. "Tomato Roma Fresh (25lb)"
  category_id  BIGINT UNSIGNED NOT NULL,
  supplier_id  BIGINT UNSIGNED NULL,
  unit         VARCHAR(50) NULL,         -- e.g. "Case", "LB", "Bag" — manager can edit anytime
  par_level    DECIMAL(10,2) NULL,       -- combined minimum (Restaurant + Office total)
  notes        TEXT NULL,
  sort_order   INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP,
  updated_at   TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Inventory Entries
-- One row per item per date.
-- Stores Restaurant qty AND Office qty together — mirrors the Excel columns.
CREATE TABLE inventory_entries (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id         BIGINT UNSIGNED NOT NULL,
  entry_date      DATE NOT NULL,
  qty_restaurant  DECIMAL(10,2) NOT NULL DEFAULT 0,
  qty_office      DECIMAL(10,2) NOT NULL DEFAULT 0,
  entered_by      BIGINT UNSIGNED NOT NULL,
  notes           TEXT NULL,
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (entered_by) REFERENCES users(id),
  UNIQUE KEY unique_entry (item_id, entry_date)   -- one entry per item per day
);
```

> **Unit editing:** `unit` lives on the `items` table. When the manager changes a unit (e.g. "Case" → "LB"), every future entry and the checklist show the new unit immediately.

> **Par level logic:** `par_level` is the combined minimum for Restaurant + Office. Shopping list calculates: `need = par_level - (qty_restaurant + qty_office)`. If need ≤ 0, item is fine.

---

## 5. API Endpoints (Laravel 13)

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Inventory (Employee + Manager)
```
GET    /api/inventory?date=2025-06-07
       → all active items with today's qty_restaurant & qty_office
       → grouped by category

POST   /api/inventory/save
       Body: [ { item_id, qty_restaurant, qty_office, notes? }, ... ]
       → upserts inventory_entries for today (insert or update)

GET    /api/inventory/history?item_id=5&days=14
       → daily quantities for trend view
```

### Dashboard (Manager only)
```
GET    /api/dashboard
       → total items, low-stock count, last entry date

GET    /api/dashboard/low-stock
       → items where (qty_restaurant + qty_office) < par_level
       → sorted by how far below par

GET    /api/dashboard/shopping-list
       → low-stock items grouped by supplier
       → each item shows: need = par_level - (qty_restaurant + qty_office)

GET    /api/dashboard/shopping-list/pdf
       → download PDF

GET    /api/dashboard/export-csv
       → download CSV:
          Item, Category, Supplier, Unit, Par Level,
          Restaurant Qty, Office Qty, Total, Status (OK / LOW)
```

### Items (Manager only)
```
GET    /api/items                  # list, filterable by category/supplier/search
POST   /api/items                  # create
GET    /api/items/{id}
PUT    /api/items/{id}             # edit name, unit, par_level, category, supplier, notes
DELETE /api/items/{id}             # soft delete (is_active = false)
```

### Categories (Manager only)
```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

### Suppliers (Manager only)
```
GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}
```

### Users (Manager only)
```
GET    /api/users
POST   /api/users
PUT    /api/users/{id}
POST   /api/users/{id}/reset-password
```

---

## 6. CSV Export Format

When manager clicks Export CSV, the download contains:

```
Item Name, Full Name, Category, Supplier, Unit, Par Level, Restaurant Qty, Office Qty, Total Qty, Status, Date, Notes
Tomatoes, Tomato Roma Fresh (25lb), Vegetables & Produce, Sysco, Case, 5, 12, 3, 15, OK, 2025-06-07,
Parsley, Parsley 12 Count, Vegetables & Produce, Sysco, Case, 5, 2, 0, 2, LOW, 2025-06-07,
Feta Cheese, , Dairy & Pantry, Sysco, Bag, 2, 0, 1, 1, LOW, 2025-06-07,
...
```

Laravel generates this with a simple `StreamedResponse` — no extra package needed.

---

## 7. Frontend Structure (React)

```
src/
├── api/
│   ├── auth.js
│   ├── inventory.js      # checklist fetch + save
│   ├── dashboard.js      # summary, low stock, shopping list, exports
│   └── manager.js        # items, categories, suppliers, users CRUD
│
├── components/
│   ├── ui/               # Button, Input, Badge, Modal, Toast, Spinner
│   ├── layout/
│   │   ├── AppShell.jsx  # nav wrapper — bottom bar for employee, sidebar for manager
│   │   └── BottomNav.jsx
│   └── inventory/
│       ├── ItemRow.jsx         # item name + [Restaurant input] + [Office input] + unit
│       └── CategoryBlock.jsx   # collapsible section per category
│
├── pages/
│   ├── Login.jsx
│   │
│   ├── employee/
│   │   └── ChecklistPage.jsx   # the main and only employee page
│   │
│   └── manager/
│       ├── DashboardPage.jsx
│       ├── ShoppingListPage.jsx
│       ├── ItemsPage.jsx
│       ├── ItemFormPage.jsx    # add/edit item (name, unit, par, supplier, category)
│       ├── CategoriesPage.jsx
│       ├── SuppliersPage.jsx
│       └── UsersPage.jsx
│
├── store/
│   └── authStore.js      # logged-in user + role
│
└── routes/
    └── AppRouter.jsx     # role-based route protection
```

---

## 8. Key Screens

### 8.1 Employee — Inventory Checklist (the only employee screen)

```
┌────────────────────────────────────────────┐
│  📦 Inventory Count · June 7, 2025         │
│  ████████████░░░░░  32 / 45 items          │  ← progress bar
├────────────────────────────────────────────┤
│  ITEM             RESTAURANT    OFFICE      │
│  ─────────────────────────────────────     │
│  🥦 Vegetables & Produce                   │
│                                            │
│  Tomatoes         [  12  ]      [  3  ] Case│
│  Parsley          [   2  ]      [  0  ] Case│  ← 🔴 total < par
│  Lettuce          [   5  ]      [  2  ] Head│
│  Mint             [   1  ]      [  0  ] Case│
│                                            │
│  🧀 Dairy & Pantry                         │
│                                            │
│  Yogurt           [   4  ]      [  1  ] Bag │
│  Feta Cheese      [   0  ]      [  0  ] Bag │  ← 🔴 total < par
│  ...                                       │
├────────────────────────────────────────────┤
│                [ 💾 Save ]                 │
└────────────────────────────────────────────┘
```

**Employee UX rules:**
- Two number inputs per item side by side — mirrors the Excel exactly
- Unit label shown after both inputs (e.g. "Case")
- Red 🔴 dot if `(restaurant + office) < par_level` — informational only, not blocking
- `type="number"` `inputmode="numeric"` → number pad on mobile
- Minimum font size 18px, inputs minimum 44px tall
- Auto-save on input change (debounced 2s) + manual Save button
- Categories are collapsible sections
- Progress bar shows how many items have been touched

### 8.2 Manager — Dashboard

```
┌──────────────────────────────────────┐
│  📦 Inventory Dashboard              │
│  June 7, 2025                        │
├──────────────────────────────────────┤
│  🔴 Low Stock Items      12     →    │
│  ✅ Total Items          87          │
│  📅 Last Entry           Today       │
├──────────────────────────────────────┤
│  LOW STOCK ALERTS                    │
│  ──────────────────────────────────  │
│  Item         Rest  Off  Par  Need   │
│  Parsley       2     0    5    3 Case│
│  Feta Cheese   0     0    2    2 Bag │
│  Burger Buns   1     0    6    5 Bag │
│  ...                                 │
├──────────────────────────────────────┤
│  [ 🛒 Shopping List ]  [ ⬇ CSV ]    │
└──────────────────────────────────────┘
```

### 8.3 Manager — Shopping List (grouped by supplier)

```
┌──────────────────────────────────────┐
│  🛒 Shopping List · June 7, 2025     │
├──────────────────────────────────────┤
│  SYSCO                            ▼  │
│  · Parsley 12 Count    3 Cases       │
│  · Feta Cheese         2 Bags        │
│  · Mint 1 LB           2 Cases       │
│                                      │
│  SAM'S CLUB                       ▼  │
│  · Red Onion           4 Bags        │
│  · Coca-Cola           2 Cases       │
│                                      │
│  ARABIC STORE SILWADY             ▼  │
│  · Grape Leaves        3 Jars        │
│  · Ayran               5             │
│                                      │
│  NO SUPPLIER                      ▼  │
│  · Leeks               2 Bunch       │
├──────────────────────────────────────┤
│  [ 📄 PDF ]          [ ⬇ CSV ]      │
└──────────────────────────────────────┘
```

### 8.4 Manager — Edit Item

```
┌──────────────────────────────────────┐
│  ← Edit Item                         │
├──────────────────────────────────────┤
│  Name         [Tomatoes            ] │
│  Full Name    [Tomato Roma Fresh   ] │
│  Category     [Vegetables & Produce] │
│  Supplier     [Sysco               ] │
│  Unit         [Case               ▼] │  ← dropdown + free text option
│  Par Level    [5                   ] │  ← combined min (rest + office)
│  Notes        [Sysco SKU: 6894125  ] │
│  Active?      [✅ Yes              ] │
├──────────────────────────────────────┤
│      [ Cancel ]      [ Save Item ]   │
└──────────────────────────────────────┘
```

---

## 9. Seed Data from Excel

### Suppliers (13)
| Supplier |
|---|
| Sysco |
| Sam's Club |
| Arabic Store (Silwady) |
| Saad Wholesale Meat |
| Atlantic Food |
| Banyan Food Service |
| Web Restaurant |
| Restaurant Depot |
| Kroger |
| Costco |
| Amazon |
| ARYZ Wholesale |
| AlShams Bakery MI |

### Categories (10)
| Category | Icon |
|---|---|
| Vegetables & Produce | 🥦 |
| Fruits | 🍋 |
| Canned & Jarred Items | 🥫 |
| Raw Meat | 🥩 |
| Dairy & Pantry | 🧀 |
| Grains & Dry Goods | 🌾 |
| Bread | 🫓 |
| Oils & Liquids | 🫙 |
| Drinks | 🥤 |
| Packaging & Supplies | 📦 |

---

## 10. Development Phases

### Phase 1 — Foundation (Week 1)
- [ ] Laravel 13 project setup, MySQL, Sanctum auth
- [ ] Migrations for all 5 tables
- [ ] Seeders: categories, suppliers, items from Excel
- [ ] Auth API (login / logout / me)
- [ ] React + Vite + Tailwind setup
- [ ] Login page + role-based route guards

### Phase 2 — Employee Checklist (Week 2)
- [ ] `GET /api/inventory` — items with today's qty_restaurant & qty_office
- [ ] `POST /api/inventory/save` — upsert entries for today
- [ ] Checklist page: two-column layout (Restaurant | Office) per item
- [ ] Category collapsible sections
- [ ] Auto-save + manual save button
- [ ] Progress bar, low-stock indicator 🔴

### Phase 3 — Manager Dashboard & Shopping List (Week 3)
- [ ] Dashboard API (low stock summary, last entry date)
- [ ] Shopping list API (grouped by supplier, need = par - total)
- [ ] Dashboard page with alert list
- [ ] Shopping list page
- [ ] PDF export (Laravel DomPDF `barryvdh/laravel-dompdf`)
- [ ] CSV export (`StreamedResponse`, no extra package)

### Phase 4 — Manager Settings (Week 4)
- [ ] Items CRUD (with unit + par level editing)
- [ ] Categories CRUD
- [ ] Suppliers CRUD
- [ ] Users management (create / deactivate / reset password)

### Phase 5 — Polish & Deploy (Week 5)
- [ ] PWA manifest (employees add to home screen)
- [ ] Error handling, loading states, empty states
- [ ] Real device testing (iPhone + Android)
- [ ] Deploy Laravel (Forge / DigitalOcean) + React (same server or Vercel)
- [ ] SSL, `.env` production config, DB backups

---

## 11. Technical Notes

### Laravel 13
- **Sanctum** — SPA cookie auth (no tokens to manage on mobile)
- **Form Requests** — validation per endpoint
- **API Resources** — consistent JSON shape for all responses
- **StreamedResponse** — CSV export, no extra package needed
- **DomPDF** (`barryvdh/laravel-dompdf`) — PDF for shopping list
- **Policies** — `ManagerPolicy` blocks employee from reaching manager routes

### React
- **TanStack Query** — data fetching, caching, auto-refetch
- **Zustand** — auth user state (role, name)
- **React Hook Form** — manager forms
- **Tailwind CSS** — mobile-first
- **Lucide React** — icons

### Mobile / PWA
- `manifest.json` → "Add to Home Screen" on iOS & Android
- `type="number"` `inputmode="numeric"` → number pad on mobile
- Minimum touch target: 44 × 44 px
- Debounced auto-save: 2 seconds after last keystroke

---

## 12. Environment Variables

**Laravel `.env`**
```
APP_NAME="Restaurant Inventory"
APP_URL=https://inventory.yourrestaurant.com
DB_DATABASE=inventory_db
SANCTUM_STATEFUL_DOMAINS=inventory.yourrestaurant.com
SESSION_DOMAIN=.yourrestaurant.com
```

**React `.env`**
```
VITE_API_BASE_URL=https://inventory.yourrestaurant.com/api
```

---

## 13. Out of Scope (Future Ideas)
- Multiple suppliers per item
- Pricing / cost tracking
- Invoice / receipt scanning
- Multi-branch support
- Waste logging
- Recipe management

---

*Document v3.0 — Two-column inventory (Restaurant + Office), CSV export, Laravel 13*

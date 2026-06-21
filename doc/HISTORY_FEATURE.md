# Inventory History Feature — Implementation Plan

> **Goal:** Give managers a complete audit trail of every inventory count — who entered it, when, and what the quantities were — across two views: a daily snapshot and a per-item trend.

---

## What Already Exists (No Schema Changes Needed)

The `inventory_entries` table already stores everything we need:

| Column | What it holds |
|---|---|
| `item_id` | Which item was counted |
| `entry_date` | The date of the count |
| `qty_restaurant` | Restaurant quantity entered |
| `qty_office` | Office quantity entered |
| `entered_by` | FK → `users.id` — who saved the entry |
| `updated_at` | Exact timestamp of last save |
| `notes` | Optional note on the entry |

The `InventoryEntry` model already has `enteredBy()` and `item()` relationships.

The existing `GET /api/inventory/history` endpoint returns per-item data but **does not include who entered it** and is not accessible from any UI page.

---

## Two History Views

### View 1 — Daily Audit (Manager)

> "Show me everything that was entered on a given day."

- Manager picks a date (default: today)
- Table shows every **active item**, one row per item
- Rows that were entered show quantities + who entered + time
- Rows that were **not entered yet** show a "Not entered" badge in red
- Optional filter: filter by employee (to see what a specific person entered)
- Export button: download this date's full count as CSV

**UI columns:**
```
Item Name | Category | Restaurant | Office | Total | Status | Entered By | Time
```

---

### View 2 — Item Trend (Manager)

> "Show me the last N days of counts for this specific item."

- Manager clicks an item from the daily table (or navigates via Items page)
- Shows a table of the last 30 days of entries for that item
- Columns: Date | Restaurant | Office | Total | Par Level | Status | Entered By
- Highlights rows where total < par_level in red

---

## Backend Changes

### 1. New endpoint — Daily Audit

```
GET /api/inventory/audit
```

**Auth:** `auth:sanctum` + `manager` middleware

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `date` | string (Y-m-d) | today | Date to audit |
| `user_id` | integer | null | Filter to a specific employee |

**Response shape:**
```json
{
  "data": [
    {
      "item_id": 12,
      "item_name": "Olive Oil",
      "full_name": "Extra Virgin Olive Oil",
      "category": "Oils & Liquids",
      "unit": "Bottle",
      "par_level": 5,
      "qty_restaurant": 3,
      "qty_office": 1,
      "qty_total": 4,
      "is_low_stock": true,
      "status": "entered",
      "entered_by_name": "Sarah",
      "entered_at": "2026-06-14 08:32:00"
    },
    {
      "item_id": 7,
      "item_name": "Tomatoes",
      "category": "Vegetables & Produce",
      "unit": "Case",
      "par_level": 3,
      "qty_restaurant": null,
      "qty_office": null,
      "qty_total": null,
      "is_low_stock": null,
      "status": "missing",
      "entered_by_name": null,
      "entered_at": null
    }
  ],
  "meta": {
    "date": "2026-06-14",
    "total_items": 80,
    "entered_count": 72,
    "missing_count": 8,
    "completion_pct": 90
  }
}
```

**Implementation in `InventoryService`:**
- New method: `getAudit(string $date, ?int $userId): array`
- Load all active items with category (1 query)
- Load all entries for that date (optionally filtered by `entered_by`) with `enteredBy` user (1 query)
- Keyby item_id and merge — returns every item whether entered or not
- Sort: entered items first, then missing; within each group sort by category → item name

---

### 2. Enhance existing `getHistory()` — add entered_by

The existing `getHistory(int $itemId, int $days)` does not return who entered. Update it:

```php
// Current — missing entered_by
return InventoryEntry::where('item_id', $itemId)
    ->where('entry_date', '>=', $startDate)
    ->orderBy('entry_date', 'desc')
    ->get(['entry_date', 'qty_restaurant', 'qty_office'])

// New — eager load user
return InventoryEntry::with('enteredBy:id,name')
    ->where('item_id', $itemId)
    ->where('entry_date', '>=', $startDate)
    ->orderBy('entry_date', 'desc')
    ->get()
    ->map(fn($e) => [
        'entry_date'     => $e->entry_date->toDateString(),
        'qty_restaurant' => $e->qty_restaurant,
        'qty_office'     => $e->qty_office,
        'qty_total'      => $e->qty_restaurant + $e->qty_office,
        'entered_by'     => $e->enteredBy?->name,
        'entered_at'     => $e->updated_at->format('H:i'),
    ])
```

---

### 3. New controller method

In `InventoryController`:
```php
public function audit(Request $request)
{
    $date   = $request->query('date', now()->toDateString());
    $userId = $request->query('user_id');

    $result = $this->inventoryService->getAudit($date, $userId ? (int)$userId : null);

    return response()->json($result);
}
```

---

### 4. New route

In `routes/api.php`, inside the `manager` middleware group:
```php
Route::get('/inventory/audit', [InventoryController::class, 'audit']);
```

> ⚠️ Must be registered **before** `Route::apiResource('items', ...)` to avoid Laravel matching `audit` as an item ID.
> Actually it belongs in the inventory group, not items — no conflict.

---

## Frontend Changes

### 1. New page — `HistoryPage.tsx`

**Route:** `/history` (manager only)

**Layout:**

```
┌─ History ────────────────────────────────────────────┐
│  [Date picker]  [Employee filter ▼]  [Export CSV]   │
│                                                      │
│  Progress: 72 / 80 items entered  ████████░░  90%   │
│                                                      │
│  Item        | Cat  | Rest | Off | Total | By | Time │
│  ─────────────────────────────────────────────────── │
│  Olive Oil   | Oils |  3   |  1  |   4   | Sarah | 08:32 │
│  Tomatoes    | Veg  |  —   |  —  |  —    | ⚠ Not entered │
└──────────────────────────────────────────────────────┘
```

**Behaviour:**
- Date defaults to today; changing date refetches
- Employee dropdown populated from `/api/users` (manager only)
- "Not entered" rows show a red badge and sort to the bottom
- Low-stock rows (total < par) highlight the Total cell in red
- Export CSV button calls new `/api/inventory/audit/export` OR reuses the dashboard CSV but filtered to the selected date
- Clicking an item row opens the item trend panel (View 2) as a slide-over or modal

**React Query key:** `['audit', date, userId]`

---

### 2. Item Trend Modal / Slide-over

Triggered by clicking a row in the daily audit table.

**Shows:**
- Item name + unit + par level in the header
- Table: last 30 days — Date | Restaurant | Office | Total | Entered By
- Low-stock rows highlighted in red
- "No data" message if no history

Uses existing `GET /api/inventory/history?item_id=X&days=30`.

No new API needed — just use the enhanced `getHistory()` which now returns `entered_by`.

---

### 3. Sidebar link

Add "History" to `MANAGER_LINKS` in `Layout.tsx`:
```tsx
{ to: '/history', icon: '📜', label: 'History' },
```

Add between Inventory and Items.

---

### 4. Route in `app.tsx`

```tsx
<Route
  path="/history"
  element={
    <ProtectedRoute requiredRole="manager">
      <HistoryPage />
    </ProtectedRoute>
  }
/>
```

---

## Summary of Files to Create / Modify

### New files
| File | What |
|---|---|
| `resources/js/pages/HistoryPage.tsx` | Daily audit + item trend UI |

### Modified files
| File | Change |
|---|---|
| `app/Services/InventoryService.php` | Add `getAudit()`, enhance `getHistory()` |
| `app/Http/Controllers/Api/InventoryController.php` | Add `audit()` method |
| `routes/api.php` | Add `GET /inventory/audit` under manager middleware |
| `resources/js/components/Layout.tsx` | Add History link to sidebar |
| `resources/js/app.tsx` | Add `/history` route |

---

## Definition of Done

- [ ] `GET /api/inventory/audit?date=2026-06-14` returns all active items, entered + missing
- [ ] `GET /api/inventory/audit?date=...&user_id=3` filters to entries by that user
- [ ] `GET /api/inventory/history?item_id=5&days=30` includes `entered_by` and `entered_at`
- [ ] Manager can open `/history`, pick any date, see the full count snapshot
- [ ] Missing items (not entered) clearly visible with red badge
- [ ] Clicking a row shows the 30-day trend for that item
- [ ] Employee filter narrows the table to entries by that person
- [ ] History link appears in the sidebar for manager role only

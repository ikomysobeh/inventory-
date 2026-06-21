# Backend Audit Report

> Every issue found by reading the actual code. Ordered by severity.
> Each finding includes the exact file and line, what is wrong, and the concrete fix.

---

## CRITICAL

---

### 1. Plaintext password written to log file

**File:** `app/Http/Controllers/Api/AuthController.php` line 22  
**File:** `app/Services/AuthService.php` lines 16–43

```php
// AuthController.php:22 — dumps the entire request body including password
Log::info('Login request', $request->all());
```

Every login attempt writes `{ "email": "...", "password": "secret123" }` to your log file in plain text. Anyone with access to `storage/logs/laravel.log` can read all passwords ever used.

**Fix:**
```php
// AuthController.php — log only what is safe
Log::info('Login attempt', ['email' => $request->input('email')]);
```

---

### 2. N+1 queries in InventoryService::getChecklist()

**File:** `app/Services/InventoryService.php` lines 26–44

```php
// Lines 26-31: Two queries run here — result is NEVER USED (dead code)
$entries = InventoryEntry::where('entry_date', $dateObj)
    ->pluck('qty_restaurant', 'item_id')
    ->merge(
        InventoryEntry::where('entry_date', $dateObj)->pluck('qty_office', 'item_id')
    );

// Lines 42-44: Then queries the DB AGAIN for every single item anyway
foreach ($categoryItems as $item) {
    $entry = InventoryEntry::where('item_id', $item->id)   // ← 1 query per item
        ->where('entry_date', $dateObj)
        ->first();
```

Two problems: the `$entries` variable at lines 26–31 runs **2 queries and then is never used**. Then the loop runs **1 query per item**. With 50 items = **52 queries** on every inventory page load.

**Fix:**
```php
public function getChecklist(string $date): array
{
    $dateObj = Carbon::parse($date)->toDateString();

    $items = Item::with(['category', 'supplier'])
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    // ONE query for all entries — keyBy so lookup is O(1)
    $entries = InventoryEntry::whereIn('item_id', $items->pluck('id'))
        ->where('entry_date', $dateObj)
        ->get(['item_id', 'qty_restaurant', 'qty_office'])
        ->keyBy('item_id');

    $grouped = $items->groupBy(fn($item) => $item->category->name);

    $checklist = [];
    foreach ($grouped as $categoryName => $categoryItems) {
        $categoryData = [
            'name'  => $categoryName,
            'icon'  => $categoryItems[0]->category->icon ?? null,
            'items' => [],
        ];

        foreach ($categoryItems as $item) {
            $entry   = $entries->get($item->id);
            $qtyRest = $entry?->qty_restaurant ?? 0;
            $qtyOff  = $entry?->qty_office ?? 0;
            $total   = $qtyRest + $qtyOff;

            $categoryData['items'][] = [
                'item_id'        => $item->id,
                'name'           => $item->name,
                'full_name'      => $item->full_name,
                'unit'           => $item->unit,
                'par_level'      => $item->par_level,
                'qty_restaurant' => $qtyRest,
                'qty_office'     => $qtyOff,
                'qty_total'      => $total,
                'is_low_stock'   => $total < ($item->par_level ?? 999),
            ];
        }

        $checklist[] = $categoryData;
    }

    return $checklist;
}
```

Result: **52 queries → 4 queries** on every inventory page load.

---

### 3. UserController has no destroy() method

**File:** `routes/api.php` line 66  
**File:** `app/Http/Controllers/Api/UserController.php`

```php
// routes/api.php:66 — registers DELETE /users/{user}
Route::apiResource('users', UserController::class);
```

`apiResource` registers a `DELETE /users/{id}` route but `UserController` has no `destroy()` method. Every delete click in the Users UI returns a `BadMethodCallException` (500 error). The frontend receives an error but silently swallows it (no error banner on delete).

**Fix — add to UserController:**
```php
public function destroy(User $user)
{
    // Prevent deleting yourself
    if ($user->id === request()->user()->id) {
        return response()->json(['message' => 'You cannot delete your own account.'], 422);
    }

    $user->tokens()->delete();
    $user->delete();

    return response()->json(['message' => 'User deleted successfully.']);
}
```

---

## HIGH

---

### 4. N×2 queries in InventoryService::saveEntries()

**File:** `app/Services/InventoryService.php` lines 77–93

```php
foreach ($entries as $entry) {
    InventoryEntry::updateOrCreate(   // ← SELECT + INSERT/UPDATE = 2 queries per item
        ['item_id' => ..., 'entry_date' => ...],
        ['qty_restaurant' => ..., 'qty_office' => ..., ...]
    );
}
```

`updateOrCreate` runs a SELECT then an INSERT or UPDATE — 2 queries per entry. Saving 50 items = **100 queries** inside the transaction.

**Fix — replace the loop with a single upsert:**
```php
public function saveEntries(int $userId, array $entries, string $date): bool
{
    $dateObj = Carbon::parse($date)->toDateString();

    $rows = array_map(fn($entry) => [
        'item_id'        => $entry['item_id'],
        'entry_date'     => $dateObj,
        'qty_restaurant' => $entry['qty_restaurant'] ?? 0,
        'qty_office'     => $entry['qty_office'] ?? 0,
        'entered_by'     => $userId,
        'notes'          => $entry['notes'] ?? null,
        'created_at'     => now(),
        'updated_at'     => now(),
    ], $entries);

    // ONE query regardless of how many entries
    DB::table('inventory_entries')->upsert(
        $rows,
        ['item_id', 'entry_date'],          // unique keys
        ['qty_restaurant', 'qty_office', 'entered_by', 'notes', 'updated_at']
    );

    return true;
}
```

Result: **100 queries → 1 query**.

---

### 5. N+1 validation queries in SaveInventoryRequest

**File:** `app/Http/Requests/SaveInventoryRequest.php` line 26

```php
'entries.*.item_id' => ['required', 'exists:items,id'],
```

Laravel's `exists` rule runs a separate `SELECT` for every array entry it validates. Submitting 50 items triggers **50 validation queries** before the controller even runs.

**Fix:**
```php
use Illuminate\Validation\Rule;
use App\Models\Item;

public function rules(): array
{
    // Load valid IDs once — used in Rule::in() below
    $validIds = Item::where('is_active', true)->pluck('id')->all();

    return [
        'entries'                  => ['required', 'array'],
        'entries.*.item_id'        => ['required', 'integer', Rule::in($validIds)],
        'entries.*.qty_restaurant' => ['required', 'numeric', 'min:0'],
        'entries.*.qty_office'     => ['required', 'numeric', 'min:0'],
        'entries.*.notes'          => ['nullable', 'string', 'max:500'],
    ];
}
```

Result: **50 validation queries → 1 query**.

---

### 6. Silent data loss when deleting category or supplier

**File:** `app/Services/CategoryService.php` lines 43–56  
**File:** `app/Services/SupplierService.php` lines 43–56

```php
// Blocks if there are ACTIVE items — but then deletes ALL items including inactive
$hasActiveItems = Item::where('category_id', $category->id)
    ->where('is_active', true)->exists();

if ($hasActiveItems) { return ['success' => false, ...]; }

Item::where('category_id', $category->id)->delete();  // ← deletes inactive items silently
$category->delete();
```

An inactive item that is hidden from the UI gets **permanently deleted without any warning** when its category or supplier is deleted. Historical inventory entries for that item remain (orphaned), but the item record is gone.

**Fix — block if ANY items exist (active or inactive):**
```php
$hasItems = Item::where('category_id', $category->id)->exists();

if ($hasItems) {
    return [
        'success' => false,
        'message' => 'Cannot delete category because it has items linked to it (active or inactive). Reassign or delete those items first.',
    ];
}

$category->delete();
```

---

## MEDIUM

---

### 7. Excessive debug logging in production

**File:** `app/Services/AuthService.php` lines 16–43  
**File:** `app/Http/Controllers/Api/AuthController.php` lines 22, 33–37

`AuthService::login()` contains 8 `Log::info/warning` calls including internal state like `'password_provided' => strlen($password) . ' chars'`. Every login writes ~8 lines to `laravel.log`. These are debug traces that have no value in production and create noisy, large log files.

**Fix — remove all debug logs from AuthService. Keep only two meaningful lines in AuthController:**
```php
// AuthController — keep these two only:
Log::info('Login attempt', ['email' => $credentials['email']]);
// on failure:
Log::warning('Login failed', ['email' => $credentials['email']]);
```

---

### 8. UserController::update() can null out fields

**File:** `app/Http/Requests/UpdateUserRequest.php`  
**File:** `app/Services/UserService.php` line 42

```php
// UpdateUserRequest — all fields nullable
'name' => ['nullable', 'string', 'max:100'],

// UserService — passes everything from validated() to update()
$user->update($data);
```

If the frontend sends `{ "name": null }`, the user's name gets set to `null` in the database. The `nullable` rule was intended to mean "field is optional in the request" but it also allows null values through.

**Fix — strip null values before updating:**
```php
// UserService::update()
public function update(User $user, array $data): User
{
    $user->update(array_filter($data, fn($v) => $v !== null));
    return $user;
}
```

---

### 9. AuthService::login() returns null for both "wrong password" and "inactive account"

**File:** `app/Services/AuthService.php` and `app/Http/Controllers/Api/AuthController.php`

Both failure cases return the same generic error to the caller. This is actually **correct** for security (you don't want to tell attackers whether the email exists). But the service returns `null` for three distinct reasons (user not found, wrong password, inactive) with no way for the controller to distinguish inactive accounts — which should arguably give a different UX message ("Your account has been disabled. Contact your manager.").

**Fix — use an exception or an enum result instead of null:**
```php
// In AuthService, throw specific exceptions:
throw new AuthenticationException('invalid_credentials');
throw new AuthenticationException('account_inactive');

// In AuthController, catch and map to the right message
```

---

### 10. No pagination on list endpoints

**File:** `app/Services/ItemService.php`, `UserService.php`, `CategoryService.php`, `SupplierService.php`

All list endpoints return `->get()` — the entire table at once. If you have 500+ items, the entire dataset is loaded into memory and sent to the browser on every page visit.

**Fix — add `paginate()` or at minimum a row cap for now:**
```php
// Quick cap to avoid runaway queries until proper pagination is added:
return $query->orderBy('name')->limit(500)->get()->toArray();

// Proper fix: return $query->orderBy('name')->paginate(50);
// Then update the frontend to handle { data: [], meta: { current_page, last_page } }
```

---

## LOW

---

### 11. `scopeActive` defined but never used

**File:** `app/Models/Item.php` line 45  
**File:** All services

```php
// Item model has this scope:
public function scopeActive($query) { return $query->where('is_active', true); }

// But every service ignores it and writes this manually:
Item::where('is_active', true)->...
Item::with([...])->where('is_active', true)->...
```

The scope exists for exactly this purpose. Not a bug, but inconsistent.

**Fix — use the scope:**
```php
Item::active()->with(['category', 'supplier'])->get();
```

---

### 12. `CategoryService` and `SupplierService` return full model `->toArray()` but `ItemService` doesn't

**File:** `app/Services/CategoryService.php` line 16 vs `app/Services/ItemService.php` line 37

Inconsistent: `CategoryService::getAll()` returns `->get()->toArray()` which includes `created_at`, `updated_at`, and all hidden fields. `ItemService::getAll()` also calls `->toArray()`. Neither uses the defined API Resources (`CategoryResource`, `ItemResource`, etc.) even though they exist.

**Fix — use API Resources for consistent, controlled output:**
```php
// In CategoryController::index():
return CategoryResource::collection(Category::active()->orderBy('sort_order')->get());
```

---

### 13. `UserController::resetPassword` has no guard against resetting own password while logged in

**File:** `app/Http/Controllers/Api/UserController.php` line 93

A manager can reset their own password through this endpoint, which would revoke their own token and force an immediate logout mid-session — potentially confusing. More critically, there's no rate limiting on this endpoint.

---

### 14. `InventoryController::history` accepts user-supplied `item_id` without ownership check

**File:** `app/Http/Controllers/Api/InventoryController.php` lines 53–62

```php
$itemId = $request->query('item_id');  // any integer the user sends
$history = $this->inventoryService->getHistory($itemId, $days);
```

Any authenticated user (employee or manager) can query history for any `item_id`. Not a major issue since inventory data isn't sensitive, but `item_id` should at minimum be validated as an existing item:

```php
$itemId = $request->query('item_id');
abort_unless(Item::where('id', $itemId)->exists(), 404);
```

---

### 15. Dead code in `InventoryService::getChecklist()`

**File:** `app/Services/InventoryService.php` lines 26–31

```php
// This whole block runs 2 queries and the result is never referenced:
$entries = InventoryEntry::where('entry_date', $dateObj)
    ->pluck('qty_restaurant', 'item_id')
    ->merge(
        InventoryEntry::where('entry_date', $dateObj)->pluck('qty_office', 'item_id')
    );
```

The `$entries` variable is never read after this. It's dead code that adds 2 queries to every checklist load. Remove it (it is replaced by the fix in issue #2).

---

## Summary Table

| # | File | Issue | Impact | Fix |
|---|---|---|---|---|
| 1 | `AuthController.php:22` | Password logged in plaintext | **Security** | Log only email |
| 2 | `InventoryService.php:42` | N+1 in getChecklist (52 queries) | **Performance** | `whereIn` + `keyBy` |
| 3 | `UserController.php` | No destroy() method (DELETE = 500) | **Bug** | Add destroy() |
| 4 | `InventoryService.php:78` | N×2 in saveEntries (100 queries) | **Performance** | `DB::upsert()` |
| 5 | `SaveInventoryRequest.php:26` | N+1 validation (50 queries) | **Performance** | `Rule::in()` |
| 6 | `CategoryService.php:55` | Silent delete of inactive items | **Data loss** | Block if any items exist |
| 7 | `AuthService.php:16–43` | 8 debug Log calls per login | **Noise/IO** | Remove debug logs |
| 8 | `UserService.php:42` | Null values overwrite fields | **Bug** | `array_filter` nulls |
| 9 | `AuthService.php` | No distinction for inactive accounts | **UX** | Throw typed exceptions |
| 10 | All services | No pagination on list endpoints | **Performance** | Add `paginate()` |
| 11 | `Item.php:45` | `scopeActive` defined but unused | **Consistency** | Use the scope |
| 12 | All controllers | API Resources defined but unused | **Consistency** | Use Resources |
| 13 | `UserController.php:93` | No rate limit on password reset | **Security** | Add throttle middleware |
| 14 | `InventoryController.php:55` | item_id not validated in history | **Correctness** | Add `abort_unless` |
| 15 | `InventoryService.php:26` | Dead code runs 2 useless queries | **Performance** | Delete the block |

---

## Quick Wins (fix in under 5 minutes each)

These can be done immediately without design decisions:

1. **Remove** `Log::info('Login request', $request->all())` from `AuthController` — one line deletion
2. **Remove** the entire `$entries = InventoryEntry::...->merge(...)` block from `InventoryService::getChecklist()` — 6 line deletion
3. **Add** `array_filter($data, fn($v) => $v !== null)` in `UserService::update()` — one line change
4. **Add** `abort_unless(Item::where('id', $itemId)->exists(), 404)` in `InventoryController::history()` — one line addition
5. **Replace** `where('is_active', true)` with `->active()` scope everywhere in services

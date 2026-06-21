<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\InventoryEntry;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class InventoryApiTest extends TestCase
{
    use DatabaseMigrations;

    private User $manager;
    private User $employee;
    private Category $category;
    private Supplier $supplier;
    private Item $item;
    private string $managerToken;
    private string $employeeToken;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users
        $this->manager = User::create([
            'name' => 'Test Manager',
            'email' => 'manager@test.local',
            'password' => bcrypt('password'),
            'role' => 'manager',
            'is_active' => true,
        ]);

        $this->employee = User::create([
            'name' => 'Test Employee',
            'email' => 'employee@test.local',
            'password' => bcrypt('password'),
            'role' => 'employee',
            'is_active' => true,
        ]);

        // Get tokens
        $managerResponse = $this->postJson('/api/auth/login', [
            'email' => 'manager@test.local',
            'password' => 'password',
        ]);
        $this->managerToken = $managerResponse->json('data.token');

        $employeeResponse = $this->postJson('/api/auth/login', [
            'email' => 'employee@test.local',
            'password' => 'password',
        ]);
        $this->employeeToken = $employeeResponse->json('data.token');

        // Create test data
        $this->category = Category::create([
            'name' => 'Vegetables',
            'icon' => '🥦',
            'color' => '#228B22',
            'sort_order' => 1,
        ]);

        $this->supplier = Supplier::create([
            'name' => 'Fresh Foods Co',
            'phone' => '555-1234',
        ]);

        $this->item = Item::create([
            'name' => 'Tomatoes',
            'full_name' => 'Fresh Tomatoes - 5 lb Case',
            'category_id' => $this->category->id,
            'supplier_id' => $this->supplier->id,
            'unit' => 'Case',
            'par_level' => 10,
        ]);
    }

    public function test_employee_can_get_inventory_checklist()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/inventory?date=' . now()->toDateString());

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'name',
                    'items' => [
                        '*' => ['item_id', 'name', 'unit', 'par_level', 'qty_restaurant', 'qty_office'],
                    ],
                ],
            ],
        ]);
    }

    public function test_checklist_includes_todays_quantities_if_entry_exists()
    {
        $today = now()->toDateString();
        InventoryEntry::create([
            'item_id' => $this->item->id,
            'entry_date' => $today,
            'qty_restaurant' => 5,
            'qty_office' => 3,
            'entered_by' => $this->employee->id,
        ]);

        $response = $this->withToken($this->employeeToken)->getJson('/api/inventory?date=' . $today);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'qty_restaurant' => 5,
            'qty_office' => 3,
        ]);
    }

    public function test_checklist_returns_zero_quantities_if_no_entry_yet()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/inventory?date=' . now()->toDateString());

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'qty_restaurant' => 0,
            'qty_office' => 0,
        ]);
    }

    public function test_employee_can_save_inventory_entries()
    {
        $today = now()->toDateString();
        $response = $this->withToken($this->employeeToken)->postJson('/api/inventory/save?date=' . $today, [
            'entries' => [
                [
                    'item_id' => $this->item->id,
                    'qty_restaurant' => 7,
                    'qty_office' => 2,
                    'notes' => 'Test entry',
                ],
            ],
        ]);

        $response->assertStatus(200);

        // Verify entry was saved
        $entry = InventoryEntry::where('item_id', $this->item->id)
            ->where('entry_date', $today)
            ->first();

        $this->assertNotNull($entry);
        $this->assertEquals(7, $entry->qty_restaurant);
        $this->assertEquals(2, $entry->qty_office);
    }

    public function test_saving_same_item_twice_updates_existing_entry()
    {
        $today = now()->toDateString();

        // Save first time
        $this->withToken($this->employeeToken)->postJson('/api/inventory/save?date=' . $today, [
            'entries' => [
                [
                    'item_id' => $this->item->id,
                    'qty_restaurant' => 5,
                    'qty_office' => 2,
                ],
            ],
        ]);

        // Save again with different quantities
        $this->withToken($this->employeeToken)->postJson('/api/inventory/save?date=' . $today, [
            'entries' => [
                [
                    'item_id' => $this->item->id,
                    'qty_restaurant' => 8,
                    'qty_office' => 3,
                ],
            ],
        ]);

        // Verify only one entry exists with updated values
        $entries = InventoryEntry::where('item_id', $this->item->id)
            ->where('entry_date', $today)
            ->get();

        $this->assertCount(1, $entries);
        $this->assertEquals(8, $entries->first()->qty_restaurant);
        $this->assertEquals(3, $entries->first()->qty_office);
    }

    public function test_is_low_stock_flag_is_correct()
    {
        $today = now()->toDateString();

        // Save quantities below par level
        $this->withToken($this->employeeToken)->postJson('/api/inventory/save?date=' . $today, [
            'entries' => [
                [
                    'item_id' => $this->item->id,
                    'qty_restaurant' => 2,
                    'qty_office' => 1,
                ],
            ],
        ]);

        $response = $this->withToken($this->employeeToken)->getJson('/api/inventory?date=' . $today);

        $response->assertStatus(200);
        // Total is 3, par_level is 10, so is_low_stock should be true
        $response->assertJsonFragment([
            'is_low_stock' => true,
        ]);
    }

    public function test_inventory_requires_authentication()
    {
        $response = $this->getJson('/api/inventory');

        $response->assertStatus(401);
    }

    public function test_save_inventory_requires_valid_item_ids()
    {
        $response = $this->withToken($this->employeeToken)->postJson('/api/inventory/save', [
            'entries' => [
                [
                    'item_id' => 99999,
                    'qty_restaurant' => 5,
                    'qty_office' => 2,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('entries.0.item_id');
    }

    public function test_save_inventory_requires_numeric_quantities()
    {
        $response = $this->withToken($this->employeeToken)->postJson('/api/inventory/save', [
            'entries' => [
                [
                    'item_id' => $this->item->id,
                    'qty_restaurant' => 'invalid',
                    'qty_office' => 2,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('entries.0.qty_restaurant');
    }
}

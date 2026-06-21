<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\InventoryEntry;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use DatabaseMigrations;

    private User $manager;
    private User $employee;
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
        $category = Category::create([
            'name' => 'Vegetables',
            'sort_order' => 1,
        ]);

        $supplier = Supplier::create([
            'name' => 'Fresh Foods Co',
        ]);

        Item::create([
            'name' => 'Tomatoes',
            'category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'par_level' => 10,
        ]);

        Item::create([
            'name' => 'Lettuce',
            'category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'par_level' => 15,
        ]);
    }

    public function test_employee_cannot_access_dashboard()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/dashboard');

        $response->assertStatus(403);
    }

    public function test_manager_can_get_dashboard_summary()
    {
        $response = $this->withToken($this->managerToken)->getJson('/api/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'total_items',
                'low_stock_count',
                'last_entry_date',
            ],
        ]);
    }

    public function test_dashboard_total_items_count_is_correct()
    {
        $response = $this->withToken($this->managerToken)->getJson('/api/dashboard');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total_items' => 2,
        ]);
    }

    public function test_low_stock_list_only_includes_items_below_par_level()
    {
        $today = now()->toDateString();

        // Create low stock entry
        InventoryEntry::create([
            'item_id' => 1,
            'entry_date' => $today,
            'qty_restaurant' => 2,
            'qty_office' => 1,
            'entered_by' => $this->employee->id,
        ]);

        // Create normal stock entry
        InventoryEntry::create([
            'item_id' => 2,
            'entry_date' => $today,
            'qty_restaurant' => 10,
            'qty_office' => 5,
            'entered_by' => $this->employee->id,
        ]);

        $response = $this->withToken($this->managerToken)->getJson('/api/dashboard/low-stock');

        $response->assertStatus(200);
        // Should only have 1 low stock item (Tomatoes with total 3 < par 10)
        $items = $response->json('data');
        $this->assertEquals(1, count($items));
    }

    public function test_shopping_list_grouped_by_supplier()
    {
        $response = $this->withToken($this->managerToken)->getJson('/api/dashboard/shopping-list');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['supplier', 'items']
            ]
        ]);
    }

    public function test_items_with_no_supplier_grouped_under_no_supplier()
    {
        // Create item with no supplier
        $category = Category::first();
        Item::create([
            'name' => 'Mystery Item',
            'category_id' => $category->id,
            'par_level' => 5,
        ]);

        $response = $this->withToken($this->managerToken)->getJson('/api/dashboard/shopping-list');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'supplier' => 'No Supplier',
        ]);
    }

    public function test_csv_export_returns_correct_response()
    {
        $response = $this->withToken($this->managerToken)->getJson('/api/dashboard/export-csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Disposition');
        $this->assertStringContainsString('attachment', $response->header('Content-Disposition'));
    }

    public function test_pdf_export_returns_shopping_list_data()
    {
        $response = $this->withToken($this->managerToken)->getJson('/api/dashboard/shopping-list/pdf');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['supplier', 'items']
            ]
        ]);
    }

    public function test_dashboard_requires_manager_role()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/dashboard');

        $response->assertStatus(403);
    }

    public function test_dashboard_requires_authentication()
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class ItemApiTest extends TestCase
{
    use DatabaseMigrations;

    private User $manager;
    private User $employee;
    private string $managerToken;
    private string $employeeToken;
    private Category $category;
    private Supplier $supplier;

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
            'sort_order' => 1,
        ]);

        $this->supplier = Supplier::create([
            'name' => 'Fresh Foods Co',
        ]);
    }

    public function test_employee_cannot_access_items()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/items');

        $response->assertStatus(403);
    }

    public function test_manager_can_create_item_with_all_fields()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/items', [
            'name' => 'Tomatoes',
            'full_name' => 'Fresh Tomatoes - 5 lb Case',
            'category_id' => $this->category->id,
            'supplier_id' => $this->supplier->id,
            'unit' => 'Case',
            'par_level' => 10,
            'notes' => 'Test item',
            'sort_order' => 1,
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'name' => 'Tomatoes',
            'unit' => 'Case',
        ]);

        $this->assertDatabaseHas('items', [
            'name' => 'Tomatoes',
            'par_level' => 10,
        ]);
    }

    public function test_manager_can_update_item_unit()
    {
        $item = Item::create([
            'name' => 'Tomatoes',
            'category_id' => $this->category->id,
            'unit' => 'Case',
            'par_level' => 10,
        ]);

        $response = $this->withToken($this->managerToken)->putJson("/api/items/{$item->id}", [
            'unit' => 'Pound',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('items', [
            'id' => $item->id,
            'unit' => 'Pound',
        ]);
    }

    public function test_manager_can_deactivate_item()
    {
        $item = Item::create([
            'name' => 'Tomatoes',
            'category_id' => $this->category->id,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->managerToken)->deleteJson("/api/items/{$item->id}");

        $response->assertStatus(200);
        $this->assertDatabaseHas('items', [
            'id' => $item->id,
            'is_active' => false,
        ]);
    }

    public function test_manager_cannot_hard_delete_item()
    {
        $item = Item::create([
            'name' => 'Tomatoes',
            'category_id' => $this->category->id,
        ]);

        $itemId = $item->id;

        $this->withToken($this->managerToken)->deleteJson("/api/items/{$item->id}");

        // Item should still exist in database (soft delete via deactivate)
        $this->assertDatabaseHas('items', [
            'id' => $itemId,
        ]);
    }

    public function test_manager_can_get_items_list()
    {
        Item::create([
            'name' => 'Tomatoes',
            'category_id' => $this->category->id,
        ]);

        $response = $this->withToken($this->managerToken)->getJson('/api/items');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'unit', 'par_level'],
            ],
        ]);
    }

    public function test_manager_can_filter_items_by_category()
    {
        $item1 = Item::create([
            'name' => 'Tomatoes',
            'category_id' => $this->category->id,
        ]);

        $category2 = Category::create([
            'name' => 'Fruits',
            'sort_order' => 2,
        ]);

        $item2 = Item::create([
            'name' => 'Apples',
            'category_id' => $category2->id,
        ]);

        $response = $this->withToken($this->managerToken)->getJson("/api/items?category_id={$this->category->id}");

        $response->assertStatus(200);
        $items = $response->json('data');
        $this->assertEquals(1, count($items));
    }

    public function test_create_item_requires_name_and_category()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/items', [
            'unit' => 'Case',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'category_id']);
    }

    public function test_create_item_requires_valid_category_id()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/items', [
            'name' => 'Tomatoes',
            'category_id' => 99999,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('category_id');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CategoryApiTest extends TestCase
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
    }

    public function test_employee_cannot_access_categories()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/categories');

        $response->assertStatus(403);
    }

    public function test_manager_can_create_category()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/categories', [
            'name' => 'Vegetables',
            'icon' => '🥦',
            'color' => '#228B22',
            'sort_order' => 1,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('categories', [
            'name' => 'Vegetables',
        ]);
    }

    public function test_manager_can_update_category()
    {
        $category = Category::create([
            'name' => 'Vegetables',
            'sort_order' => 1,
        ]);

        $response = $this->withToken($this->managerToken)->putJson("/api/categories/{$category->id}", [
            'name' => 'Fresh Vegetables',
            'sort_order' => 2,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Fresh Vegetables',
            'sort_order' => 2,
        ]);
    }

    public function test_manager_can_reorder_categories()
    {
        $cat1 = Category::create([
            'name' => 'Vegetables',
            'sort_order' => 1,
        ]);

        $cat2 = Category::create([
            'name' => 'Fruits',
            'sort_order' => 2,
        ]);

        // Swap order
        $this->withToken($this->managerToken)->putJson("/api/categories/{$cat1->id}", [
            'sort_order' => 2,
        ]);

        $this->assertDatabaseHas('categories', [
            'id' => $cat1->id,
            'sort_order' => 2,
        ]);
    }

    public function test_cannot_delete_category_with_active_items()
    {
        $category = Category::create([
            'name' => 'Vegetables',
            'sort_order' => 1,
        ]);

        Item::create([
            'name' => 'Tomatoes',
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->managerToken)->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_can_delete_category_with_no_items()
    {
        $category = Category::create([
            'name' => 'Empty Category',
            'sort_order' => 1,
        ]);

        $response = $this->withToken($this->managerToken)->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_can_delete_category_with_only_inactive_items()
    {
        $category = Category::create([
            'name' => 'Vegetables',
            'sort_order' => 1,
        ]);

        Item::create([
            'name' => 'Tomatoes',
            'category_id' => $category->id,
            'is_active' => false,
        ]);

        $response = $this->withToken($this->managerToken)->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(200);
    }

    public function test_manager_can_get_all_categories()
    {
        Category::create(['name' => 'Vegetables', 'sort_order' => 1]);
        Category::create(['name' => 'Fruits', 'sort_order' => 2]);

        $response = $this->withToken($this->managerToken)->getJson('/api/categories');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }

    public function test_create_category_requires_name()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/categories', [
            'sort_order' => 1,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('name');
    }

    public function test_create_category_name_must_be_unique()
    {
        Category::create(['name' => 'Vegetables', 'sort_order' => 1]);

        $response = $this->withToken($this->managerToken)->postJson('/api/categories', [
            'name' => 'Vegetables',
            'sort_order' => 2,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('name');
    }
}

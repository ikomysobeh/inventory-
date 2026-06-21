<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\Supplier;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class SupplierApiTest extends TestCase
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

    public function test_employee_cannot_access_suppliers()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/suppliers');

        $response->assertStatus(403);
    }

    public function test_manager_can_create_supplier()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/suppliers', [
            'name' => 'Fresh Foods Co',
            'phone' => '555-1234',
            'notes' => 'High quality vegetables',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Fresh Foods Co',
        ]);
    }

    public function test_manager_can_update_supplier()
    {
        $supplier = Supplier::create([
            'name' => 'Fresh Foods Co',
            'phone' => '555-1234',
        ]);

        $response = $this->withToken($this->managerToken)->putJson("/api/suppliers/{$supplier->id}", [
            'phone' => '555-5678',
            'notes' => 'Updated notes',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'phone' => '555-5678',
        ]);
    }

    public function test_cannot_delete_supplier_linked_to_active_items()
    {
        $supplier = Supplier::create([
            'name' => 'Fresh Foods Co',
        ]);

        $category = Category::create([
            'name' => 'Vegetables',
            'sort_order' => 1,
        ]);

        Item::create([
            'name' => 'Tomatoes',
            'category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->managerToken)->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
    }

    public function test_can_delete_supplier_with_no_items()
    {
        $supplier = Supplier::create([
            'name' => 'Unused Supplier',
        ]);

        $response = $this->withToken($this->managerToken)->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }

    public function test_manager_can_get_all_suppliers()
    {
        Supplier::create(['name' => 'Fresh Foods Co']);
        Supplier::create(['name' => 'Sysco']);

        $response = $this->withToken($this->managerToken)->getJson('/api/suppliers');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }

    public function test_create_supplier_requires_name()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/suppliers', [
            'phone' => '555-1234',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('name');
    }

    public function test_supplier_name_must_be_unique()
    {
        Supplier::create(['name' => 'Fresh Foods Co']);

        $response = $this->withToken($this->managerToken)->postJson('/api/suppliers', [
            'name' => 'Fresh Foods Co',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('name');
    }
}

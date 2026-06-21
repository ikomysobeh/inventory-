<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserApiTest extends TestCase
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

    public function test_employee_cannot_access_users()
    {
        $response = $this->withToken($this->employeeToken)->getJson('/api/users');

        $response->assertStatus(403);
    }

    public function test_manager_can_create_employee_account()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/users', [
            'name' => 'New Employee',
            'email' => 'newemployee@test.local',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'employee',
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'name' => 'New Employee',
            'role' => 'employee',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'newemployee@test.local',
            'role' => 'employee',
        ]);
    }

    public function test_manager_can_create_manager_account()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/users', [
            'name' => 'New Manager',
            'email' => 'newmanager@test.local',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'manager',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'newmanager@test.local',
            'role' => 'manager',
        ]);
    }

    public function test_manager_can_deactivate_user()
    {
        $response = $this->withToken($this->managerToken)->putJson("/api/users/{$this->employee->id}", [
            'is_active' => false,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $this->employee->id,
            'is_active' => false,
        ]);
    }

    public function test_manager_can_reset_password()
    {
        $oldPassword = $this->employee->password;

        $response = $this->withToken($this->managerToken)->postJson("/api/users/{$this->employee->id}/reset-password", [
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200);

        $this->employee->refresh();
        $this->assertNotEquals($oldPassword, $this->employee->password);
    }

    public function test_manager_can_reset_password_revokes_old_tokens()
    {
        // Get original token
        $token = $this->employeeToken;

        // Verify token works
        $beforeReset = $this->withToken($token)->getJson('/api/auth/me');
        $beforeReset->assertStatus(200);

        // Reset password
        $this->withToken($this->managerToken)->postJson("/api/users/{$this->employee->id}/reset-password", [
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        // Old token should no longer work
        $afterReset = $this->withToken($token)->getJson('/api/auth/me');
        $afterReset->assertStatus(401);
    }

    public function test_manager_can_get_all_users()
    {
        User::create([
            'name' => 'Another User',
            'email' => 'another@test.local',
            'password' => bcrypt('password'),
            'role' => 'employee',
        ]);

        $response = $this->withToken($this->managerToken)->getJson('/api/users');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    public function test_manager_can_filter_users_by_role()
    {
        $response = $this->withToken($this->managerToken)->getJson('/api/users?role=employee');

        $response->assertStatus(200);
        $users = $response->json('data');
        $this->assertEquals(1, count($users));
        $this->assertEquals('employee', $users[0]['role']);
    }

    public function test_manager_can_filter_active_users()
    {
        $this->employee->update(['is_active' => false]);

        $response = $this->withToken($this->managerToken)->getJson('/api/users?is_active=true');

        $response->assertStatus(200);
        $users = $response->json('data');
        foreach ($users as $user) {
            $this->assertTrue($user['is_active']);
        }
    }

    public function test_manager_can_update_user_email()
    {
        $response = $this->withToken($this->managerToken)->putJson("/api/users/{$this->employee->id}", [
            'email' => 'newemail@test.local',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $this->employee->id,
            'email' => 'newemail@test.local',
        ]);
    }

    public function test_manager_can_update_user_role()
    {
        $response = $this->withToken($this->managerToken)->putJson("/api/users/{$this->employee->id}", [
            'role' => 'manager',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $this->employee->id,
            'role' => 'manager',
        ]);
    }

    public function test_create_user_requires_valid_password_confirmation()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/users', [
            'name' => 'New User',
            'email' => 'newuser@test.local',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword!',
            'role' => 'employee',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_create_user_requires_minimum_password_length()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/users', [
            'name' => 'New User',
            'email' => 'newuser@test.local',
            'password' => 'short',
            'password_confirmation' => 'short',
            'role' => 'employee',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_user_email_must_be_unique()
    {
        $response = $this->withToken($this->managerToken)->postJson('/api/users', [
            'name' => 'Duplicate Email',
            'email' => 'employee@test.local',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'employee',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_password_not_exposed_in_user_response()
    {
        $response = $this->withToken($this->managerToken)->getJson("/api/users/{$this->employee->id}");

        $response->assertStatus(200);
        $this->assertArrayNotHasKey('password', $response->json('data'));
    }
}

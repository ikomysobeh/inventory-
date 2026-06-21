<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use DatabaseMigrations;

    private User $manager;
    private User $employee;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test users
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
    }

    public function test_login_with_valid_credentials_returns_token_and_user()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'manager@test.local',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ],
        ]);
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_login_with_wrong_password_returns_401()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'manager@test.local',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
        $response->assertJsonFragment([
            'message' => 'Invalid credentials or account is inactive.',
        ]);
    }

    public function test_login_with_nonexistent_email_returns_401()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@test.local',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_with_inactive_user_returns_401()
    {
        $this->manager->update(['is_active' => false]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'manager@test.local',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
    }

    public function test_logout_invalidates_token()
    {
        // Login first
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'manager@test.local',
            'password' => 'password',
        ]);
        $token = $loginResponse->json('data.token');

        // Logout
        $response = $this->withToken($token)->postJson('/api/auth/logout');
        $response->assertStatus(200);

        // Try to use token again - should fail
        $meResponse = $this->withToken($token)->getJson('/api/auth/me');
        $meResponse->assertStatus(401);
    }

    public function test_me_returns_correct_user_data()
    {
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'employee@test.local',
            'password' => 'password',
        ]);
        $token = $loginResponse->json('data.token');

        $response = $this->withToken($token)->getJson('/api/auth/me');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'data' => [
                'id' => $this->employee->id,
                'name' => 'Test Employee',
                'email' => 'employee@test.local',
                'role' => 'employee',
            ],
        ]);
    }

    public function test_me_without_token_returns_401()
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_login_requires_email_and_password()
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_employee_can_login()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'employee@test.local',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'role' => 'employee',
        ]);
    }
}

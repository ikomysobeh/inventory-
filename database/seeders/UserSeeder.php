<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default manager account
        User::create([
            'name' => 'Manager',
            'email' => env('MANAGER_EMAIL', 'manager@restaurant.local'),
            'password' => env('MANAGER_PASSWORD', 'password'),
            'role' => 'manager',
            'is_active' => true,
        ]);
    }
}

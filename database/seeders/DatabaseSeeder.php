<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed in correct order: Categories → Suppliers → Items → Users
        $this->call([
            CategorySeeder::class,
            SupplierSeeder::class,
            ItemSeeder::class,
            UserSeeder::class,
        ]);
    }
}

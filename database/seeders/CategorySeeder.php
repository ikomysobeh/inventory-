<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Vegetables & Produce', 'icon' => '🥦', 'color' => '#22c55e', 'sort_order' => 1],
            ['name' => 'Fruits', 'icon' => '🍋', 'color' => '#fbbf24', 'sort_order' => 2],
            ['name' => 'Canned & Jarred Items', 'icon' => '🥫', 'color' => '#f97316', 'sort_order' => 3],
            ['name' => 'Raw Meat', 'icon' => '🥩', 'color' => '#ef4444', 'sort_order' => 4],
            ['name' => 'Dairy & Pantry', 'icon' => '🧀', 'color' => '#f59e0b', 'sort_order' => 5],
            ['name' => 'Grains & Dry Goods', 'icon' => '🌾', 'color' => '#ca8a04', 'sort_order' => 6],
            ['name' => 'Bread', 'icon' => '🫓', 'color' => '#d97706', 'sort_order' => 7],
            ['name' => 'Oils & Liquids', 'icon' => '🫙', 'color' => '#78716c', 'sort_order' => 8],
            ['name' => 'Drinks', 'icon' => '🥤', 'color' => '#0ea5e9', 'sort_order' => 9],
            ['name' => 'Packaging & Supplies', 'icon' => '📦', 'color' => '#64748b', 'sort_order' => 10],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}

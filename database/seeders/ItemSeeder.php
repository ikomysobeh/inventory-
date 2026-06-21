<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Supplier;
use App\Models\Item;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get category and supplier references
        $categories = Category::pluck('id', 'name')->toArray();
        $suppliers = Supplier::pluck('id', 'name')->toArray();

        $items = [
            // Vegetables & Produce
            ['name' => 'Tomatoes', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 5, 'sort_order' => 1],
            ['name' => 'Lettuce', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Head', 'par_level' => 10, 'sort_order' => 2],
            ['name' => 'Onions', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 3, 'sort_order' => 3],
            ['name' => 'Parsley', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 5, 'sort_order' => 4],
            ['name' => 'Mint', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 3, 'sort_order' => 5],
            ['name' => 'Bell Peppers', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 4, 'sort_order' => 6],
            ['name' => 'Garlic', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 3, 'sort_order' => 7],
            ['name' => 'Cucumber', 'category_id' => $categories['Vegetables & Produce'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 3, 'sort_order' => 8],

            // Fruits
            ['name' => 'Lemons', 'category_id' => $categories['Fruits'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 2, 'sort_order' => 1],
            ['name' => 'Oranges', 'category_id' => $categories['Fruits'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 2, 'sort_order' => 2],
            ['name' => 'Bananas', 'category_id' => $categories['Fruits'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 3, 'sort_order' => 3],

            // Canned & Jarred Items
            ['name' => 'Olive Oil', 'category_id' => $categories['Oils & Liquids'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bottle', 'par_level' => 4, 'sort_order' => 1],
            ['name' => 'Vinegar', 'category_id' => $categories['Oils & Liquids'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bottle', 'par_level' => 2, 'sort_order' => 2],
            ['name' => 'Tomato Sauce', 'category_id' => $categories['Canned & Jarred Items'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Can', 'par_level' => 12, 'sort_order' => 3],
            ['name' => 'Grape Leaves', 'category_id' => $categories['Canned & Jarred Items'], 'supplier_id' => $suppliers['Arabic Store (Silwady)'], 'unit' => 'Jar', 'par_level' => 5, 'sort_order' => 4],

            // Raw Meat
            ['name' => 'Chicken Breast', 'category_id' => $categories['Raw Meat'], 'supplier_id' => $suppliers['Saad Wholesale Meat'], 'unit' => 'LB', 'par_level' => 20, 'sort_order' => 1],
            ['name' => 'Lamb', 'category_id' => $categories['Raw Meat'], 'supplier_id' => $suppliers['Saad Wholesale Meat'], 'unit' => 'LB', 'par_level' => 15, 'sort_order' => 2],
            ['name' => 'Ground Beef', 'category_id' => $categories['Raw Meat'], 'supplier_id' => $suppliers['Saad Wholesale Meat'], 'unit' => 'LB', 'par_level' => 15, 'sort_order' => 3],
            ['name' => 'Fish', 'category_id' => $categories['Raw Meat'], 'supplier_id' => $suppliers['Atlantic Food'], 'unit' => 'LB', 'par_level' => 10, 'sort_order' => 4],

            // Dairy & Pantry
            ['name' => 'Yogurt', 'category_id' => $categories['Dairy & Pantry'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 8, 'sort_order' => 1],
            ['name' => 'Feta Cheese', 'category_id' => $categories['Dairy & Pantry'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 3, 'sort_order' => 2],
            ['name' => 'Ayran', 'category_id' => $categories['Dairy & Pantry'], 'supplier_id' => $suppliers['Arabic Store (Silwady)'], 'unit' => 'Case', 'par_level' => 6, 'sort_order' => 3],
            ['name' => 'Milk', 'category_id' => $categories['Dairy & Pantry'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Gallon', 'par_level' => 4, 'sort_order' => 4],
            ['name' => 'Butter', 'category_id' => $categories['Dairy & Pantry'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'LB', 'par_level' => 3, 'sort_order' => 5],

            // Grains & Dry Goods
            ['name' => 'Rice', 'category_id' => $categories['Grains & Dry Goods'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 5, 'sort_order' => 1],
            ['name' => 'Flour', 'category_id' => $categories['Grains & Dry Goods'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 3, 'sort_order' => 2],
            ['name' => 'Sugar', 'category_id' => $categories['Grains & Dry Goods'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 2, 'sort_order' => 3],
            ['name' => 'Pasta', 'category_id' => $categories['Grains & Dry Goods'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Box', 'par_level' => 10, 'sort_order' => 4],

            // Bread
            ['name' => 'Pita Bread', 'category_id' => $categories['Bread'], 'supplier_id' => $suppliers['AlShams Bakery MI'], 'unit' => 'Case', 'par_level' => 5, 'sort_order' => 1],
            ['name' => 'Hamburger Buns', 'category_id' => $categories['Bread'], 'supplier_id' => $suppliers['AlShams Bakery MI'], 'unit' => 'Bag', 'par_level' => 6, 'sort_order' => 2],
            ['name' => 'Sandwich Bread', 'category_id' => $categories['Bread'], 'supplier_id' => $suppliers['AlShams Bakery MI'], 'unit' => 'Loaf', 'par_level' => 4, 'sort_order' => 3],

            // Drinks
            ['name' => 'Coca-Cola', 'category_id' => $categories['Drinks'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 10, 'sort_order' => 1],
            ['name' => 'Sprite', 'category_id' => $categories['Drinks'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Case', 'par_level' => 8, 'sort_order' => 2],
            ['name' => 'Orange Juice', 'category_id' => $categories['Drinks'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Gallon', 'par_level' => 4, 'sort_order' => 3],
            ['name' => 'Coffee', 'category_id' => $categories['Drinks'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Bag', 'par_level' => 3, 'sort_order' => 4],
            ['name' => 'Tea', 'category_id' => $categories['Drinks'], 'supplier_id' => $suppliers['Sysco'], 'unit' => 'Box', 'par_level' => 2, 'sort_order' => 5],

            // Packaging & Supplies
            ['name' => 'Plastic Forks', 'category_id' => $categories['Packaging & Supplies'], 'supplier_id' => $suppliers['Web Restaurant'], 'unit' => 'Box', 'par_level' => 8, 'sort_order' => 1],
            ['name' => 'Paper Plates', 'category_id' => $categories['Packaging & Supplies'], 'supplier_id' => $suppliers['Web Restaurant'], 'unit' => 'Case', 'par_level' => 5, 'sort_order' => 2],
            ['name' => 'Napkins', 'category_id' => $categories['Packaging & Supplies'], 'supplier_id' => $suppliers['Web Restaurant'], 'unit' => 'Case', 'par_level' => 10, 'sort_order' => 3],
        ];

        foreach ($items as $item) {
            Item::create($item);
        }
    }
}

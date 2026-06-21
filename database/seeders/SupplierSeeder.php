<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            ['name' => 'Sysco'],
            ['name' => "Sam's Club"],
            ['name' => 'Arabic Store (Silwady)'],
            ['name' => 'Saad Wholesale Meat'],
            ['name' => 'Atlantic Food'],
            ['name' => 'Banyan Food Service'],
            ['name' => 'Web Restaurant'],
            ['name' => 'Restaurant Depot'],
            ['name' => 'Kroger'],
            ['name' => 'Costco'],
            ['name' => 'Amazon'],
            ['name' => 'ARYZ Wholesale'],
            ['name' => 'AlShams Bakery MI'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}

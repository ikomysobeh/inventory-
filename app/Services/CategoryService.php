<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Item;

class CategoryService
{
    public function getAll(): array
    {
        return Category::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->toArray();
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);
        return $category;
    }

    /**
     * Delete category.
     * Fixed: now blocks if ANY items exist (active or inactive) to prevent silent data loss.
     * Previously only blocked on active items, then silently deleted inactive ones.
     */
    public function delete(Category $category): array
    {
        $itemCount = Item::where('category_id', $category->id)->count();

        if ($itemCount > 0) {
            return [
                'success' => false,
                'message' => "Cannot delete category \"{$category->name}\" — it has {$itemCount} item(s) linked to it. Reassign or delete those items first.",
            ];
        }

        $category->delete();

        return [
            'success' => true,
            'message' => 'Category deleted successfully.',
        ];
    }
}

<?php

namespace App\Services;

use App\Models\Item;

class ItemService
{
    /**
     * Get all items with optional filters.
     * Uses the active() scope instead of raw where('is_active', true).
     */
    public function getAll(array $filters = []): array
    {
        $query = Item::with(['category', 'supplier']);

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('full_name', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->orderBy('name')->get()->toArray();
    }

    public function getById(int $id): ?array
    {
        $item = Item::with(['category', 'supplier'])->find($id);
        return $item?->toArray();
    }

    public function create(array $data): Item
    {
        return Item::create($data);
    }

    public function update(Item $item, array $data): Item
    {
        $item->update($data);
        return $item->fresh(['category', 'supplier']);
    }

    /**
     * Soft-delete by deactivating — preserves historical inventory entries.
     */
    public function deactivate(Item $item): void
    {
        $item->update(['is_active' => false]);
    }
}

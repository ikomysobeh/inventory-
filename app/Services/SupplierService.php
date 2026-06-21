<?php

namespace App\Services;

use App\Models\Supplier;
use App\Models\Item;

class SupplierService
{
    public function getAll(): array
    {
        return Supplier::orderBy('name')
            ->get()
            ->toArray();
    }

    public function create(array $data): Supplier
    {
        return Supplier::create($data);
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);
        return $supplier;
    }

    /**
     * Delete supplier.
     * Fixed: now blocks if ANY items exist (active or inactive) to prevent silent data loss.
     * Previously only blocked on active items, then silently deleted inactive ones.
     */
    public function delete(Supplier $supplier): array
    {
        $itemCount = Item::where('supplier_id', $supplier->id)->count();

        if ($itemCount > 0) {
            return [
                'success' => false,
                'message' => "Cannot delete supplier \"{$supplier->name}\" — it has {$itemCount} item(s) linked to it. Reassign or delete those items first.",
            ];
        }

        $supplier->delete();

        return [
            'success' => true,
            'message' => 'Supplier deleted successfully.',
        ];
    }
}

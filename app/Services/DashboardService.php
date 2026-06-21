<?php

namespace App\Services;

use App\Models\Item;
use App\Models\InventoryEntry;
use Carbon\Carbon;

class DashboardService
{
    public function getSummary(): array
    {
        $today = Carbon::now()->toDateString();

        // Load all active items in one query
        $items = Item::where('is_active', true)->get(['id', 'par_level']);

        // Load ALL today's entries for all items in ONE query instead of one per item
        $entries = InventoryEntry::whereIn('item_id', $items->pluck('id'))
            ->where('entry_date', $today)
            ->get(['item_id', 'qty_restaurant', 'qty_office'])
            ->keyBy('item_id');

        $lowStockCount = 0;
        foreach ($items as $item) {
            $entry = $entries->get($item->id);
            $total = ($entry?->qty_restaurant ?? 0) + ($entry?->qty_office ?? 0);
            if ($total < ($item->par_level ?? 999)) {
                $lowStockCount++;
            }
        }

        $lastEntryDate = InventoryEntry::orderBy('entry_date', 'desc')->value('entry_date');
        if ($lastEntryDate) {
            $lastEntryDate = Carbon::parse($lastEntryDate)->toDateString();
        }

        return [
            'total_items'      => $items->count(),
            'low_stock_count'  => $lowStockCount,
            'last_entry_date'  => $lastEntryDate,
        ];
    }

    public function getLowStock(): array
    {
        $today = Carbon::now()->toDateString();

        $items = Item::with(['category', 'supplier'])
            ->where('is_active', true)
            ->get();

        // Load ALL today's entries in ONE query instead of one per item
        $entries = InventoryEntry::whereIn('item_id', $items->pluck('id'))
            ->where('entry_date', $today)
            ->get(['item_id', 'qty_restaurant', 'qty_office'])
            ->keyBy('item_id');

        $lowStockItems = [];

        foreach ($items as $item) {
            $entry    = $entries->get($item->id);
            $qtyRest  = $entry?->qty_restaurant ?? 0;
            $qtyOff   = $entry?->qty_office ?? 0;
            $total    = $qtyRest + $qtyOff;
            $parLevel = $item->par_level ?? 999;

            if ($total < $parLevel) {
                $lowStockItems[] = [
                    'item_id'        => $item->id,
                    'name'           => $item->name,
                    'unit'           => $item->unit,
                    'par_level'      => $parLevel,
                    'qty_restaurant' => $qtyRest,
                    'qty_office'     => $qtyOff,
                    'qty_total'      => $total,
                    'qty_needed'     => $parLevel - $total,
                    'category'       => $item->category->name,
                    'supplier'       => $item->supplier?->name,
                ];
            }
        }

        usort($lowStockItems, fn($a, $b) => $b['qty_needed'] <=> $a['qty_needed']);

        return $lowStockItems;
    }

    public function getShoppingList(): array
    {
        $shoppingListBySupplier = [];

        foreach ($this->getLowStock() as $item) {
            $supplier = $item['supplier'] ?? 'No Supplier';
            $shoppingListBySupplier[$supplier][] = [
                'item_name'  => $item['name'],
                'unit'       => $item['unit'],
                'qty_needed' => $item['qty_needed'],
            ];
        }

        $shoppingList = [];
        foreach ($shoppingListBySupplier as $supplier => $items) {
            $shoppingList[] = ['supplier' => $supplier, 'items' => $items];
        }

        return $shoppingList;
    }

    public function exportCsv(): string
    {
        $today = Carbon::now()->toDateString();

        $items = Item::with(['category', 'supplier'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Load all entries in ONE query
        $entries = InventoryEntry::whereIn('item_id', $items->pluck('id'))
            ->where('entry_date', $today)
            ->get(['item_id', 'qty_restaurant', 'qty_office', 'notes'])
            ->keyBy('item_id');

        $csv = "Item Name,Full Name,Category,Supplier,Unit,Par Level,Restaurant Qty,Office Qty,Total Qty,Status,Date,Notes\n";

        foreach ($items as $item) {
            $entry   = $entries->get($item->id);
            $qtyRest = $entry?->qty_restaurant ?? 0;
            $qtyOff  = $entry?->qty_office ?? 0;
            $total   = $qtyRest + $qtyOff;
            $status  = $total < ($item->par_level ?? 999) ? 'LOW' : 'OK';

            $csv .= sprintf(
                '"%s","%s","%s","%s","%s",%s,%s,%s,%s,"%s","%s","%s"' . "\n",
                str_replace('"', '""', $item->name),
                str_replace('"', '""', $item->full_name ?? ''),
                str_replace('"', '""', $item->category->name),
                str_replace('"', '""', $item->supplier?->name ?? ''),
                str_replace('"', '""', $item->unit ?? ''),
                $item->par_level ?? '',
                $qtyRest,
                $qtyOff,
                $total,
                $status,
                $today,
                str_replace('"', '""', $entry?->notes ?? '')
            );
        }

        return $csv;
    }

    public function getShoppingListForPdf(): array
    {
        return $this->getShoppingList();
    }
}

<?php

namespace App\Services;

use App\Models\InventoryEntry;
use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Get checklist for a given date.
     * Fixed: was N+1 (1 query per item). Now: 4 queries total regardless of item count.
     */
    public function getChecklist(string $date): array
    {
        $dateObj = Carbon::parse($date)->toDateString();

        $items = Item::with(['category', 'supplier'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // ONE query for all today's entries, keyed by item_id for O(1) lookup
        $entries = InventoryEntry::whereIn('item_id', $items->pluck('id'))
            ->where('entry_date', $dateObj)
            ->get(['item_id', 'qty_restaurant', 'qty_office'])
            ->keyBy('item_id');

        $grouped = $items->groupBy(fn($item) => $item->category->name);

        $checklist = [];
        foreach ($grouped as $categoryName => $categoryItems) {
            $categoryData = [
                'name'  => $categoryName,
                'icon'  => $categoryItems[0]->category->icon ?? null,
                'items' => [],
            ];

            foreach ($categoryItems as $item) {
                $entry   = $entries->get($item->id);
                $qtyRest = $entry?->qty_restaurant ?? 0;
                $qtyOff  = $entry?->qty_office ?? 0;
                $total   = $qtyRest + $qtyOff;

                $categoryData['items'][] = [
                    'item_id'        => $item->id,
                    'name'           => $item->name,
                    'full_name'      => $item->full_name,
                    'unit'           => $item->unit,
                    'par_level'      => $item->par_level,
                    'supplier_id'    => $item->supplier_id,
                    'supplier_name'  => $item->supplier?->name,
                    'qty_restaurant' => $qtyRest,
                    'qty_office'     => $qtyOff,
                    'qty_total'      => $total,
                    'is_low_stock'   => $total < ($item->par_level ?? 999),
                ];
            }

            $checklist[] = $categoryData;
        }

        return $checklist;
    }

    /**
     * Save inventory entries for a date.
     * Fixed: was N×2 queries (updateOrCreate loop). Now: 1 query via upsert.
     */
    public function saveEntries(int $userId, array $entries, string $date): bool
    {
        $dateObj = Carbon::parse($date)->toDateString();
        $now     = now();

        $rows = array_map(fn($entry) => [
            'item_id'        => $entry['item_id'],
            'entry_date'     => $dateObj,
            'qty_restaurant' => $entry['qty_restaurant'] ?? 0,
            'qty_office'     => $entry['qty_office'] ?? 0,
            'entered_by'     => $userId,
            'notes'          => $entry['notes'] ?? null,
            'created_at'     => $now,
            'updated_at'     => $now,
        ], $entries);

        DB::table('inventory_entries')->upsert(
            $rows,
            ['item_id', 'entry_date'],
            ['qty_restaurant', 'qty_office', 'entered_by', 'notes', 'updated_at']
        );

        return true;
    }

    /**
     * Get history for an item over N days.
     * Includes who entered each day and at what time.
     */
    public function getHistory(int $itemId, int $days = 14): array
    {
        $startDate = Carbon::now()->subDays($days)->toDateString();

        return InventoryEntry::with('enteredBy:id,name')
            ->where('item_id', $itemId)
            ->where('entry_date', '>=', $startDate)
            ->orderBy('entry_date', 'desc')
            ->get()
            ->map(fn($entry) => [
                'entry_date'     => $entry->entry_date->toDateString(),
                'qty_restaurant' => $entry->qty_restaurant,
                'qty_office'     => $entry->qty_office,
                'qty_total'      => $entry->qty_restaurant + $entry->qty_office,
                'entered_by'     => $entry->enteredBy?->name,
                'entered_at'     => $entry->updated_at->format('H:i'),
            ])
            ->toArray();
    }

    /**
     * Get daily audit for a date.
     * Returns ALL active items — entered ones show quantities + who,
     * missing ones show status = 'missing'.
     */
    public function getAudit(string $date, ?int $userId = null): array
    {
        $dateObj = Carbon::parse($date)->toDateString();

        $items = Item::with('category')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $entryQuery = InventoryEntry::with('enteredBy:id,name')
            ->whereIn('item_id', $items->pluck('id'))
            ->where('entry_date', $dateObj);

        if ($userId) {
            $entryQuery->where('entered_by', $userId);
        }

        $entries = $entryQuery->get()->keyBy('item_id');

        $rows = $items->map(function ($item) use ($entries) {
            $entry = $entries->get($item->id);

            if ($entry) {
                $total = $entry->qty_restaurant + $entry->qty_office;
                return [
                    'item_id'        => $item->id,
                    'item_name'      => $item->name,
                    'full_name'      => $item->full_name,
                    'category'       => $item->category->name,
                    'unit'           => $item->unit,
                    'par_level'      => $item->par_level,
                    'qty_restaurant' => $entry->qty_restaurant,
                    'qty_office'     => $entry->qty_office,
                    'qty_total'      => $total,
                    'is_low_stock'   => $item->par_level !== null && $total < $item->par_level,
                    'status'         => 'entered',
                    'entered_by'     => $entry->enteredBy?->name,
                    'entered_at'     => $entry->updated_at->format('H:i'),
                ];
            }

            return [
                'item_id'        => $item->id,
                'item_name'      => $item->name,
                'full_name'      => $item->full_name,
                'category'       => $item->category->name,
                'unit'           => $item->unit,
                'par_level'      => $item->par_level,
                'qty_restaurant' => null,
                'qty_office'     => null,
                'qty_total'      => null,
                'is_low_stock'   => null,
                'status'         => 'missing',
                'entered_by'     => null,
                'entered_at'     => null,
            ];
        });

        // Entered rows first, missing rows at the bottom
        $sorted       = $rows->sortBy(fn($r) => $r['status'] === 'missing' ? 1 : 0)->values();
        $enteredCount = $rows->where('status', 'entered')->count();
        $totalCount   = $rows->count();

        return [
            'data' => $sorted->toArray(),
            'meta' => [
                'date'           => $dateObj,
                'total_items'    => $totalCount,
                'entered_count'  => $enteredCount,
                'missing_count'  => $totalCount - $enteredCount,
                'completion_pct' => $totalCount > 0 ? round($enteredCount / $totalCount * 100) : 0,
            ],
        ];
    }
}

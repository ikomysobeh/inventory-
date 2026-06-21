<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveInventoryRequest;
use App\Models\Item;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        private InventoryService $inventoryService,
    ) {}

    public function index(Request $request)
    {
        $date      = $request->query('date', now()->toDateString());
        $checklist = $this->inventoryService->getChecklist($date);

        return response()->json(['data' => $checklist]);
    }

    public function save(SaveInventoryRequest $request)
    {
        $date = $request->query('date', now()->toDateString());

        $this->inventoryService->saveEntries(
            $request->user()->id,
            $request->validated('entries'),
            $date
        );

        return response()->json(['message' => 'Inventory entries saved successfully.']);
    }

    /**
     * Get history for a specific item.
     */
    public function history(Request $request)
    {
        
        $itemId = $request->query('item_id');
        $days   = (int) $request->query('days', 14);

        if (!$itemId) {
            return response()->json(['message' => 'item_id query parameter is required.'], 400);
        }

        if (!Item::where('id', $itemId)->exists()) {
            return response()->json(['message' => 'Item not found.'], 404);
        }

        $history = $this->inventoryService->getHistory((int) $itemId, $days);

        return response()->json(['data' => $history]);
    }

    /**
     * Daily audit — all active items for a date, entered or missing.
     * Manager only (enforced via route middleware).
     */
    public function audit(Request $request)
    {
        $date   = $request->query('date', now()->toDateString());
        $userId = $request->query('user_id');

        $result = $this->inventoryService->getAudit($date, $userId ? (int) $userId : null);

        return response()->json($result);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Item;
use App\Services\ItemService;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function __construct(
        private ItemService $itemService,
    ) {}

    /**
     * Get all items with optional filters
     */
    public function index(Request $request)
    {
        $filters = [
            'category_id' => $request->query('category_id'),
            'supplier_id' => $request->query('supplier_id'),
            'is_active' => $request->query('is_active'),
            'search' => $request->query('search'),
        ];

        $items = $this->itemService->getAll(array_filter($filters, fn($v) => $v !== null));

        return response()->json([
            'data' => $items,
        ]);
    }

    /**
     * Create new item
     */
    public function store(StoreItemRequest $request)
    {
        $item = $this->itemService->create($request->validated());

        return response()->json([
            'data' => $item,
            'message' => 'Item created successfully.',
        ], 201);
    }

    /**
     * Get single item
     */
    public function show(Item $item)
    {
        $data = $this->itemService->getById($item->id);

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Update item
     */
    public function update(UpdateItemRequest $request, Item $item)
    {
        $updated = $this->itemService->update($item, $request->validated());

        return response()->json([
            'data' => $updated,
            'message' => 'Item updated successfully.',
        ]);
    }

    /**
     * Deactivate item (soft delete)
     */
    public function destroy(Item $item)
    {
        $this->itemService->deactivate($item);

        return response()->json([
            'message' => 'Item deactivated successfully.',
        ]);
    }
}

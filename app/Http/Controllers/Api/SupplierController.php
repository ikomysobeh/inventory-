<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function __construct(
        private SupplierService $supplierService,
    ) {}

    /**
     * Get all suppliers
     */
    public function index()
    {
        $suppliers = $this->supplierService->getAll();

        return response()->json([
            'data' => $suppliers,
        ]);
    }

    /**
     * Create new supplier
     */
    public function store(StoreSupplierRequest $request)
    {
        $supplier = $this->supplierService->create($request->validated());

        return response()->json([
            'data' => $supplier,
            'message' => 'Supplier created successfully.',
        ], 201);
    }

    /**
     * Get single supplier
     */
    public function show(Supplier $supplier)
    {
        return response()->json([
            'data' => $supplier,
        ]);
    }

    /**
     * Update supplier
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $updated = $this->supplierService->update($supplier, $request->validated());

        return response()->json([
            'data' => $updated,
            'message' => 'Supplier updated successfully.',
        ]);
    }

    /**
     * Delete supplier
     */
    public function destroy(Supplier $supplier)
    {
        $result = $this->supplierService->delete($supplier);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'message' => $result['message'],
        ]);
    }
}

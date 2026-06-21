<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ============================================
// Public Routes
// ============================================

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');  // max 10 login attempts per minute per IP

// ============================================
// Protected Routes (Authentication Required)
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Inventory (Employee + Manager)
    Route::get('/inventory',         [InventoryController::class, 'index']);
    Route::post('/inventory/save',   [InventoryController::class, 'save']);

    // ============================================
    // Manager Only Routes
    // ============================================

    Route::middleware('manager')->group(function () {
    
        // Inventory history & audit (manager only)
        Route::get('/inventory/history', [InventoryController::class, 'history']);
        Route::get('/inventory/audit',   [InventoryController::class, 'audit']);

        // Dashboard
        Route::get('/dashboard',                    [DashboardController::class, 'summary']);
        Route::get('/dashboard/low-stock',          [DashboardController::class, 'lowStock']);
        Route::get('/dashboard/shopping-list',      [DashboardController::class, 'shoppingList']);
        Route::get('/dashboard/shopping-list/pdf',  [DashboardController::class, 'exportShoppingListPdf']);
        Route::get('/dashboard/export-csv',         [DashboardController::class, 'exportCsv']);

        // CRUD resources
        Route::apiResource('items',      ItemController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('suppliers',  SupplierController::class);
        Route::apiResource('users',      UserController::class);

        // Password reset — rate-limited to 5 resets per minute per IP
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])
            ->middleware('throttle:5,1');
    });
});

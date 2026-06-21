<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
    ) {}

    /**
     * Get dashboard summary
     */
    public function summary()
    {
        $summary = $this->dashboardService->getSummary();

        return response()->json([
            'data' => $summary,
        ]);
    }

    /**
     * Get low stock items
     */
    public function lowStock()
    {
        $items = $this->dashboardService->getLowStock();

        return response()->json([
            'data' => $items,
        ]);
    }

    /**
     * Get shopping list grouped by supplier
     */
    public function shoppingList()
    {
        $list = $this->dashboardService->getShoppingList();

        return response()->json([
            'data' => $list,
        ]);
    }

    /**
     * Export CSV
     */
    public function exportCsv()
    {
        $csv = $this->dashboardService->exportCsv();

        return new StreamedResponse(
            function () use ($csv) {
                echo $csv;
            },
            200,
            [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="inventory_' . now()->format('Y-m-d') . '.csv"',
            ]
        );
    }

    /**
     * Export shopping list as PDF
     */
    public function exportShoppingListPdf()
    {
        $list = $this->dashboardService->getShoppingListForPdf();

        return response()->json([
            'message' => 'PDF export requires dompdf package. Implement separately.',
            'data' => $list,
        ]);
    }
}

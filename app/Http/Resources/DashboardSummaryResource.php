<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_items' => $this->total_items,
            'low_stock_count' => $this->low_stock_count,
            'last_entry_date' => $this->last_entry_date,
        ];
    }
}

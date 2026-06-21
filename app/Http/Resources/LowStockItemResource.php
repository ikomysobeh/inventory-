<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LowStockItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $qtyTotal = ($this->qty_restaurant ?? 0) + ($this->qty_office ?? 0);
        $qtyNeeded = max(0, ($this->par_level ?? 0) - $qtyTotal);

        return [
            'item_id' => $this->id,
            'name' => $this->name,
            'unit' => $this->unit,
            'par_level' => $this->par_level,
            'qty_restaurant' => $this->qty_restaurant ?? 0,
            'qty_office' => $this->qty_office ?? 0,
            'qty_total' => $qtyTotal,
            'qty_needed' => $qtyNeeded,
            'category' => $this->whenLoaded('category', fn() => $this->category?->name),
            'supplier' => $this->whenLoaded('supplier', fn() => $this->supplier?->name),
        ];
    }
}

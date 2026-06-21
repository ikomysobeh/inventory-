<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChecklistItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $total = ($this->qty_restaurant ?? 0) + ($this->qty_office ?? 0);
        $isLowStock = $total < ($this->par_level ?? 0);

        return [
            'item_id' => $this->id,
            'name' => $this->name,
            'full_name' => $this->full_name,
            'unit' => $this->unit,
            'par_level' => $this->par_level,
            'qty_restaurant' => $this->qty_restaurant ?? 0,
            'qty_office' => $this->qty_office ?? 0,
            'is_low_stock' => $isLowStock,
        ];
    }
}

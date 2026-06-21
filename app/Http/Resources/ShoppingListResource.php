<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShoppingListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $supplierName = $this->supplier?->name ?? 'No Supplier';
        $qtyNeeded = max(0, ($this->par_level ?? 0) - (($this->qty_restaurant ?? 0) + ($this->qty_office ?? 0)));

        return [
            'supplier' => $supplierName,
            'item_name' => $this->name,
            'unit' => $this->unit,
            'qty_needed' => $qtyNeeded,
        ];
    }
}

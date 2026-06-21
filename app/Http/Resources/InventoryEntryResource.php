<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_id' => $this->item_id,
            'entry_date' => $this->entry_date,
            'qty_restaurant' => $this->qty_restaurant,
            'qty_office' => $this->qty_office,
            'notes' => $this->notes,
            'entered_by' => $this->whenLoaded('enteredBy', fn() => $this->enteredBy?->name),
        ];
    }
}

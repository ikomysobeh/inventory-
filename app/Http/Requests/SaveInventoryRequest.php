<?php

namespace App\Http\Requests;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Fixed: was exists:items,id which runs 1 query per entry (N+1).
     * Now: one query loads all valid IDs, Rule::in() validates against the collection.
     */
    public function rules(): array
    {
        $validItemIds = Item::where('is_active', true)->pluck('id')->all();

        return [
            'entries'                  => ['required', 'array', 'min:1'],
            'entries.*.item_id'        => ['required', 'integer', Rule::in($validItemIds)],
            'entries.*.qty_restaurant' => ['required', 'numeric', 'min:0'],
            'entries.*.qty_office'     => ['required', 'numeric', 'min:0'],
            'entries.*.notes'          => ['nullable', 'string', 'max:500'],
        ];
    }
}

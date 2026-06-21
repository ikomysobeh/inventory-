<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'full_name',
        'category_id',
        'supplier_id',
        'unit',
        'par_level',
        'notes',
        'sort_order',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'par_level' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Scope: Get active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the category this item belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the supplier this item belongs to.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class)->withDefault();
    }

    /**
     * Get all inventory entries for this item.
     */
    public function inventoryEntries(): HasMany
    {
        return $this->hasMany(InventoryEntry::class);
    }
}

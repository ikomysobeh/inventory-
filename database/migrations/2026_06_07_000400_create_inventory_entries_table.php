<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('item_id');
            $table->date('entry_date');
            $table->decimal('qty_restaurant', 10, 2)->default(0);
            $table->decimal('qty_office', 10, 2)->default(0);
            $table->unsignedBigInteger('entered_by');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('item_id')->references('id')->on('items')->cascadeOnDelete();
            $table->unique(['item_id', 'entry_date']);
            $table->index('entry_date');
            $table->index('entered_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_entries');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revenue_category_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->constrained('budget_years')->cascadeOnDelete();
            $table->string('category_id', 32);
            $table->decimal('target_amount', 20, 4)->default(0);
            $table->timestamps();

            $table->unique(['budget_year_id', 'category_id'], 'revenue_category_targets_unique');
            $table->index('budget_year_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revenue_category_targets');
    }
};

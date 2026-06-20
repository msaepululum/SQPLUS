<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_monthly_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->constrained('budget_years')->cascadeOnDelete();
            $table->unsignedBigInteger('pagu_ksro_id');
            $table->unsignedTinyInteger('bulan');
            $table->decimal('rencana_penarikan', 20, 4)->default(0);
            $table->timestamps();

            $table->unique(['budget_year_id', 'pagu_ksro_id', 'bulan'], 'budget_monthly_withdrawals_unique');
            $table->index(['budget_year_id', 'pagu_ksro_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_monthly_withdrawals');
    }
};

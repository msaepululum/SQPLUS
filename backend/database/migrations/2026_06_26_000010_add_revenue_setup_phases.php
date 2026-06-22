<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revenue_year_setups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->unique()->constrained('budget_years')->cascadeOnDelete();
            $table->string('setup_status', 20)->default('semula');
            $table->timestamp('semula_locked_at')->nullable();
            $table->timestamp('pergeseran_opened_at')->nullable();
            $table->timestamp('perubahan_opened_at')->nullable();
            $table->timestamps();
        });

        Schema::table('revenue_category_targets', function (Blueprint $table) {
            $table->decimal('pergeseran_amount', 20, 4)->default(0)->after('target_amount');
            $table->decimal('perubahan_amount', 20, 4)->default(0)->after('pergeseran_amount');
        });
    }

    public function down(): void
    {
        Schema::table('revenue_category_targets', function (Blueprint $table) {
            $table->dropColumn(['pergeseran_amount', 'perubahan_amount']);
        });

        Schema::dropIfExists('revenue_year_setups');
    }
};

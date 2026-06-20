<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('revenue_category_targets', function (Blueprint $table) {
            $table->decimal('corrected_amount', 20, 4)->nullable()->after('target_amount');
            $table->timestamp('corrected_at')->nullable()->after('corrected_amount');
        });
    }

    public function down(): void
    {
        Schema::table('revenue_category_targets', function (Blueprint $table) {
            $table->dropColumn(['corrected_amount', 'corrected_at']);
        });
    }
};


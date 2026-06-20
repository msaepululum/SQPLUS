<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budget_years', function (Blueprint $table) {
            $table->dropUnique(['tahun']);
        });
    }

    public function down(): void
    {
        Schema::table('budget_years', function (Blueprint $table) {
            $table->unique('tahun');
        });
    }
};

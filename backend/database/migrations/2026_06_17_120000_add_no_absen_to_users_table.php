<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('no_absen', 20)->nullable()->unique()->after('email');
            $table->unsignedBigInteger('rsud_user_id')->nullable()->unique()->after('no_absen');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['no_absen', 'rsud_user_id']);
        });
    }
};

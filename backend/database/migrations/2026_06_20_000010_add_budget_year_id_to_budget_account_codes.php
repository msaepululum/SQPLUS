<?php

use App\Modules\Finance\Models\BudgetAccountCode;
use App\Modules\Finance\Models\BudgetYear;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budget_account_codes', function (Blueprint $table) {
            $table->foreignId('budget_year_id')
                ->nullable()
                ->after('id')
                ->constrained('budget_years')
                ->cascadeOnDelete();
        });

        $defaultYear = BudgetYear::query()->firstOrCreate(
            ['tahun' => 2026],
            [
                'nama' => 'Anggaran Tahun 2026',
                'tanggal_mulai' => '2026-01-01',
                'tanggal_selesai' => '2026-12-31',
                'status' => BudgetYear::STATUS_ACTIVE,
            ]
        );

        BudgetYear::query()->firstOrCreate(
            ['tahun' => 2025],
            [
                'nama' => 'Anggaran Tahun 2025',
                'tanggal_mulai' => '2025-01-01',
                'tanggal_selesai' => '2025-12-31',
                'status' => BudgetYear::STATUS_CLOSED,
            ]
        );

        BudgetAccountCode::query()
            ->whereNull('budget_year_id')
            ->update(['budget_year_id' => $defaultYear->id]);

        Schema::table('budget_account_codes', function (Blueprint $table) {
            $table->unsignedBigInteger('budget_year_id')->nullable(false)->change();
            $table->dropIndex(['kode', 'deleted_at']);
            $table->unique(['budget_year_id', 'kode', 'deleted_at'], 'budget_account_codes_year_kode_unique');
            $table->index(['budget_year_id', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::table('budget_account_codes', function (Blueprint $table) {
            $table->dropUnique('budget_account_codes_year_kode_unique');
            $table->dropIndex(['budget_year_id', 'parent_id']);
            $table->dropForeign(['budget_year_id']);
            $table->dropColumn('budget_year_id');
            $table->index(['kode', 'deleted_at']);
        });
    }
};

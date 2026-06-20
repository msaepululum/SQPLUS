<?php

use App\Modules\Finance\Models\BudgetAccountCode;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        BudgetAccountCode::query()
            ->where('jenis', 'sub_kegiatan')
            ->forceDelete();

        BudgetAccountCode::query()
            ->where('jenis', 'kegiatan')
            ->whereNull('jumlah_anggaran')
            ->update(['jumlah_anggaran' => 0]);
    }

    public function down(): void
    {
        // Data sub kegiatan tidak dipulihkan otomatis.
    }
};

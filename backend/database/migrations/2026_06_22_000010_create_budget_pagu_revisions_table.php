<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_pagu_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->constrained('budget_years')->cascadeOnDelete();
            $table->string('level', 20);
            $table->unsignedBigInteger('finance_id');
            $table->string('tahun', 4);
            $table->unsignedBigInteger('ptk_id')->nullable();
            $table->string('nama_satuan_ptk')->nullable();
            $table->unsignedBigInteger('kelompok_belanja_id')->nullable();
            $table->string('kode_kelompok_belanja')->nullable();
            $table->unsignedBigInteger('jenis_belanja_id')->nullable();
            $table->string('kode_jenis_belanja')->nullable();
            $table->unsignedBigInteger('ksro_id')->nullable();
            $table->string('kode_ksro')->nullable();
            $table->string('nama_ksro')->nullable();
            $table->decimal('pagu_sebelum', 20, 4);
            $table->decimal('pagu_sesudah', 20, 4);
            $table->decimal('selisih', 20, 4);
            $table->text('alasan');
            $table->string('nomor_pengajuan', 40)->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignId('approval_instance_id')->nullable()->constrained('approval_instances')->nullOnDelete();
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->unsignedBigInteger('applied_by')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();

            $table->index(['budget_year_id', 'status']);
            $table->index(['level', 'finance_id']);
            $table->index('nomor_pengajuan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_pagu_revisions');
    }
};

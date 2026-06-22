<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revenue_import_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->constrained('budget_years')->cascadeOnDelete();
            $table->string('source_system', 64)->default('billing');
            $table->date('periode_from');
            $table->date('periode_to');
            $table->string('status', 20)->default('completed');
            $table->unsignedInteger('total_rows')->default(0);
            $table->decimal('total_amount', 20, 4)->default(0);
            $table->text('message')->nullable();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();

            $table->index(['budget_year_id', 'imported_at']);
        });

        Schema::create('revenue_realizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->constrained('budget_years')->cascadeOnDelete();
            $table->string('category_id', 32);
            $table->date('tanggal');
            $table->decimal('amount', 20, 4)->default(0);
            $table->string('source', 16)->default('manual');
            $table->string('reference_note', 255)->nullable();
            $table->foreignId('import_batch_id')->nullable()->constrained('revenue_import_batches')->nullOnDelete();
            $table->timestamps();

            $table->index(['budget_year_id', 'tanggal']);
            $table->index(['budget_year_id', 'category_id', 'tanggal']);
        });

        Schema::create('revenue_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->constrained('budget_years')->cascadeOnDelete();
            $table->string('category_id', 32);
            $table->unsignedTinyInteger('bulan');
            $table->decimal('operasional_amount', 20, 4)->default(0);
            $table->decimal('akuntansi_amount', 20, 4)->default(0);
            $table->string('status', 20)->default('belum');
            $table->string('catatan', 500)->nullable();
            $table->timestamps();

            $table->unique(
                ['budget_year_id', 'category_id', 'bulan'],
                'revenue_reconciliations_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revenue_reconciliations');
        Schema::dropIfExists('revenue_realizations');
        Schema::dropIfExists('revenue_import_batches');
    }
};

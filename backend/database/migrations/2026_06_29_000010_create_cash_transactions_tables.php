<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_year_id')->constrained('budget_years')->cascadeOnDelete();
            $table->string('flow_type', 10);
            $table->string('journal_type', 10);
            $table->date('tanggal');
            $table->string('no_jurnal', 50);
            $table->string('keterangan', 500)->nullable();
            $table->string('no_bukti', 50)->nullable();
            $table->string('kas_account_no', 50)->nullable();
            $table->string('kas_account_name', 200)->nullable();
            $table->decimal('amount', 20, 4)->default(0);
            $table->string('source', 16)->default('manual');
            $table->string('acc_ref', 50)->nullable();
            $table->string('status', 20)->default('draft');
            $table->string('created_by', 100)->nullable();
            $table->timestamps();

            $table->unique(['budget_year_id', 'no_jurnal'], 'cash_transactions_no_jurnal_unique');
            $table->index(['budget_year_id', 'tanggal']);
            $table->index(['budget_year_id', 'flow_type', 'tanggal']);
        });

        Schema::create('cash_transaction_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_transaction_id')->constrained('cash_transactions')->cascadeOnDelete();
            $table->string('account_no', 50);
            $table->string('account_name', 200)->nullable();
            $table->string('keterangan', 500)->nullable();
            $table->decimal('debet', 20, 4)->default(0);
            $table->decimal('kredit', 20, 4)->default(0);
            $table->unsignedSmallInteger('line_order')->default(0);
            $table->timestamps();

            $table->index(['cash_transaction_id', 'line_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transaction_lines');
        Schema::dropIfExists('cash_transactions');
    }
};

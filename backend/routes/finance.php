<?php

use App\Modules\Finance\Http\Controllers\AccountingController;
use App\Modules\Finance\Http\Controllers\KlaimJknController;
use App\Modules\Finance\Http\Controllers\HutangPiutangController;
use App\Modules\Finance\Http\Controllers\CashBankReconciliationController;
use App\Modules\Finance\Http\Controllers\CashSaldoRekapController;
use App\Modules\Finance\Http\Controllers\CashBankDashboardController;
use App\Modules\Finance\Http\Controllers\CashTransactionController;
use App\Modules\Finance\Http\Controllers\BudgetBlokirAnggaranController;
use App\Modules\Finance\Http\Controllers\BudgetMonitoringPaguController;
use App\Modules\Finance\Http\Controllers\RevenueDashboardController;
use App\Modules\Finance\Http\Controllers\RevenueAnalysisController;
use App\Modules\Finance\Http\Controllers\RevenueImportController;
use App\Modules\Finance\Http\Controllers\RevenueMonthlyPlanController;
use App\Modules\Finance\Http\Controllers\RevenuePlanController;
use App\Modules\Finance\Http\Controllers\RevenueRealizationController;
use App\Modules\Finance\Http\Controllers\RevenueReconciliationController;
use App\Modules\Finance\Http\Controllers\RevenueTargetController;
use App\Modules\Finance\Http\Controllers\BudgetRiwayatPerubahanController;
use App\Modules\Finance\Http\Controllers\BudgetPaguPergeseranController;
use App\Modules\Finance\Http\Controllers\BudgetPaguRevisiController;
use App\Modules\Finance\Http\Controllers\BudgetPaguDistribusiController;
use App\Modules\Finance\Http\Controllers\BudgetPaguSetupController;
use App\Modules\Finance\Http\Controllers\BudgetPenarikanDanaController;
use App\Modules\Finance\Http\Controllers\BudgetProgramController;
use App\Modules\Finance\Http\Controllers\BudgetYearController;
use App\Modules\Finance\Http\Controllers\ExpenditureAjuController;
use App\Modules\Finance\Http\Controllers\PaymentWorkflowController;
use App\Modules\Finance\Http\Controllers\FinanceTaxController;
use App\Modules\Finance\Http\Controllers\FinanceMasterController;
use App\Modules\Finance\Http\Controllers\FinanceReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('finance')->name('finance.')->group(function () {
    Route::get('/dashboard', fn () => response()->json(['module' => 'finance']));

    Route::get('budget-pagu-setup/meta', [BudgetPaguSetupController::class, 'meta']);
    Route::apiResource('budget-pagu-setup', BudgetPaguSetupController::class);

    Route::get('budget-pagu-distribusi/meta', [BudgetPaguDistribusiController::class, 'meta']);
    Route::apiResource('budget-pagu-distribusi', BudgetPaguDistribusiController::class);

    Route::get('budget-penarikan-dana/meta', [BudgetPenarikanDanaController::class, 'meta']);
    Route::get('budget-penarikan-dana', [BudgetPenarikanDanaController::class, 'index']);
    Route::post('budget-penarikan-dana/bulk', [BudgetPenarikanDanaController::class, 'bulkStore']);

    Route::get('budget-blokir-anggaran/meta', [BudgetBlokirAnggaranController::class, 'meta']);
    Route::get('budget-blokir-anggaran', [BudgetBlokirAnggaranController::class, 'index']);
    Route::get('budget-blokir-anggaran/{rbaId}/histori', [BudgetBlokirAnggaranController::class, 'histori']);
    Route::post('budget-blokir-anggaran', [BudgetBlokirAnggaranController::class, 'store']);

    Route::get('budget-pagu-revisi/meta', [BudgetPaguRevisiController::class, 'meta']);
    Route::get('budget-pagu-revisi/targets', [BudgetPaguRevisiController::class, 'targets']);
    Route::get('budget-pagu-revisi', [BudgetPaguRevisiController::class, 'index']);
    Route::post('budget-pagu-revisi', [BudgetPaguRevisiController::class, 'store']);
    Route::patch('budget-pagu-revisi/{budgetPaguRevisi}', [BudgetPaguRevisiController::class, 'update']);
    Route::post('budget-pagu-revisi/{budgetPaguRevisi}/submit', [BudgetPaguRevisiController::class, 'submit']);

    Route::get('budget-pagu-pergeseran/meta', [BudgetPaguPergeseranController::class, 'meta']);
    Route::get('budget-pagu-pergeseran/targets', [BudgetPaguPergeseranController::class, 'targets']);
    Route::get('budget-pagu-pergeseran', [BudgetPaguPergeseranController::class, 'index']);
    Route::post('budget-pagu-pergeseran', [BudgetPaguPergeseranController::class, 'store']);
    Route::post('budget-pagu-pergeseran/{budgetPaguPergeseran}/submit', [BudgetPaguPergeseranController::class, 'submit']);

    Route::get('budget-riwayat-perubahan', [BudgetRiwayatPerubahanController::class, 'index']);
    Route::get('budget-riwayat-perubahan/events', [BudgetRiwayatPerubahanController::class, 'events']);

    Route::get('budget-monitoring-pagu/meta', [BudgetMonitoringPaguController::class, 'meta']);
    Route::get('budget-monitoring-pagu', [BudgetMonitoringPaguController::class, 'index']);

    Route::get('accounting/meta', [AccountingController::class, 'meta']);
    Route::get('accounting/dashboard', [AccountingController::class, 'dashboard']);
    Route::get('accounting/coa', [AccountingController::class, 'coa']);
    Route::get('accounting/mapping-akun', [AccountingController::class, 'mappingAkun']);
    Route::get('accounting/jurnal-umum', [AccountingController::class, 'jurnalUmum']);
    Route::get('accounting/jurnal-otomatis', [AccountingController::class, 'jurnalOtomatis']);
    Route::get('accounting/posting-jurnal', [AccountingController::class, 'postingJurnal']);
    Route::get('accounting/buku-besar', [AccountingController::class, 'bukuBesar']);
    Route::get('accounting/neraca', [AccountingController::class, 'neraca']);
    Route::get('accounting/laporan-operasional', [AccountingController::class, 'laporanOperasional']);
    Route::get('accounting/arus-kas', [AccountingController::class, 'arusKas']);
    Route::get('accounting/perubahan-ekuitas', [AccountingController::class, 'perubahanEkuitas']);
    Route::get('accounting/tutup-buku', [AccountingController::class, 'tutupBuku']);

    Route::get('cash-bank-dashboard', [CashBankDashboardController::class, 'index']);

    Route::get('cash-saldo-rekap/meta', [CashSaldoRekapController::class, 'meta']);
    Route::get('cash-saldo-rekap/posisi-saldo', [CashSaldoRekapController::class, 'posisiSaldo']);
    Route::get('cash-saldo-rekap/rekap-bulanan', [CashSaldoRekapController::class, 'rekapBulanan']);
    Route::get('cash-saldo-rekap/buku-kas-besar', [CashSaldoRekapController::class, 'bukuKasBesar']);
    Route::get('cash-saldo-rekap/proyeksi-cashflow', [CashSaldoRekapController::class, 'proyeksiCashflow']);

    Route::get('cash-bank-rekon/meta', [CashBankReconciliationController::class, 'meta']);
    Route::get('cash-bank-rekon/rekening-bank', [CashBankReconciliationController::class, 'rekeningBank']);
    Route::get('cash-bank-rekon/rekonsiliasi', [CashBankReconciliationController::class, 'rekonsiliasi']);

    Route::get('hutang-piutang/meta', [HutangPiutangController::class, 'meta']);
    Route::get('hutang-piutang/dashboard', [HutangPiutangController::class, 'dashboard']);
    Route::get('hutang-piutang/hutang/daftar', [HutangPiutangController::class, 'hutangDaftar']);
    Route::get('hutang-piutang/hutang/per-akun', [HutangPiutangController::class, 'hutangPerAkun']);
    Route::get('hutang-piutang/piutang/daftar', [HutangPiutangController::class, 'piutangDaftar']);
    Route::get('hutang-piutang/piutang/umur', [HutangPiutangController::class, 'piutangUmur']);
    Route::get('hutang-piutang/rekonsiliasi/hutang', [HutangPiutangController::class, 'rekonsiliasiHutang']);
    Route::get('hutang-piutang/rekonsiliasi/piutang', [HutangPiutangController::class, 'rekonsiliasiPiutang']);
    Route::get('hutang-piutang/riwayat', [HutangPiutangController::class, 'riwayat']);

    Route::get('klaim-jkn/meta', [KlaimJknController::class, 'meta']);
    Route::get('klaim-jkn', [KlaimJknController::class, 'index']);

    Route::get('cash-transactions/meta', [CashTransactionController::class, 'meta']);
    Route::get('cash-transactions/{cashTransaction}', [CashTransactionController::class, 'show']);
    Route::post('cash-transactions/{cashTransaction}/post', [CashTransactionController::class, 'post'])->whereNumber('cashTransaction');
    Route::apiResource('cash-transactions', CashTransactionController::class)->except(['show']);

    Route::get('expenditure-aju/meta', [ExpenditureAjuController::class, 'meta']);
    Route::get('expenditure-aju/monitoring', [ExpenditureAjuController::class, 'monitoring']);
    Route::get('expenditure-aju/{id}', [ExpenditureAjuController::class, 'show'])->whereNumber('id');
    Route::get('expenditure-aju', [ExpenditureAjuController::class, 'index']);
    Route::post('expenditure-aju', [ExpenditureAjuController::class, 'store']);

    Route::get('payment-workflow/meta', [PaymentWorkflowController::class, 'meta']);
    Route::get('payment-workflow/dashboard', [PaymentWorkflowController::class, 'dashboard']);
    Route::get('payment-workflow', [PaymentWorkflowController::class, 'index']);

    Route::get('tax/meta', [FinanceTaxController::class, 'meta']);
    Route::get('tax/dashboard', [FinanceTaxController::class, 'dashboard']);
    Route::get('tax', [FinanceTaxController::class, 'index']);

    Route::get('revenue-targets', [RevenueTargetController::class, 'index']);
    Route::post('revenue-targets/bulk', [RevenueTargetController::class, 'bulkStore']);
    Route::post('revenue-targets/advance-status', [RevenueTargetController::class, 'advanceStatus']);

    Route::get('revenue-plans', [RevenuePlanController::class, 'index']);
    Route::post('revenue-plans/bulk', [RevenuePlanController::class, 'bulkStore']);

    Route::get('revenue-monthly-plans', [RevenueMonthlyPlanController::class, 'index']);
    Route::post('revenue-monthly-plans/bulk', [RevenueMonthlyPlanController::class, 'bulkStore']);

    Route::get('revenue-realizations/recap-harian', [RevenueRealizationController::class, 'recapHarian']);
    Route::get('revenue-realizations/recap-bulanan', [RevenueRealizationController::class, 'recapBulanan']);
    Route::get('revenue-realizations', [RevenueRealizationController::class, 'index']);
    Route::post('revenue-realizations', [RevenueRealizationController::class, 'store']);
    Route::patch('revenue-realizations/{revenueRealization}', [RevenueRealizationController::class, 'update']);
    Route::delete('revenue-realizations/{revenueRealization}', [RevenueRealizationController::class, 'destroy']);

    Route::get('revenue-imports', [RevenueImportController::class, 'index']);
    Route::post('revenue-imports', [RevenueImportController::class, 'store']);

    Route::get('revenue-dashboard', [RevenueDashboardController::class, 'index']);

    Route::get('revenue-analysis/per-kategori', [RevenueAnalysisController::class, 'perKategori']);

    Route::get('revenue-reconciliations', [RevenueReconciliationController::class, 'index']);
    Route::post('revenue-reconciliations/bulk', [RevenueReconciliationController::class, 'bulkUpdate']);

    Route::get('reports/dashboard', [FinanceReportController::class, 'dashboard']);

    Route::apiResource('budget-years', BudgetYearController::class);
    Route::apiResource('funding-sources', FundingSourceController::class);
    Route::apiResource('budget-programs', BudgetProgramController::class);
    Route::patch('budget-programs/{budgetProgram}/pagu', [BudgetProgramController::class, 'updatePagu'])
        ->name('budget-programs.update-pagu');

    Route::prefix('finance-masters')->name('finance-masters.')->group(function () {
        Route::get('kelompok-belanja', [FinanceMasterController::class, 'kelompokBelanja']);
        Route::get('jenis-belanja', [FinanceMasterController::class, 'jenisBelanja']);
        Route::get('pptk', [FinanceMasterController::class, 'pptk']);
        Route::get('ptk', [FinanceMasterController::class, 'ptk']);
        Route::get('jenis-rekening', [FinanceMasterController::class, 'jenisRekening']);
        Route::get('sro', [FinanceMasterController::class, 'sro']);
        Route::get('satuan', [FinanceMasterController::class, 'satuan']);
    });
});

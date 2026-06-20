<?php

use App\Modules\Finance\Http\Controllers\BudgetBlokirAnggaranController;
use App\Modules\Finance\Http\Controllers\BudgetMonitoringPaguController;
use App\Modules\Finance\Http\Controllers\RevenueTargetController;
use App\Modules\Finance\Http\Controllers\BudgetRiwayatPerubahanController;
use App\Modules\Finance\Http\Controllers\BudgetPaguPergeseranController;
use App\Modules\Finance\Http\Controllers\BudgetPaguRevisiController;
use App\Modules\Finance\Http\Controllers\BudgetPaguDistribusiController;
use App\Modules\Finance\Http\Controllers\BudgetPaguSetupController;
use App\Modules\Finance\Http\Controllers\BudgetPenarikanDanaController;
use App\Modules\Finance\Http\Controllers\BudgetProgramController;
use App\Modules\Finance\Http\Controllers\BudgetYearController;
use App\Modules\Finance\Http\Controllers\FinanceMasterController;
use App\Modules\Finance\Http\Controllers\FundingSourceController;
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

    Route::get('revenue-targets', [RevenueTargetController::class, 'index']);
    Route::post('revenue-targets/bulk', [RevenueTargetController::class, 'bulkStore']);

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

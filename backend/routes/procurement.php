<?php

use App\Modules\Procurement\Http\Controllers\ProcurementController;
use Illuminate\Support\Facades\Route;

Route::prefix('procurement')->name('procurement.')->group(function () {
    Route::get('/meta', [ProcurementController::class, 'meta']);
    Route::get('/dashboard', [ProcurementController::class, 'dashboard']);
    Route::get('/permintaan', [ProcurementController::class, 'permintaan']);
    Route::get('/negosiasi', [ProcurementController::class, 'negosiasi']);
    Route::get('/po', [ProcurementController::class, 'po']);
    Route::get('/po/{noPo}', [ProcurementController::class, 'poDetail']);
    Route::get('/penerimaan', [ProcurementController::class, 'penerimaan']);
    Route::get('/penerimaan/{noBeli}', [ProcurementController::class, 'penerimaanDetail']);
    Route::get('/vendor', [ProcurementController::class, 'vendor']);
    Route::get('/monitoring', [ProcurementController::class, 'monitoring']);
});

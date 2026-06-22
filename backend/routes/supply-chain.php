<?php

use App\Modules\SupplyChain\Http\Controllers\SupplyChainDashboardController;
use App\Modules\SupplyChain\Http\Controllers\SupplyChainDataController;
use Illuminate\Support\Facades\Route;

Route::prefix('supply-chain')->name('supply-chain.')->group(function () {
    Route::get('/dashboard', [SupplyChainDashboardController::class, 'index']);
    Route::get('/meta', [SupplyChainDataController::class, 'meta']);
    Route::get('/monitoring', [SupplyChainDataController::class, 'monitoring']);
    Route::get('/data', [SupplyChainDataController::class, 'index']);
});

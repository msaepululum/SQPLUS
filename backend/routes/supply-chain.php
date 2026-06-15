<?php

use Illuminate\Support\Facades\Route;

Route::prefix('supply-chain')->name('supply-chain.')->group(function () {
    Route::get('/dashboard', fn () => response()->json(['module' => 'supply-chain']));
    // TODO: inventory, assets, distribution, stock movements
});

<?php

use Illuminate\Support\Facades\Route;

Route::prefix('procurement')->name('procurement.')->group(function () {
    Route::get('/dashboard', fn () => response()->json(['module' => 'procurement']));
    // TODO: purchase requests, RFQ, PO, goods receipt
});

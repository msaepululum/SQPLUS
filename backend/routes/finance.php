<?php

use Illuminate\Support\Facades\Route;

Route::prefix('finance')->name('finance.')->group(function () {
    Route::get('/dashboard', fn () => response()->json(['module' => 'finance']));
    // TODO: chart of accounts, journals, budgets, reports
});

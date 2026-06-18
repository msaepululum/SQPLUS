<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SQ+ API Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'sq-plus-api',
    'version' => '1.0.0',
]));

require __DIR__.'/foundation.php';

Route::middleware(['auth:sanctum'])->group(function () {
    require __DIR__.'/finance.php';
    require __DIR__.'/hr.php';
    require __DIR__.'/procurement.php';
    require __DIR__.'/supply-chain.php';
    require __DIR__.'/workflow.php';
    require __DIR__.'/ai.php';
});

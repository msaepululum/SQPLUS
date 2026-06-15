<?php

use App\Modules\Foundation\Http\Controllers\AuditLogController;
use App\Modules\Foundation\Http\Controllers\AuthController;
use App\Modules\Foundation\Http\Controllers\NotificationController;
use App\Modules\Foundation\Http\Controllers\OrganizationalUnitController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/organizational-units', [OrganizationalUnitController::class, 'index']);
    Route::post('/organizational-units', [OrganizationalUnitController::class, 'store'])
        ->middleware('permission:foundation.master.manage');

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('permission:foundation.audit.view');
});

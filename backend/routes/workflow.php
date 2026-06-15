<?php

use App\Modules\Workflow\Http\Controllers\ApprovalController;
use Illuminate\Support\Facades\Route;

Route::prefix('workflow')->name('workflow.')->group(function () {
    Route::get('/approvals', [ApprovalController::class, 'index'])
        ->middleware('permission:workflow.approve');
    Route::post('/approvals/{id}/approve', [ApprovalController::class, 'approve'])
        ->middleware('permission:workflow.approve');
    Route::post('/approvals/{id}/reject', [ApprovalController::class, 'reject'])
        ->middleware('permission:workflow.approve');
});

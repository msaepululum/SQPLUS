<?php

use App\Modules\AI\Http\Controllers\AiAssistantController;
use Illuminate\Support\Facades\Route;

Route::prefix('ai')->name('ai.')->group(function () {
    Route::post('/chat', [AiAssistantController::class, 'chat'])
        ->middleware('permission:ai.assistant.use');
    Route::get('/sessions', [AiAssistantController::class, 'sessions'])
        ->middleware('permission:ai.assistant.use');
    Route::get('/sessions/{session}', [AiAssistantController::class, 'showSession'])
        ->middleware('permission:ai.assistant.use');
    Route::post('/messages/{message}/feedback', [AiAssistantController::class, 'feedback'])
        ->middleware('permission:ai.assistant.use');
});

<?php

namespace App\Providers;

use App\Events\ApprovalCompleted;
use App\Listeners\HandleApprovalCompletion;
use App\Modules\Finance\Models\BudgetAccountCode;
use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\FundingSource;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(ApprovalCompleted::class, HandleApprovalCompletion::class);

        Route::bind('budget_year', fn (string $value) => BudgetYear::query()->findOrFail($value));
        Route::bind('funding_source', fn (string $value) => FundingSource::query()->findOrFail($value));
        Route::bind('budget_program', fn (string $value) => BudgetAccountCode::query()->findOrFail($value));
    }
}

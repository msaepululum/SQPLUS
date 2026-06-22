<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevenueCategoryMonthlyPlan extends Model
{
    protected $fillable = [
        'budget_year_id',
        'category_id',
        'bulan',
        'plan_amount',
    ];

    protected function casts(): array
    {
        return [
            'bulan' => 'integer',
            'plan_amount' => 'decimal:4',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }
}

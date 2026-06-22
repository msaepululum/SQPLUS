<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevenueCategoryTarget extends Model
{
    protected $fillable = [
        'budget_year_id',
        'category_id',
        'target_amount',
        'pergeseran_amount',
        'perubahan_amount',
        'plan_amount',
        'corrected_amount',
        'corrected_at',
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:4',
            'pergeseran_amount' => 'decimal:4',
            'perubahan_amount' => 'decimal:4',
            'plan_amount' => 'decimal:4',
            'corrected_amount' => 'decimal:4',
            'corrected_at' => 'datetime',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }
}

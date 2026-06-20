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
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:4',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }
}

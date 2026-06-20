<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetMonthlyWithdrawal extends Model
{
    protected $fillable = [
        'budget_year_id',
        'pagu_ksro_id',
        'bulan',
        'rencana_penarikan',
    ];

    protected function casts(): array
    {
        return [
            'bulan' => 'integer',
            'rencana_penarikan' => 'decimal:4',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }
}

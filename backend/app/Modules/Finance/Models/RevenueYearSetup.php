<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevenueYearSetup extends Model
{
    public const STATUS_SEMULA = 'semula';

    public const STATUS_PERGESERAN = 'pergeseran';

    public const STATUS_PERUBAHAN = 'perubahan';

    protected $fillable = [
        'budget_year_id',
        'setup_status',
        'semula_locked_at',
        'pergeseran_opened_at',
        'perubahan_opened_at',
    ];

    protected function casts(): array
    {
        return [
            'semula_locked_at' => 'datetime',
            'pergeseran_opened_at' => 'datetime',
            'perubahan_opened_at' => 'datetime',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }
}

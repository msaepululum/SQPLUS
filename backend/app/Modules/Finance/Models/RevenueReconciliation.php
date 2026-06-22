<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevenueReconciliation extends Model
{
    public const STATUS_BELUM = 'belum';

    public const STATUS_SESUAI = 'sesuai';

    public const STATUS_SELISIH = 'selisih';

    protected $fillable = [
        'budget_year_id',
        'category_id',
        'bulan',
        'operasional_amount',
        'akuntansi_amount',
        'status',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'bulan' => 'integer',
            'operasional_amount' => 'decimal:4',
            'akuntansi_amount' => 'decimal:4',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }
}

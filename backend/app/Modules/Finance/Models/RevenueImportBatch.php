<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RevenueImportBatch extends Model
{
    public const STATUS_PROCESSING = 'processing';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'budget_year_id',
        'source_system',
        'periode_from',
        'periode_to',
        'status',
        'total_rows',
        'total_amount',
        'message',
        'imported_at',
    ];

    protected function casts(): array
    {
        return [
            'periode_from' => 'date',
            'periode_to' => 'date',
            'total_rows' => 'integer',
            'total_amount' => 'decimal:4',
            'imported_at' => 'datetime',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }

    public function realizations(): HasMany
    {
        return $this->hasMany(RevenueRealization::class, 'import_batch_id');
    }
}

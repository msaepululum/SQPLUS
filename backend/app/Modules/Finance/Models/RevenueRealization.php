<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevenueRealization extends Model
{
    public const SOURCE_MANUAL = 'manual';

    public const SOURCE_IMPORT = 'import';

    protected $fillable = [
        'budget_year_id',
        'category_id',
        'tanggal',
        'amount',
        'source',
        'reference_note',
        'import_batch_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'amount' => 'decimal:4',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }

    public function importBatch(): BelongsTo
    {
        return $this->belongsTo(RevenueImportBatch::class, 'import_batch_id');
    }
}

<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashTransaction extends Model
{
    public const SOURCE_MANUAL = 'manual';

    public const SOURCE_ACC2026 = 'acc2026';

    public const FLOW_MASUK = 'masuk';

    public const FLOW_KELUAR = 'keluar';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_POSTED = 'posted';

    protected $fillable = [
        'budget_year_id',
        'flow_type',
        'journal_type',
        'tanggal',
        'no_jurnal',
        'keterangan',
        'no_bukti',
        'kas_account_no',
        'kas_account_name',
        'amount',
        'source',
        'acc_ref',
        'status',
        'created_by',
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

    public function lines(): HasMany
    {
        return $this->hasMany(CashTransactionLine::class)->orderBy('line_order');
    }
}

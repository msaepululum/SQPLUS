<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransactionLine extends Model
{
    protected $fillable = [
        'cash_transaction_id',
        'account_no',
        'account_name',
        'keterangan',
        'debet',
        'kredit',
        'line_order',
    ];

    protected function casts(): array
    {
        return [
            'debet' => 'decimal:4',
            'kredit' => 'decimal:4',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(CashTransaction::class, 'cash_transaction_id');
    }
}

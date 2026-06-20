<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaguKsro extends RsudFinanceModel
{
    protected $table = 'pagu_ksro';

    protected $fillable = [
        'pagu_jenis_belanja_id',
        'ksro_id',
        'total_pagu',
        'sisa_pagu',
        'kapitalisasi',
        'pagu_unalocated',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'total_pagu' => 'decimal:4',
            'sisa_pagu' => 'decimal:4',
            'kapitalisasi' => 'decimal:4',
            'pagu_unalocated' => 'decimal:4',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function paguJenisBelanja(): BelongsTo
    {
        return $this->belongsTo(PaguJenisBelanja::class, 'pagu_jenis_belanja_id');
    }

    public function ksro(): BelongsTo
    {
        return $this->belongsTo(Ksro::class, 'ksro_id');
    }
}

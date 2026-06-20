<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaguJenisBelanja extends RsudFinanceModel
{
    protected $table = 'pagu_jenis_belanja';

    protected $fillable = [
        'pagu_kelompok_belanja_id',
        'jenis_belanja_id',
        'total_pagu',
        'sisa_pagu',
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
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function paguKelompokBelanja(): BelongsTo
    {
        return $this->belongsTo(PaguKelompokBelanja::class, 'pagu_kelompok_belanja_id');
    }

    public function jenisBelanja(): BelongsTo
    {
        return $this->belongsTo(JenisBelanja::class, 'jenis_belanja_id');
    }

    public function paguKsro(): HasMany
    {
        return $this->hasMany(PaguKsro::class, 'pagu_jenis_belanja_id');
    }
}

<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaguKelompokBelanja extends RsudFinanceModel
{
    protected $table = 'pagu_kelompok_belanja';

    protected $fillable = [
        'pagu_id',
        'kelompok_belanja_id',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function pagu(): BelongsTo
    {
        return $this->belongsTo(Pagu::class, 'pagu_id');
    }

    public function kelompokBelanja(): BelongsTo
    {
        return $this->belongsTo(KelompokBelanja::class, 'kelompok_belanja_id');
    }

    public function jenisBelanjaRows(): HasMany
    {
        return $this->hasMany(PaguJenisBelanja::class, 'pagu_kelompok_belanja_id');
    }
}

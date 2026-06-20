<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisBelanja extends RsudFinanceModel
{
    protected $table = 'jenis_belanja';

    protected $fillable = [
        'kode_jenis_belanja',
        'kelompok_belanja_id',
    ];

    public function kelompokBelanja(): BelongsTo
    {
        return $this->belongsTo(KelompokBelanja::class, 'kelompok_belanja_id');
    }

    public function sro(): HasMany
    {
        return $this->hasMany(Sro::class, 'jenis_belanja_id');
    }
}

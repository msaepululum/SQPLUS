<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ksro extends RsudFinanceModel
{
    protected $table = 'ksro';

    protected $fillable = [
        'nama_ksro',
        'kode_ksro',
        'kelompok_belanja_id',
        'jenis_belanja_id',
        'ptk_id',
        'tahun',
    ];

    public function jenisBelanja(): BelongsTo
    {
        return $this->belongsTo(JenisBelanja::class, 'jenis_belanja_id');
    }

    public function paguKsro(): HasMany
    {
        return $this->hasMany(PaguKsro::class, 'ksro_id');
    }
}

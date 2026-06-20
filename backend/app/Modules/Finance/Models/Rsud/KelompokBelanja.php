<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\HasMany;

class KelompokBelanja extends RsudFinanceModel
{
    protected $table = 'kelompok_belanja';

    protected $fillable = [
        'kode_kelompok_belanja',
    ];

    public function jenisBelanja(): HasMany
    {
        return $this->hasMany(JenisBelanja::class, 'kelompok_belanja_id');
    }
}

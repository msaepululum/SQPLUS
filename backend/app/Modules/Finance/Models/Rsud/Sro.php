<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sro extends RsudFinanceModel
{
    protected $table = 'sro';

    protected $fillable = [
        'nama_sro',
        'no_rekening',
        'jenis_belanja_id',
    ];

    public function jenisBelanja(): BelongsTo
    {
        return $this->belongsTo(JenisBelanja::class, 'jenis_belanja_id');
    }
}

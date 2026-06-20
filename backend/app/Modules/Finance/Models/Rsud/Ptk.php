<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ptk extends RsudFinanceModel
{
    protected $table = 'ptk';

    protected $fillable = [
        'pptk_id',
        'nama_satuan_ptk',
        'nama_ptk',
        'nip_ptk',
        'no_absen',
    ];

    public function pptk(): BelongsTo
    {
        return $this->belongsTo(Pptk::class, 'pptk_id');
    }
}

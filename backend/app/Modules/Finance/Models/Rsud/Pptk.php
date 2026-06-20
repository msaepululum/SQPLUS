<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Pptk extends RsudFinanceModel
{
    protected $table = 'pptk';

    protected $fillable = [
        'ppk_id',
        'pbp_id',
        'nama_pptk',
        'nip_pptk',
        'jabatan_pptk_id',
        'no_absen',
    ];

    public function ptk(): HasMany
    {
        return $this->hasMany(Ptk::class, 'pptk_id');
    }
}

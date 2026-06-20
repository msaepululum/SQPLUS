<?php

namespace App\Modules\Finance\Models\Rsud;

class JenisRekening extends RsudFinanceModel
{
    protected $table = 'jenis_rekening';

    protected $fillable = [
        'nama_jenis_rekening',
        'no_rekening',
    ];
}

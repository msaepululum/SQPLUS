<?php

namespace App\Modules\Finance\Models\Rsud;

class Satuan extends RsudFinanceModel
{
    protected $table = 'satuan';

    protected $fillable = [
        'nama_satuan',
    ];
}

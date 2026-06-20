<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rba extends RsudFinanceModel
{
    protected $table = 'rba';

    protected $fillable = [
        'tahun',
        'ptk_id',
        'sro_id',
        'ksro_id',
        'nama_komponen',
        'volume_awal',
        'volume',
        'satuan_id',
        'harga_satuan_awal',
        'harga_satuan',
        'subtotal',
        'ppn',
        'total',
        'total_pembulatan',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'volume_awal' => 'integer',
            'volume' => 'integer',
            'harga_satuan_awal' => 'decimal:4',
            'harga_satuan' => 'decimal:4',
            'subtotal' => 'decimal:4',
            'ppn' => 'decimal:4',
            'total' => 'decimal:4',
            'total_pembulatan' => 'decimal:4',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function ksro(): BelongsTo
    {
        return $this->belongsTo(Ksro::class, 'ksro_id');
    }

    public function ptk(): BelongsTo
    {
        return $this->belongsTo(Ptk::class, 'ptk_id');
    }
}

<?php

namespace App\Modules\Finance\Models\Rsud;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pagu extends RsudFinanceModel
{
    protected $table = 'pagu';

    protected $fillable = [
        'tahun',
        'ptk_id',
        'total_pagu',
        'sisa_pagu',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'total_pagu' => 'decimal:4',
            'sisa_pagu' => 'decimal:4',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function ptk(): BelongsTo
    {
        return $this->belongsTo(Ptk::class, 'ptk_id');
    }

    public function kelompokBelanjaRows(): HasMany
    {
        return $this->hasMany(PaguKelompokBelanja::class, 'pagu_id');
    }
}

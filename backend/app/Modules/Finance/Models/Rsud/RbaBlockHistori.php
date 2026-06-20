<?php

namespace App\Modules\Finance\Models\Rsud;

use App\Support\RsudConnections;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RbaBlockHistori extends Model
{
    protected $connection = RsudConnections::FINANCE;

    protected $table = 'rba_block_histori';

    public $timestamps = false;

    protected $fillable = [
        'rba_id',
        'block_type',
        'block_volume',
        'catatan',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'block_volume' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function rba(): BelongsTo
    {
        return $this->belongsTo(Rba::class, 'rba_id');
    }
}

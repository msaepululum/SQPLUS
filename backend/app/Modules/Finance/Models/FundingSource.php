<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FundingSource extends Model
{
    use SoftDeletes;

    public const JENIS_OPERASIONAL = 'operasional';

    public const JENIS_INVESTASI = 'investasi';

    public const JENIS_BANTUAN = 'bantuan';

    public const JENIS_LAINNYA = 'lainnya';

    protected $fillable = [
        'kode',
        'nama',
        'jenis',
        'is_active',
        'keterangan',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

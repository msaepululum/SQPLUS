<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BudgetAccountCode extends Model
{
    use SoftDeletes;

    public const JENIS_PROGRAM = 'program';

    public const JENIS_KEGIATAN = 'kegiatan';

    public const JENIS_SUB_KEGIATAN = 'sub_kegiatan';

    protected $fillable = [
        'budget_year_id',
        'parent_id',
        'kode',
        'uraian',
        'jenis',
        'jumlah_anggaran',
        'is_active',
        'keterangan',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'jumlah_anggaran' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class, 'budget_year_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('kode');
    }
}

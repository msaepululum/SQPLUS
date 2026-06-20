<?php

namespace App\Modules\Finance\Models;

use App\Modules\Workflow\Models\ApprovalInstance;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetPaguRevision extends Model
{
    protected $fillable = [
        'budget_year_id',
        'level',
        'finance_id',
        'tahun',
        'ptk_id',
        'nama_satuan_ptk',
        'kelompok_belanja_id',
        'kode_kelompok_belanja',
        'jenis_belanja_id',
        'kode_jenis_belanja',
        'ksro_id',
        'kode_ksro',
        'nama_ksro',
        'pagu_sebelum',
        'pagu_sesudah',
        'selisih',
        'alasan',
        'nomor_pengajuan',
        'status',
        'approval_instance_id',
        'submitted_by',
        'applied_by',
        'applied_at',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'pagu_sebelum' => 'decimal:4',
            'pagu_sesudah' => 'decimal:4',
            'selisih' => 'decimal:4',
            'applied_at' => 'datetime',
        ];
    }

    public function budgetYear(): BelongsTo
    {
        return $this->belongsTo(BudgetYear::class);
    }

    public function approvalInstance(): BelongsTo
    {
        return $this->belongsTo(ApprovalInstance::class);
    }
}

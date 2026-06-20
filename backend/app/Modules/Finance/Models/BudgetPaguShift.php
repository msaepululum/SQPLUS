<?php

namespace App\Modules\Finance\Models;

use App\Modules\Workflow\Models\ApprovalInstance;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetPaguShift extends Model
{
    protected $fillable = [
        'budget_year_id',
        'level',
        'pagu_jenis_belanja_id',
        'tahun',
        'source_finance_id',
        'dest_finance_id',
        'source_ptk_id',
        'source_nama_satuan_ptk',
        'source_kode_kelompok_belanja',
        'source_kode_jenis_belanja',
        'source_kode_ksro',
        'source_nama_ksro',
        'dest_ptk_id',
        'dest_nama_satuan_ptk',
        'dest_kode_kelompok_belanja',
        'dest_kode_jenis_belanja',
        'dest_kode_ksro',
        'dest_nama_ksro',
        'source_pagu_sebelum',
        'source_pagu_sesudah',
        'dest_pagu_sebelum',
        'dest_pagu_sesudah',
        'nominal',
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
            'source_pagu_sebelum' => 'decimal:4',
            'source_pagu_sesudah' => 'decimal:4',
            'dest_pagu_sebelum' => 'decimal:4',
            'dest_pagu_sesudah' => 'decimal:4',
            'nominal' => 'decimal:4',
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

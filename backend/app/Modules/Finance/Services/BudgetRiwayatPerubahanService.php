<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetPaguRevision;
use App\Modules\Finance\Models\BudgetPaguShift;
use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Foundation\Models\AuditLog;
use App\Modules\Workflow\Models\ApprovalAction;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BudgetRiwayatPerubahanService
{
    /**
     * @param  array{
     *   budget_year_id: int,
     *   jenis?: string,
     *   status?: string,
     *   search?: string,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     * @return array{rows: Collection, summary: array<string, mixed>, meta: array<string, int>}
     */
    public function list(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;
        $jenisFilter = $filters['jenis'] ?? null;
        $statusFilter = $filters['status'] ?? null;
        $search = trim((string) ($filters['search'] ?? ''));

        $items = collect();

        if (! $jenisFilter || $jenisFilter === 'revisi') {
            $items = $items->merge($this->revisionHistoryRows((int) $filters['budget_year_id'], $statusFilter, $search));
        }

        if (! $jenisFilter || $jenisFilter === 'pergeseran') {
            $items = $items->merge($this->shiftHistoryRows((int) $filters['budget_year_id'], $statusFilter, $search));
        }

        if (! $jenisFilter || $jenisFilter === 'blokir') {
            $items = $items->merge($this->blokirHistoryRows($tahun, $search, $statusFilter));
        }

        if ($statusFilter && in_array($statusFilter, ['draft', 'submitted', 'in_review', 'approved', 'applied', 'rejected'], true)) {
            $items = $items->filter(
                fn (array $row) => in_array($row['jenis'], ['revisi', 'pergeseran'], true) && $row['status'] === $statusFilter
            );
        } elseif ($statusFilter && in_array($statusFilter, ['P', 'T', 'O'], true)) {
            $items = $items->filter(
                fn (array $row) => $row['jenis'] === 'blokir' && $row['status'] === $statusFilter
            );
        }

        $items = $items->sortByDesc('occurred_at')->values();

        $summary = [
            'total' => $items->count(),
            'revisi' => $items->where('jenis', 'revisi')->count(),
            'pergeseran' => $items->where('jenis', 'pergeseran')->count(),
            'blokir' => $items->where('jenis', 'blokir')->count(),
            'applied' => $items->where('status', 'applied')->count(),
        ];

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 50)));
        $total = $items->count();
        $rows = $items->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            'rows' => $rows,
            'summary' => $summary,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function events(string $jenis, int $refId): Collection
    {
        return match ($jenis) {
            'revisi' => $this->documentEvents('budget_revision', $refId, BudgetPaguRevision::query()->find($refId)),
            'pergeseran' => $this->documentEvents('budget_shift', $refId, BudgetPaguShift::query()->find($refId)),
            'blokir' => $this->blokirEvents($refId),
            default => collect(),
        };
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function revisionHistoryRows(int $budgetYearId, ?string $statusFilter, string $search): Collection
    {
        $query = BudgetPaguRevision::query()->where('budget_year_id', $budgetYearId);

        if ($statusFilter && in_array($statusFilter, ['draft', 'submitted', 'in_review', 'approved', 'applied', 'rejected'], true)) {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('nomor_pengajuan', 'like', $like)
                    ->orWhere('nama_satuan_ptk', 'like', $like)
                    ->orWhere('kode_ksro', 'like', $like)
                    ->orWhere('alasan', 'like', $like);
            });
        }

        return $query->orderByDesc('updated_at')->get()->map(fn (BudgetPaguRevision $row) => [
            'key' => "revisi:{$row->id}",
            'jenis' => 'revisi',
            'jenis_label' => 'Revisi Pagu',
            'ref_id' => $row->id,
            'nomor' => $row->nomor_pengajuan,
            'ringkasan' => ($row->level === 'ksro' ? $row->kode_ksro : $row->kode_jenis_belanja).' · '.$row->nama_satuan_ptk,
            'detail' => $row->alasan,
            'nilai' => (float) $row->selisih,
            'nilai_label' => 'Selisih',
            'status' => $row->status,
            'status_label' => $this->revisionStatusLabel($row->status),
            'occurred_at' => ($row->applied_at ?? $row->updated_at ?? $row->created_at)?->toIso8601String(),
            'actor' => $row->created_by,
            'extra' => [
                'pagu_sebelum' => (float) $row->pagu_sebelum,
                'pagu_sesudah' => (float) $row->pagu_sesudah,
                'level' => $row->level,
            ],
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function shiftHistoryRows(int $budgetYearId, ?string $statusFilter, string $search): Collection
    {
        $query = BudgetPaguShift::query()->where('budget_year_id', $budgetYearId);

        if ($statusFilter && in_array($statusFilter, ['draft', 'submitted', 'in_review', 'approved', 'applied', 'rejected'], true)) {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('nomor_pengajuan', 'like', $like)
                    ->orWhere('source_nama_satuan_ptk', 'like', $like)
                    ->orWhere('dest_nama_satuan_ptk', 'like', $like)
                    ->orWhere('alasan', 'like', $like);
            });
        }

        return $query->orderByDesc('updated_at')->get()->map(fn (BudgetPaguShift $row) => [
            'key' => "pergeseran:{$row->id}",
            'jenis' => 'pergeseran',
            'jenis_label' => 'Pergeseran Pagu',
            'ref_id' => $row->id,
            'nomor' => $row->nomor_pengajuan,
            'ringkasan' => ($row->source_kode_ksro ?? $row->source_kode_jenis_belanja)
                .' → '.($row->dest_kode_ksro ?? $row->dest_kode_jenis_belanja),
            'detail' => $row->alasan,
            'nilai' => (float) $row->nominal,
            'nilai_label' => 'Nominal',
            'status' => $row->status,
            'status_label' => $this->shiftStatusLabel($row->status),
            'occurred_at' => ($row->applied_at ?? $row->updated_at ?? $row->created_at)?->toIso8601String(),
            'actor' => $row->created_by,
            'extra' => [
                'source_unit' => $row->source_nama_satuan_ptk,
                'dest_unit' => $row->dest_nama_satuan_ptk,
                'level' => $row->level,
            ],
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function blokirHistoryRows(string $tahun, string $search, ?string $statusFilter = null): Collection
    {
        $query = DB::connection(RsudConnections::FINANCE)
            ->table('rba_block_histori as rbh')
            ->join('rba as r', 'r.id', '=', 'rbh.rba_id')
            ->join('ksro as k', 'k.id', '=', 'r.ksro_id')
            ->leftJoinSub(
                DB::connection(RsudConnections::FINANCE)
                    ->table('pagu_ksro as pk')
                    ->join('pagu_jenis_belanja as pjb', 'pjb.id', '=', 'pk.pagu_jenis_belanja_id')
                    ->join('pagu_kelompok_belanja as pkb', 'pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')
                    ->join('pagu as p', 'p.id', '=', 'pkb.pagu_id')
                    ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
                    ->whereNull('pk.deleted_at')
                    ->groupBy('pk.ksro_id', 'pt.nama_satuan_ptk')
                    ->select(['pk.ksro_id', 'pt.nama_satuan_ptk']),
                'ptk_map',
                'ptk_map.ksro_id',
                '=',
                'k.id'
            )
            ->where('r.tahun', $tahun)
            ->whereNull('r.deleted_at')
            ->select([
                'rbh.id',
                'rbh.rba_id',
                'rbh.block_type',
                'rbh.block_volume',
                'rbh.catatan',
                'rbh.created_at',
                'rbh.created_by',
                'r.nama_komponen',
                'k.kode_ksro',
                'k.nama_ksro',
                'ptk_map.nama_satuan_ptk',
            ])
            ->orderByDesc('rbh.id');

        if ($statusFilter && in_array($statusFilter, ['P', 'T', 'O'], true)) {
            $query->where('rbh.block_type', $statusFilter);
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('k.kode_ksro', 'like', $like)
                    ->orWhere('r.nama_komponen', 'like', $like)
                    ->orWhere('rbh.catatan', 'like', $like);
            });
        }

        return $query->get()->map(fn ($row) => [
            'key' => "blokir:{$row->id}",
            'jenis' => 'blokir',
            'jenis_label' => 'Blokir Anggaran',
            'ref_id' => (int) $row->rba_id,
            'nomor' => 'RBA-'.$row->rba_id,
            'ringkasan' => $row->kode_ksro.' · '.$row->nama_komponen,
            'detail' => $row->catatan,
            'nilai' => (float) $row->block_volume,
            'nilai_label' => 'Volume',
            'status' => (string) $row->block_type,
            'status_label' => $this->blokirTypeLabel((string) $row->block_type),
            'occurred_at' => $row->created_at ? (string) $row->created_at : null,
            'actor' => $row->created_by ? (string) $row->created_by : null,
            'extra' => [
                'nama_satuan_ptk' => $row->nama_satuan_ptk,
                'nama_ksro' => $row->nama_ksro,
                'histori_id' => (int) $row->id,
            ],
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function blokirEvents(int $rbaId): Collection
    {
        return DB::connection(RsudConnections::FINANCE)
            ->table('rba_block_histori')
            ->where('rba_id', $rbaId)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($row) => [
                'occurred_at' => $row->created_at ? (string) $row->created_at : null,
                'action' => 'budget_blokir.'.$row->block_type,
                'action_label' => $this->blokirTypeLabel((string) $row->block_type),
                'actor' => $row->created_by ? (string) $row->created_by : null,
                'note' => $row->catatan,
                'metadata' => [
                    'block_volume' => (int) $row->block_volume,
                    'block_type' => (string) $row->block_type,
                ],
            ]);
    }

    /**
     * @param  BudgetPaguRevision|BudgetPaguShift|null  $document
     * @return Collection<int, array<string, mixed>>
     */
    private function documentEvents(string $entityType, int $refId, $document): Collection
    {
        $events = collect();

        if ($document) {
            $events->push([
                'occurred_at' => $document->created_at?->toIso8601String(),
                'action' => "{$entityType}.created",
                'action_label' => 'Dibuat (draft)',
                'actor' => $document->created_by,
                'note' => null,
                'metadata' => null,
            ]);
        }

        $auditLogs = AuditLog::query()
            ->with('user:id,name')
            ->where('entity_type', $entityType)
            ->where('entity_id', $refId)
            ->orderBy('created_at')
            ->get();

        foreach ($auditLogs as $log) {
            $events->push([
                'occurred_at' => $log->created_at?->toIso8601String(),
                'action' => $log->action,
                'action_label' => $this->auditActionLabel($log->action),
                'actor' => $log->user?->name ?? ($log->user_id ? (string) $log->user_id : null),
                'note' => null,
                'metadata' => $log->metadata,
            ]);
        }

        if ($document && $document->approval_instance_id) {
            $actions = ApprovalAction::query()
                ->with('user:id,name')
                ->where('approval_instance_id', $document->approval_instance_id)
                ->orderBy('acted_at')
                ->get();

            foreach ($actions as $action) {
                $events->push([
                    'occurred_at' => $action->acted_at?->toIso8601String(),
                    'action' => 'approval.'.$action->action,
                    'action_label' => $action->action === 'approved' ? 'Disetujui' : 'Ditolak',
                    'actor' => $action->user?->name,
                    'note' => $action->note,
                    'metadata' => ['step' => $action->step],
                ]);
            }
        }

        if ($document?->applied_at) {
            $events->push([
                'occurred_at' => $document->applied_at->toIso8601String(),
                'action' => "{$entityType}.applied",
                'action_label' => 'Diterapkan ke FINANCE',
                'actor' => $document->updated_by,
                'note' => null,
                'metadata' => null,
            ]);
        }

        return $events
            ->filter(fn ($e) => ! empty($e['occurred_at']))
            ->sortByDesc('occurred_at')
            ->values();
    }

    private function revisionStatusLabel(string $status): string
    {
        return match ($status) {
            'draft' => 'Draft',
            'in_review' => 'Dalam Review',
            'applied' => 'Diterapkan',
            'rejected' => 'Ditolak',
            default => ucfirst($status),
        };
    }

    private function shiftStatusLabel(string $status): string
    {
        return $this->revisionStatusLabel($status);
    }

    private function blokirTypeLabel(string $type): string
    {
        return match ($type) {
            'P' => 'Blokir Sebagian',
            'T' => 'Blokir Total',
            'O' => 'Lepas Blokir',
            default => $type,
        };
    }

    private function auditActionLabel(string $action): string
    {
        return match ($action) {
            'budget_revision.created' => 'Draft dibuat',
            'budget_revision.submitted' => 'Diajukan',
            'budget_revision.approved' => 'Disetujui',
            'budget_revision.rejected' => 'Ditolak',
            'budget_revision.applied' => 'Diterapkan',
            'budget_shift.created' => 'Draft dibuat',
            'budget_shift.submitted' => 'Diajukan',
            'budget_shift.approved' => 'Disetujui',
            'budget_shift.rejected' => 'Ditolak',
            'budget_shift.applied' => 'Diterapkan',
            default => str_replace(['budget_revision.', 'budget_shift.', '_'], ['', '', ' '], $action),
        };
    }
}

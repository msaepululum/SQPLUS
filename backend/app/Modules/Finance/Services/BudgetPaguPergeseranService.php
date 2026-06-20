<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetPaguShift;
use App\Modules\Finance\Models\BudgetYear;
use App\Services\ApprovalService;
use App\Services\AuditTrailService;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class BudgetPaguPergeseranService
{
    public function __construct(
        private readonly BudgetPaguSetupService $paguSetupService,
        private readonly BudgetPaguDistribusiService $distribusiService,
        private readonly BudgetPaguRevisiService $revisiService,
        private readonly ApprovalService $approvals,
        private readonly AuditTrailService $auditTrail,
    ) {}

    public function meta(): array
    {
        return $this->paguSetupService->meta();
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   level?: string,
     *   ptk_id?: int,
     *   kelompok_belanja_id?: int,
     *   jenis_belanja_id?: int,
     *   pagu_jenis_belanja_id?: int,
     *   search?: string
     * }  $filters
     */
    public function listTargets(array $filters): Collection
    {
        $level = $filters['level'] ?? 'jenis_belanja';

        if ($level === 'ksro') {
            return $this->listKsroTargets($filters);
        }

        return $this->revisiService->listTargets($filters)->map(function (array $row) {
            $row['pagu_jenis_belanja_id'] = $row['level'] === 'jenis_belanja'
                ? $row['finance_id']
                : null;
            $row['pending_shift'] = $this->hasPendingShift($row['level'], (int) $row['finance_id']);

            return $row;
        });
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   status?: string,
     *   level?: string,
     *   ptk_id?: int,
     *   search?: string,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     * @return array{rows: Collection, summary: array<string, mixed>, meta: array<string, int>}
     */
    public function listShifts(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 50)));

        $query = BudgetPaguShift::query()
            ->where('budget_year_id', $filters['budget_year_id']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }
        if (! empty($filters['ptk_id'])) {
            $ptkId = (int) $filters['ptk_id'];
            $query->where(function ($q) use ($ptkId) {
                $q->where('source_ptk_id', $ptkId)->orWhere('dest_ptk_id', $ptkId);
            });
        }

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('nomor_pengajuan', 'like', $like)
                    ->orWhere('source_nama_satuan_ptk', 'like', $like)
                    ->orWhere('dest_nama_satuan_ptk', 'like', $like)
                    ->orWhere('source_kode_ksro', 'like', $like)
                    ->orWhere('dest_kode_ksro', 'like', $like)
                    ->orWhere('alasan', 'like', $like);
            });
        }

        $summary = [
            'total' => (clone $query)->count(),
            'draft' => (clone $query)->where('status', 'draft')->count(),
            'in_progress' => (clone $query)->whereIn('status', ['submitted', 'in_review'])->count(),
            'applied' => (clone $query)->where('status', 'applied')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'total_nominal' => (float) (clone $query)->whereIn('status', ['in_review', 'approved', 'applied'])->sum('nominal'),
        ];

        $total = $summary['total'];
        $rows = $query
            ->orderByDesc('created_at')
            ->forPage($page, $perPage)
            ->get()
            ->map(fn (BudgetPaguShift $row) => $this->mapShift($row));

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
     * @param  array{
     *   budget_year_id: int,
     *   level: string,
     *   source_finance_id: int,
     *   dest_finance_id: int,
     *   nominal: float|string,
     *   alasan: string
     * }  $data
     */
    public function create(array $data, ?string $actor, ?int $submitterUserId = null): BudgetPaguShift
    {
        $source = $this->resolveTarget((int) $data['budget_year_id'], $data['level'], (int) $data['source_finance_id']);
        $dest = $this->resolveTarget((int) $data['budget_year_id'], $data['level'], (int) $data['dest_finance_id']);

        $this->assertValidShiftPair($data['level'], $source, $dest);

        $nominal = (float) $data['nominal'];
        $this->assertValidNominal($nominal, (float) $source['pagu_saat_ini']);

        $this->assertNoPendingShiftOnFinanceIds(
            $data['level'],
            (int) $data['source_finance_id'],
            (int) $data['dest_finance_id']
        );

        $shift = BudgetPaguShift::query()->create([
            'budget_year_id' => $data['budget_year_id'],
            'level' => $data['level'],
            'pagu_jenis_belanja_id' => $data['level'] === 'ksro' ? $source['pagu_jenis_belanja_id'] : null,
            'tahun' => $source['tahun'],
            'source_finance_id' => (int) $data['source_finance_id'],
            'dest_finance_id' => (int) $data['dest_finance_id'],
            'source_ptk_id' => $source['ptk_id'],
            'source_nama_satuan_ptk' => $source['nama_satuan_ptk'],
            'source_kode_kelompok_belanja' => $source['kode_kelompok_belanja'],
            'source_kode_jenis_belanja' => $source['kode_jenis_belanja'],
            'source_kode_ksro' => $source['kode_ksro'],
            'source_nama_ksro' => $source['nama_ksro'],
            'dest_ptk_id' => $dest['ptk_id'],
            'dest_nama_satuan_ptk' => $dest['nama_satuan_ptk'],
            'dest_kode_kelompok_belanja' => $dest['kode_kelompok_belanja'],
            'dest_kode_jenis_belanja' => $dest['kode_jenis_belanja'],
            'dest_kode_ksro' => $dest['kode_ksro'],
            'dest_nama_ksro' => $dest['nama_ksro'],
            'source_pagu_sebelum' => $source['pagu_saat_ini'],
            'source_pagu_sesudah' => $source['pagu_saat_ini'] - $nominal,
            'dest_pagu_sebelum' => $dest['pagu_saat_ini'],
            'dest_pagu_sesudah' => $dest['pagu_saat_ini'] + $nominal,
            'nominal' => $nominal,
            'alasan' => trim($data['alasan']),
            'status' => 'draft',
            'created_by' => $actor,
            'updated_by' => $actor,
        ]);

        $shift->update(['nomor_pengajuan' => $this->buildNomor($shift)]);

        $this->auditTrail->log('budget_shift.created', 'budget_shift', $shift->id, $submitterUserId);

        return $shift->fresh();
    }

    public function submit(int $id, int $submitterUserId, ?string $actor): BudgetPaguShift
    {
        $shift = $this->findOrFail($id);
        if ($shift->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' => 'Hanya pengajuan draft yang dapat diajukan.',
            ]);
        }

        $instance = $this->approvals->submit(
            'budget_shift',
            $shift->id,
            $submitterUserId,
            [
                'amount' => (float) $shift->nominal,
                'level' => $shift->level,
            ]
        );

        $shift->update([
            'status' => 'in_review',
            'approval_instance_id' => $instance->id,
            'submitted_by' => $submitterUserId,
            'updated_by' => $actor,
        ]);

        $this->auditTrail->log(
            'budget_shift.submitted',
            'budget_shift',
            $shift->id,
            $submitterUserId,
            ['approval_instance_id' => $instance->id]
        );

        return $shift->fresh();
    }

    public function markApproved(BudgetPaguShift $shift): void
    {
        DB::transaction(function () use ($shift) {
            $shift->refresh();
            if ($shift->status === 'applied') {
                return;
            }

            $shift->update(['status' => 'approved']);
            $this->applyToFinance($shift, null);
            $this->auditTrail->log('budget_shift.approved', 'budget_shift', $shift->id);
        });
    }

    public function markRejected(BudgetPaguShift $shift): void
    {
        $shift->update(['status' => 'rejected']);
        $this->auditTrail->log('budget_shift.rejected', 'budget_shift', $shift->id);
    }

    public function applyToFinance(BudgetPaguShift $shift, ?string $actor): void
    {
        if ($shift->status === 'applied') {
            return;
        }

        if ($shift->status !== 'approved') {
            throw new RuntimeException('Pergeseran belum disetujui.');
        }

        if ($shift->level === 'ksro') {
            $this->distribusiService->updateTotalPagu(
                (int) $shift->source_finance_id,
                (float) $shift->source_pagu_sesudah,
                $actor
            );
            $this->distribusiService->updateTotalPagu(
                (int) $shift->dest_finance_id,
                (float) $shift->dest_pagu_sesudah,
                $actor
            );
        } else {
            $this->updateJenisPaguByFinanceId(
                $shift->tahun,
                (int) $shift->source_finance_id,
                (float) $shift->source_pagu_sesudah,
                $actor
            );
            $this->updateJenisPaguByFinanceId(
                $shift->tahun,
                (int) $shift->dest_finance_id,
                (float) $shift->dest_pagu_sesudah,
                $actor
            );
        }

        $shift->update([
            'status' => 'applied',
            'applied_at' => now(),
            'applied_by' => $shift->submitted_by,
            'updated_by' => $actor,
        ]);

        $this->auditTrail->log('budget_shift.applied', 'budget_shift', $shift->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function listKsroTargets(array $filters): Collection
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;

        $query = DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('ksro as k', 'k.id', '=', 'pk.ksro_id')
            ->join('pagu_jenis_belanja as pjb', 'pjb.id', '=', 'pk.pagu_jenis_belanja_id')
            ->join('pagu_kelompok_belanja as pkb', 'pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')
            ->join('pagu as p', 'p.id', '=', 'pkb.pagu_id')
            ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
            ->join('jenis_belanja as jb', 'jb.id', '=', 'pjb.jenis_belanja_id')
            ->join('kelompok_belanja as kb', 'kb.id', '=', 'pkb.kelompok_belanja_id')
            ->whereNull('pk.deleted_at')
            ->whereNull('k.deleted_at')
            ->whereNull('pjb.deleted_at')
            ->where('p.tahun', $tahun)
            ->select([
                'pk.id as finance_id',
                'pjb.id as pagu_jenis_belanja_id',
                'p.tahun',
                'p.ptk_id',
                'pt.nama_satuan_ptk',
                'pkb.kelompok_belanja_id',
                'kb.kode_kelompok_belanja',
                'pjb.jenis_belanja_id',
                'jb.kode_jenis_belanja',
                'k.id as ksro_id',
                'k.kode_ksro',
                'k.nama_ksro',
                'pk.total_pagu as pagu_saat_ini',
            ])
            ->orderBy('pt.nama_satuan_ptk')
            ->orderBy('k.kode_ksro');

        if (! empty($filters['pagu_jenis_belanja_id'])) {
            $query->where('pjb.id', (int) $filters['pagu_jenis_belanja_id']);
        }
        if (! empty($filters['ptk_id'])) {
            $query->where('p.ptk_id', (int) $filters['ptk_id']);
        }
        if (! empty($filters['kelompok_belanja_id'])) {
            $query->where('pkb.kelompok_belanja_id', (int) $filters['kelompok_belanja_id']);
        }
        if (! empty($filters['jenis_belanja_id'])) {
            $query->where('pjb.jenis_belanja_id', (int) $filters['jenis_belanja_id']);
        }

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('k.kode_ksro', 'like', $like)
                    ->orWhere('k.nama_ksro', 'like', $like);
            });
        }

        return $query->get()->map(fn ($row) => [
            'level' => 'ksro',
            'finance_id' => (int) $row->finance_id,
            'pagu_jenis_belanja_id' => (int) $row->pagu_jenis_belanja_id,
            'tahun' => (string) $row->tahun,
            'ptk_id' => (int) $row->ptk_id,
            'nama_satuan_ptk' => (string) $row->nama_satuan_ptk,
            'kelompok_belanja_id' => (int) $row->kelompok_belanja_id,
            'kode_kelompok_belanja' => (string) $row->kode_kelompok_belanja,
            'jenis_belanja_id' => (int) $row->jenis_belanja_id,
            'kode_jenis_belanja' => (string) $row->kode_jenis_belanja,
            'ksro_id' => (int) $row->ksro_id,
            'kode_ksro' => (string) $row->kode_ksro,
            'nama_ksro' => (string) $row->nama_ksro,
            'pagu_saat_ini' => (float) $row->pagu_saat_ini,
            'pending_shift' => $this->hasPendingShift('ksro', (int) $row->finance_id),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveTarget(int $budgetYearId, string $level, int $financeId): array
    {
        $target = $this->listTargets([
            'budget_year_id' => $budgetYearId,
            'level' => $level,
        ])->first(fn ($row) => (int) $row['finance_id'] === $financeId);

        if (! $target) {
            throw ValidationException::withMessages([
                'finance_id' => 'Data pagu tidak ditemukan.',
            ]);
        }

        return $target;
    }

    /**
     * @param  array<string, mixed>  $source
     * @param  array<string, mixed>  $dest
     */
    private function assertValidShiftPair(string $level, array $source, array $dest): void
    {
        if ((int) $source['finance_id'] === (int) $dest['finance_id']) {
            throw ValidationException::withMessages([
                'dest_finance_id' => 'Pagu asal dan tujuan tidak boleh sama.',
            ]);
        }

        if ($level === 'ksro') {
            if ((int) $source['pagu_jenis_belanja_id'] !== (int) $dest['pagu_jenis_belanja_id']) {
                throw ValidationException::withMessages([
                    'dest_finance_id' => 'Pergeseran KSRO harus dalam pagu induk (jenis belanja) yang sama.',
                ]);
            }
        }
    }

    private function assertValidNominal(float $nominal, float $sourcePagu): void
    {
        if ($nominal <= 0) {
            throw ValidationException::withMessages([
                'nominal' => 'Nominal pergeseran harus lebih dari 0.',
            ]);
        }

        if ($nominal > $sourcePagu + 0.0001) {
            throw ValidationException::withMessages([
                'nominal' => 'Nominal melebihi pagu asal yang tersedia.',
            ]);
        }
    }

    private function hasPendingShift(string $level, int $financeId): bool
    {
        return BudgetPaguShift::query()
            ->where('level', $level)
            ->whereIn('status', ['draft', 'submitted', 'in_review', 'approved'])
            ->where(function ($q) use ($financeId) {
                $q->where('source_finance_id', $financeId)
                    ->orWhere('dest_finance_id', $financeId);
            })
            ->exists();
    }

    private function assertNoPendingShiftOnFinanceIds(string $level, int $sourceId, int $destId): void
    {
        if ($this->hasPendingShift($level, $sourceId) || $this->hasPendingShift($level, $destId)) {
            throw ValidationException::withMessages([
                'source_finance_id' => 'Masih ada pengajuan pergeseran aktif untuk pagu terkait.',
            ]);
        }
    }

    private function updateJenisPaguByFinanceId(string $tahun, int $paguJenisBelanjaId, float $total, ?string $actor): void
    {
        $row = $this->paguSetupService->list(['tahun' => $tahun])
            ->first(fn ($r) => (int) $r->pagu_jenis_belanja_id === $paguJenisBelanjaId);

        if (! $row) {
            throw ValidationException::withMessages([
                'finance_id' => 'Data pagu induk tidak ditemukan di FINANCE.',
            ]);
        }

        $this->paguSetupService->updateTotalPagu((int) $row->id, $total, $actor);
    }

    private function buildNomor(BudgetPaguShift $shift): string
    {
        return sprintf('PGS-%s-%05d', $shift->tahun, $shift->id);
    }

    private function findOrFail(int $id): BudgetPaguShift
    {
        $shift = BudgetPaguShift::query()->find($id);
        if (! $shift) {
            throw ValidationException::withMessages([
                'id' => 'Pengajuan pergeseran pagu tidak ditemukan.',
            ]);
        }

        return $shift;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapShift(BudgetPaguShift $row): array
    {
        return [
            'id' => $row->id,
            'budget_year_id' => $row->budget_year_id,
            'nomor_pengajuan' => $row->nomor_pengajuan,
            'level' => $row->level,
            'level_label' => $row->level === 'ksro' ? 'Distribusi KSRO' : 'Pagu Induk',
            'pagu_jenis_belanja_id' => $row->pagu_jenis_belanja_id,
            'tahun' => $row->tahun,
            'source_finance_id' => $row->source_finance_id,
            'dest_finance_id' => $row->dest_finance_id,
            'source_nama_satuan_ptk' => $row->source_nama_satuan_ptk,
            'source_kode_jenis_belanja' => $row->source_kode_jenis_belanja,
            'source_kode_ksro' => $row->source_kode_ksro,
            'source_nama_ksro' => $row->source_nama_ksro,
            'dest_nama_satuan_ptk' => $row->dest_nama_satuan_ptk,
            'dest_kode_jenis_belanja' => $row->dest_kode_jenis_belanja,
            'dest_kode_ksro' => $row->dest_kode_ksro,
            'dest_nama_ksro' => $row->dest_nama_ksro,
            'source_pagu_sebelum' => (float) $row->source_pagu_sebelum,
            'source_pagu_sesudah' => (float) $row->source_pagu_sesudah,
            'dest_pagu_sebelum' => (float) $row->dest_pagu_sebelum,
            'dest_pagu_sesudah' => (float) $row->dest_pagu_sesudah,
            'nominal' => (float) $row->nominal,
            'alasan' => $row->alasan,
            'status' => $row->status,
            'status_label' => $this->statusLabel($row->status),
            'approval_instance_id' => $row->approval_instance_id,
            'applied_at' => $row->applied_at?->toIso8601String(),
            'created_at' => $row->created_at?->toIso8601String(),
        ];
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'draft' => 'Draft',
            'submitted' => 'Diajukan',
            'in_review' => 'Dalam Review',
            'approved' => 'Disetujui',
            'applied' => 'Diterapkan',
            'rejected' => 'Ditolak',
            default => ucfirst($status),
        };
    }
}

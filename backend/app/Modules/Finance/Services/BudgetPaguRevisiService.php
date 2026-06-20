<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetPaguRevision;
use App\Modules\Finance\Models\BudgetYear;
use App\Services\ApprovalService;
use App\Services\AuditTrailService;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class BudgetPaguRevisiService
{
    public function __construct(
        private readonly BudgetPaguSetupService $paguSetupService,
        private readonly BudgetPaguDistribusiService $distribusiService,
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
     *   search?: string
     * }  $filters
     */
    public function listTargets(array $filters): Collection
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;
        $level = $filters['level'] ?? 'jenis_belanja';

        if ($level === 'ksro') {
            return $this->listKsroTargets($tahun, $filters);
        }

        $rows = $this->paguSetupService->list(array_filter([
            'tahun' => $tahun,
            'ptk_id' => $filters['ptk_id'] ?? null,
            'kelompok_belanja_id' => $filters['kelompok_belanja_id'] ?? null,
            'jenis_belanja_id' => $filters['jenis_belanja_id'] ?? null,
        ], fn ($v) => $v !== null && $v !== ''));

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $q = strtolower($search);
            $rows = $rows->filter(
                fn ($row) => str_contains(strtolower($row->nama_satuan_ptk ?? ''), $q)
                    || str_contains(strtolower($row->kode_kelompok_belanja ?? ''), $q)
                    || str_contains(strtolower($row->kode_jenis_belanja ?? ''), $q)
            );
        }

        return $rows->map(fn ($row) => [
            'level' => 'jenis_belanja',
            'finance_id' => (int) $row->pagu_jenis_belanja_id,
            'pagu_id' => (int) $row->id,
            'tahun' => (string) $row->tahun,
            'ptk_id' => (int) $row->ptk_id,
            'nama_satuan_ptk' => (string) $row->nama_satuan_ptk,
            'kelompok_belanja_id' => (int) $row->kelompok_belanja_id,
            'kode_kelompok_belanja' => (string) $row->kode_kelompok_belanja,
            'jenis_belanja_id' => (int) $row->jenis_belanja_id,
            'kode_jenis_belanja' => (string) $row->kode_jenis_belanja,
            'ksro_id' => null,
            'kode_ksro' => null,
            'nama_ksro' => null,
            'pagu_saat_ini' => (float) $row->total_pagu,
            'pending_revision' => $this->hasPendingRevision('jenis_belanja', (int) $row->pagu_jenis_belanja_id),
        ])->values();
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   status?: string,
     *   level?: string,
     *   ptk_id?: int,
     *   kelompok_belanja_id?: int,
     *   jenis_belanja_id?: int,
     *   search?: string,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     * @return array{rows: Collection, summary: array<string, mixed>, meta: array<string, int>}
     */
    public function listRevisions(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 50)));

        $query = BudgetPaguRevision::query()
            ->where('budget_year_id', $filters['budget_year_id']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }
        if (! empty($filters['ptk_id'])) {
            $query->where('ptk_id', (int) $filters['ptk_id']);
        }
        if (! empty($filters['kelompok_belanja_id'])) {
            $query->where('kelompok_belanja_id', (int) $filters['kelompok_belanja_id']);
        }
        if (! empty($filters['jenis_belanja_id'])) {
            $query->where('jenis_belanja_id', (int) $filters['jenis_belanja_id']);
        }

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('nomor_pengajuan', 'like', $like)
                    ->orWhere('nama_satuan_ptk', 'like', $like)
                    ->orWhere('kode_ksro', 'like', $like)
                    ->orWhere('alasan', 'like', $like);
            });
        }

        $summary = [
            'total' => (clone $query)->count(),
            'draft' => (clone $query)->where('status', 'draft')->count(),
            'in_progress' => (clone $query)->whereIn('status', ['submitted', 'in_review'])->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'applied' => (clone $query)->where('status', 'applied')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'total_selisih' => (float) (clone $query)->whereIn('status', ['submitted', 'in_review', 'approved', 'applied'])->sum('selisih'),
        ];

        $total = $summary['total'];
        $rows = $query
            ->orderByDesc('created_at')
            ->forPage($page, $perPage)
            ->get()
            ->map(fn (BudgetPaguRevision $row) => $this->mapRevision($row));

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

    public function find(int $id): ?BudgetPaguRevision
    {
        return BudgetPaguRevision::query()->find($id);
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   level: string,
     *   finance_id: int,
     *   pagu_sesudah: float|string,
     *   alasan: string
     * }  $data
     */
    public function create(array $data, ?string $actor, ?int $submitterUserId = null): BudgetPaguRevision
    {
        $snapshot = $this->resolveTargetSnapshot(
            (int) $data['budget_year_id'],
            $data['level'],
            (int) $data['finance_id']
        );

        $this->assertNoPendingRevision($data['level'], (int) $data['finance_id']);

        $paguSesudah = (float) $data['pagu_sesudah'];
        $paguSebelum = (float) $snapshot['pagu_saat_ini'];
        $this->assertValidRevisionAmounts($paguSebelum, $paguSesudah);

        $revision = BudgetPaguRevision::query()->create([
            ...$snapshot,
            'budget_year_id' => $data['budget_year_id'],
            'level' => $data['level'],
            'finance_id' => (int) $data['finance_id'],
            'pagu_sebelum' => $paguSebelum,
            'pagu_sesudah' => $paguSesudah,
            'selisih' => $paguSesudah - $paguSebelum,
            'alasan' => trim($data['alasan']),
            'status' => 'draft',
            'created_by' => $actor,
            'updated_by' => $actor,
        ]);

        $revision->update([
            'nomor_pengajuan' => $this->buildNomor($revision),
        ]);

        $this->auditTrail->log('budget_revision.created', 'budget_revision', $revision->id, $submitterUserId);

        return $revision->fresh();
    }

    /**
     * @param  array{pagu_sesudah?: float|string, alasan?: string}  $data
     */
    public function updateDraft(int $id, array $data, ?string $actor): BudgetPaguRevision
    {
        $revision = $this->findOrFail($id);
        if ($revision->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' => 'Hanya pengajuan draft yang dapat diubah.',
            ]);
        }

        $paguSesudah = isset($data['pagu_sesudah']) ? (float) $data['pagu_sesudah'] : (float) $revision->pagu_sesudah;
        $this->assertValidRevisionAmounts((float) $revision->pagu_sebelum, $paguSesudah);

        $revision->update([
            'pagu_sesudah' => $paguSesudah,
            'selisih' => $paguSesudah - (float) $revision->pagu_sebelum,
            'alasan' => isset($data['alasan']) ? trim($data['alasan']) : $revision->alasan,
            'updated_by' => $actor,
        ]);

        return $revision->fresh();
    }

    public function submit(int $id, int $submitterUserId, ?string $actor): BudgetPaguRevision
    {
        $revision = $this->findOrFail($id);
        if ($revision->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' => 'Hanya pengajuan draft yang dapat diajukan.',
            ]);
        }

        $instance = $this->approvals->submit(
            'budget_revision',
            $revision->id,
            $submitterUserId,
            [
                'amount' => abs((float) $revision->selisih),
                'level' => $revision->level,
                'finance_id' => $revision->finance_id,
            ]
        );

        $revision->update([
            'status' => 'in_review',
            'approval_instance_id' => $instance->id,
            'submitted_by' => $submitterUserId,
            'updated_by' => $actor,
        ]);

        $this->auditTrail->log(
            'budget_revision.submitted',
            'budget_revision',
            $revision->id,
            $submitterUserId,
            ['approval_instance_id' => $instance->id]
        );

        return $revision->fresh();
    }

    public function markApproved(BudgetPaguRevision $revision): void
    {
        DB::transaction(function () use ($revision) {
            $revision->refresh();
            if ($revision->status === 'applied') {
                return;
            }

            $revision->update(['status' => 'approved']);
            $this->applyToFinance($revision, null);
            $this->auditTrail->log('budget_revision.approved', 'budget_revision', $revision->id);
        });
    }

    public function markRejected(BudgetPaguRevision $revision): void
    {
        $revision->update(['status' => 'rejected']);
        $this->auditTrail->log('budget_revision.rejected', 'budget_revision', $revision->id);
    }

    public function applyToFinance(BudgetPaguRevision $revision, ?string $actor): void
    {
        if ($revision->status === 'applied') {
            return;
        }

        if (! in_array($revision->status, ['approved'], true)) {
            throw new RuntimeException('Revisi belum disetujui.');
        }

        if ($revision->level === 'ksro') {
            $this->distribusiService->updateTotalPagu((int) $revision->finance_id, (float) $revision->pagu_sesudah, $actor);
        } else {
            $row = $this->paguSetupService->list(['tahun' => $revision->tahun])
                ->first(fn ($r) => (int) $r->pagu_jenis_belanja_id === (int) $revision->finance_id);

            if (! $row) {
                throw ValidationException::withMessages([
                    'finance_id' => 'Data pagu induk tidak ditemukan di FINANCE.',
                ]);
            }

            $this->paguSetupService->updateTotalPagu((int) $row->id, (float) $revision->pagu_sesudah, $actor);
        }

        $revision->update([
            'status' => 'applied',
            'applied_at' => now(),
            'applied_by' => $actor ? null : $revision->submitted_by,
            'updated_by' => $actor,
        ]);

        $this->auditTrail->log('budget_revision.applied', 'budget_revision', $revision->id);
    }

    private function listKsroTargets(string $tahun, array $filters): Collection
    {
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
                'p.id as pagu_id',
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
            'pagu_id' => (int) $row->pagu_id,
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
            'pending_revision' => $this->hasPendingRevision('ksro', (int) $row->finance_id),
        ]);
    }

    private function resolveTargetSnapshot(int $budgetYearId, string $level, int $financeId): array
    {
        $year = BudgetYear::query()->findOrFail($budgetYearId);
        $filters = ['budget_year_id' => $budgetYearId, 'level' => $level];

        if ($level === 'ksro') {
            $target = $this->listKsroTargets((string) $year->tahun, $filters)
                ->first(fn ($row) => (int) $row['finance_id'] === $financeId);
        } else {
            $row = $this->paguSetupService->list(['tahun' => (string) $year->tahun])
                ->first(fn ($r) => (int) $r->pagu_jenis_belanja_id === $financeId);

            $target = $row ? [
                'tahun' => (string) $row->tahun,
                'ptk_id' => (int) $row->ptk_id,
                'nama_satuan_ptk' => (string) $row->nama_satuan_ptk,
                'kelompok_belanja_id' => (int) $row->kelompok_belanja_id,
                'kode_kelompok_belanja' => (string) $row->kode_kelompok_belanja,
                'jenis_belanja_id' => (int) $row->jenis_belanja_id,
                'kode_jenis_belanja' => (string) $row->kode_jenis_belanja,
                'ksro_id' => null,
                'kode_ksro' => null,
                'nama_ksro' => null,
                'pagu_saat_ini' => (float) $row->total_pagu,
            ] : null;
        }

        if (! $target) {
            throw ValidationException::withMessages([
                'finance_id' => 'Data pagu target tidak ditemukan.',
            ]);
        }

        return [
            'tahun' => $target['tahun'],
            'ptk_id' => $target['ptk_id'],
            'nama_satuan_ptk' => $target['nama_satuan_ptk'],
            'kelompok_belanja_id' => $target['kelompok_belanja_id'],
            'kode_kelompok_belanja' => $target['kode_kelompok_belanja'],
            'jenis_belanja_id' => $target['jenis_belanja_id'],
            'kode_jenis_belanja' => $target['kode_jenis_belanja'],
            'ksro_id' => $target['ksro_id'],
            'kode_ksro' => $target['kode_ksro'],
            'nama_ksro' => $target['nama_ksro'],
            'pagu_saat_ini' => $target['pagu_saat_ini'],
        ];
    }

    private function hasPendingRevision(string $level, int $financeId): bool
    {
        return BudgetPaguRevision::query()
            ->where('level', $level)
            ->where('finance_id', $financeId)
            ->whereIn('status', ['draft', 'submitted', 'in_review', 'approved'])
            ->exists();
    }

    private function assertNoPendingRevision(string $level, int $financeId): void
    {
        if ($this->hasPendingRevision($level, $financeId)) {
            throw ValidationException::withMessages([
                'finance_id' => 'Masih ada pengajuan revisi aktif untuk pagu ini.',
            ]);
        }
    }

    private function assertValidRevisionAmounts(float $sebelum, float $sesudah): void
    {
        if ($sesudah < 0) {
            throw ValidationException::withMessages([
                'pagu_sesudah' => 'Pagu revisi tidak boleh negatif.',
            ]);
        }
        if (abs($sesudah - $sebelum) < 0.0001) {
            throw ValidationException::withMessages([
                'pagu_sesudah' => 'Pagu revisi harus berbeda dari pagu saat ini.',
            ]);
        }
    }

    private function buildNomor(BudgetPaguRevision $revision): string
    {
        return sprintf('REV-%s-%05d', $revision->tahun, $revision->id);
    }

    private function findOrFail(int $id): BudgetPaguRevision
    {
        $revision = $this->find($id);
        if (! $revision) {
            throw ValidationException::withMessages([
                'id' => 'Pengajuan revisi pagu tidak ditemukan.',
            ]);
        }

        return $revision;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapRevision(BudgetPaguRevision $row): array
    {
        return [
            'id' => $row->id,
            'budget_year_id' => $row->budget_year_id,
            'nomor_pengajuan' => $row->nomor_pengajuan,
            'level' => $row->level,
            'level_label' => $row->level === 'ksro' ? 'Distribusi KSRO' : 'Pagu Induk',
            'finance_id' => $row->finance_id,
            'tahun' => $row->tahun,
            'ptk_id' => $row->ptk_id,
            'nama_satuan_ptk' => $row->nama_satuan_ptk,
            'kode_kelompok_belanja' => $row->kode_kelompok_belanja,
            'kode_jenis_belanja' => $row->kode_jenis_belanja,
            'kode_ksro' => $row->kode_ksro,
            'nama_ksro' => $row->nama_ksro,
            'pagu_sebelum' => (float) $row->pagu_sebelum,
            'pagu_sesudah' => (float) $row->pagu_sesudah,
            'selisih' => (float) $row->selisih,
            'alasan' => $row->alasan,
            'status' => $row->status,
            'status_label' => $this->statusLabel($row->status),
            'approval_instance_id' => $row->approval_instance_id,
            'applied_at' => $row->applied_at?->toIso8601String(),
            'created_at' => $row->created_at?->toIso8601String(),
            'updated_at' => $row->updated_at?->toIso8601String(),
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

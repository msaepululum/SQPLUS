<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ExpenditureAjuService
{
    private const BULAN_LABELS = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    /** @var array<string, list<string>> */
    private const LEGACY_STATUS_TO_DB = [
        'menunggu-pembayaran' => ['APPROVED'],
        'sudah-dibayar' => ['CLOSE'],
    ];

    public function __construct(
        private readonly BudgetPaguSetupService $paguSetupService,
        private readonly ExpenditureAjuWorkflowResolver $workflowResolver,
    ) {}

    public function meta(?string $createdBy = null, ?int $budgetYearId = null): array
    {
        $base = $this->paguSetupService->meta();
        $scope = $createdBy !== null ? $this->resolveUserScope($createdBy) : null;
        $tahun = null;
        if ($budgetYearId) {
            $year = BudgetYear::query()->find($budgetYearId);
            $tahun = $year ? (string) $year->tahun : null;
        }

        return array_merge($base, [
            'bulan_options' => collect(self::BULAN_LABELS)
                ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'tahap_proses_options' => array_map(
                fn (array $step) => ['value' => $step['id'], 'label' => $step['label']],
                array_merge(
                    [
                        ['id' => 'draft', 'label' => 'Draft'],
                        ['id' => 'diajukan', 'label' => 'Diajukan'],
                        ['id' => 'menunggu-persetujuan', 'label' => 'Menunggu Persetujuan'],
                        ['id' => 'disetujui', 'label' => 'Disetujui'],
                        ['id' => 'negosiasi', 'label' => 'Negosiasi'],
                        ['id' => 'surat-pesanan', 'label' => 'Surat Pesanan'],
                        ['id' => 'penerimaan-barang', 'label' => 'Penerimaan Barang'],
                        ['id' => 'verifikasi-berkas', 'label' => 'Verifikasi Berkas'],
                        ['id' => 'rencana-bayar', 'label' => 'Rencana Bayar'],
                        ['id' => 'pembayaran-berhasil', 'label' => 'Pembayaran Berhasil'],
                        ['id' => 'ditolak', 'label' => 'Ditolak'],
                        ['id' => 'dibatalkan', 'label' => 'Dibatalkan'],
                    ]
                )
            ),
            'scope' => $scope,
            'ksro_options' => ($scope && $tahun) ? $this->ksroOptionsForScope($tahun, $scope) : [],
            'can_create' => $scope !== null && ($scope['departemen_id'] ?? null) !== null,
        ]);
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   bulan?: int,
     *   ptk_id?: int,
     *   jenis_belanja_id?: int,
     *   status?: string,
     *   search?: string,
     *   page?: int,
     *   per_page?: int,
     *   created_by?: string
     * }  $filters
     * @return array{rows: Collection, summary: array<string, mixed>, meta: array<string, int>}
     */
    public function list(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 10)));
        $search = trim((string) ($filters['search'] ?? ''));

        $query = DB::connection(RsudConnections::FINANCE)
            ->table('aju as a')
            ->whereNull('a.deleted_at')
            ->where('a.tahun', $tahun);

        if (! empty($filters['created_by'])) {
            $query->whereIn('a.created_by', $this->createdByCandidates((string) $filters['created_by']));
        }

        if (! empty($filters['bulan'])) {
            $bulan = (int) $filters['bulan'];
            $query->whereNotNull('a.tgl')->whereRaw('MONTH(a.tgl) = ?', [$bulan]);
        }

        if (! empty($filters['status'])) {
            $legacyDb = self::LEGACY_STATUS_TO_DB[$filters['status']] ?? null;
            if ($legacyDb !== null) {
                $query->whereIn('a.status', $legacyDb);
            }
        }

        if (! empty($filters['ptk_id'])) {
            $ptkId = (int) $filters['ptk_id'];
            $query->where(function ($q) use ($ptkId) {
                $q->whereExists(function ($sub) use ($ptkId) {
                    $sub->selectRaw('1')
                        ->from('departemen as d')
                        ->whereColumn('d.id', 'a.last_id_departemen')
                        ->where('d.ptk_id', $ptkId);
                })->orWhereExists(function ($sub) use ($ptkId, $tahun) {
                    $sub->selectRaw('1')
                        ->from('pagu_ksro as pk')
                        ->join('pagu_jenis_belanja as pjb', function ($join) {
                            $join->on('pjb.id', '=', 'pk.pagu_jenis_belanja_id')->whereNull('pjb.deleted_at');
                        })
                        ->join('pagu_kelompok_belanja as pkb', function ($join) {
                            $join->on('pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')->whereNull('pkb.deleted_at');
                        })
                        ->join('pagu as p', function ($join) use ($tahun) {
                            $join->on('p.id', '=', 'pkb.pagu_id')
                                ->where('p.tahun', $tahun)
                                ->whereNull('p.deleted_at');
                        })
                        ->whereColumn('pk.ksro_id', 'a.ksro_id')
                        ->whereNull('pk.deleted_at')
                        ->where('p.ptk_id', $ptkId);
                });
            });
        }

        if (! empty($filters['jenis_belanja_id'])) {
            $jenisId = (int) $filters['jenis_belanja_id'];
            $query->whereExists(function ($sub) use ($jenisId, $tahun) {
                $sub->selectRaw('1')
                    ->from('pagu_ksro as pk')
                    ->join('pagu_jenis_belanja as pjb', function ($join) use ($jenisId) {
                        $join->on('pjb.id', '=', 'pk.pagu_jenis_belanja_id')
                            ->whereNull('pjb.deleted_at')
                            ->where('pjb.jenis_belanja_id', $jenisId);
                    })
                    ->join('pagu_kelompok_belanja as pkb', function ($join) {
                        $join->on('pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')->whereNull('pkb.deleted_at');
                    })
                    ->join('pagu as p', function ($join) use ($tahun) {
                        $join->on('p.id', '=', 'pkb.pagu_id')
                            ->where('p.tahun', $tahun)
                            ->whereNull('p.deleted_at');
                    })
                    ->whereColumn('pk.ksro_id', 'a.ksro_id')
                    ->whereNull('pk.deleted_at');
            });
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('a.no_aju', 'like', $like)
                    ->orWhere('a.nama_aju', 'like', $like)
                    ->orWhere('a.catatan', 'like', $like);
            });
        }

        $tahapFilter = trim((string) ($filters['status'] ?? ''));
        $useTahapFilter = $tahapFilter !== '' && ! isset(self::LEGACY_STATUS_TO_DB[$tahapFilter]);

        $baseQuery = clone $query;

        $rows = $query
            ->select([
                'a.id',
                'a.no_aju',
                'a.tgl',
                'a.total',
                'a.status',
                'a.nama_aju',
                'a.catatan',
                'a.ksro_id',
                'a.last_id_departemen',
                'a.created_by',
            ])
            ->orderByDesc('a.tgl')
            ->orderByDesc('a.id')
            ->limit($useTahapFilter ? 3000 : 5000)
            ->get();

        $mappedAll = $this->mapAjuRows($rows, $tahun);

        if ($useTahapFilter) {
            $mappedAll = $mappedAll->filter(
                fn (array $row) => $row['tahap_proses'] === $tahapFilter
            )->values();
        }

        $summary = $this->buildSummaryFromRows(
            $useTahapFilter
                ? $this->mapAjuRows((clone $baseQuery)->select([
                    'a.id', 'a.no_aju', 'a.tgl', 'a.total', 'a.status', 'a.nama_aju',
                    'a.catatan', 'a.ksro_id', 'a.last_id_departemen', 'a.created_by',
                ])->orderByDesc('a.tgl')->orderByDesc('a.id')->limit(3000)->get(), $tahun)
                : $mappedAll
        );

        $total = $mappedAll->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);
        $mappedRows = $mappedAll->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            'rows' => $mappedRows,
            'summary' => $summary,
            'meta' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total === 0 ? 0 : (($page - 1) * $perPage) + 1,
                'to' => min($page * $perPage, $total),
            ],
        ];
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   ksro_id: int,
     *   nama_aju: string,
     *   catatan?: string,
     *   total?: float,
     *   created_by: string
     * }  $data
     * @return array<string, mixed>
     */
    public function store(array $data): array
    {
        $year = BudgetYear::query()->findOrFail($data['budget_year_id']);
        $tahun = (string) $year->tahun;
        $actor = (string) $data['created_by'];
        $scope = $this->resolveUserScope($actor);

        if ($scope === null || empty($scope['departemen_id'])) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'departemen' => ['Departemen aktif pengguna tidak ditemukan.'],
            ]);
        }

        $ksro = DB::connection(RsudConnections::FINANCE)
            ->table('ksro')
            ->where('id', (int) $data['ksro_id'])
            ->whereNull('deleted_at')
            ->first(['id', 'kode_ksro', 'nama_ksro']);

        if (! $ksro) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'ksro_id' => ['Kode rekening (KSRO) tidak ditemukan.'],
            ]);
        }

        $prefix = $this->ksroNoAjuPrefix((string) $ksro->kode_ksro);
        if ($prefix === null) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'ksro_id' => ['Format kode KSRO tidak dapat digunakan untuk nomor pengajuan.'],
            ]);
        }

        $noAju = $this->buildNoAju($prefix, $tahun);
        $now = now();
        $total = (float) ($data['total'] ?? 0);
        $namaAju = trim((string) $data['nama_aju']);
        $catatan = trim((string) ($data['catatan'] ?? ''));

        DB::connection(RsudConnections::FINANCE)->table('aju')->insert([
            'no_aju' => $noAju,
            'tahun' => $tahun,
            'tgl' => $now->toDateString(),
            'ksro_id' => (int) $ksro->id,
            'nama_aju' => $namaAju,
            'catatan' => $catatan !== '' ? $catatan : null,
            'total' => $total,
            'status' => 'DRAFT',
            'created_at' => $now,
            'created_by' => $actor,
            'updated_at' => $now,
            'updated_by' => $actor,
            'last_id_departemen' => (int) $scope['departemen_id'],
        ]);

        DB::connection(RsudConnections::FINANCE)->table('aju_status')->insert([
            'last_id_departemen' => (int) $scope['departemen_id'],
            'no_aju' => $noAju,
            'no_absen' => $scope['no_absen'],
            'flow_name' => '',
            'flow_type' => 'draft',
            'flow_order' => null,
            'jabatan' => (string) ($scope['departemen_nama'] ?? ''),
            'status' => 'DRAFT',
            'catatan' => null,
            'created_at' => $now,
            'created_by' => $actor,
            'updated_at' => $now,
        ]);

        $row = DB::connection(RsudConnections::FINANCE)
            ->table('aju')
            ->where('no_aju', $noAju)
            ->first();

        $mapped = $this->mapAjuRows(collect([$row]), $tahun)->first();

        return $mapped ?? [];
    }

    /**
     * @param  array{budget_year_id: int, created_by?: string}  $filters
     * @return array<string, mixed>
     */
    public function progressDashboard(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;

        $query = DB::connection(RsudConnections::FINANCE)
            ->table('aju as a')
            ->whereNull('a.deleted_at')
            ->where('a.tahun', $tahun);

        if (! empty($filters['created_by'])) {
            $query->whereIn('a.created_by', $this->createdByCandidates((string) $filters['created_by']));
        }

        $ajuRows = $query->get([
            'a.id', 'a.no_aju', 'a.status', 'a.ksro_id', 'a.last_id_departemen',
        ]);

        $noAjuList = $ajuRows->pluck('no_aju')->map(fn ($v) => (string) $v)->unique()->values()->all();
        $latestStatusMap = $this->latestFullStatusMap($noAjuList);
        $workflowByFlow = $this->workflowStepsByFlow();
        $deptMap = $this->allDepartemenMap();
        $ksroFlowMap = $this->ksroFlowNameMap(
            $ajuRows->pluck('ksro_id')->map(fn ($id) => (int) $id)->unique()->values()->all()
        );

        $flowNames = [];
        foreach ($ajuRows as $aju) {
            $noAju = (string) $aju->no_aju;
            $latest = $latestStatusMap[$noAju] ?? null;
            $flowName = $latest?->flow_name ?? ($ksroFlowMap[(int) $aju->ksro_id] ?? null);
            if ($flowName) {
                $flowNames[$flowName] = true;
            }
        }

        $kpi = ['proses' => 0, 'reject' => 0, 'close' => 0];
        /** @var array<int, array<string, mixed>> $stepBuckets */
        $stepBuckets = $this->buildWorkflowStepTemplate(array_keys($flowNames), $workflowByFlow, $deptMap);

        foreach ($ajuRows as $aju) {
            $status = strtoupper((string) $aju->status);
            if ($status === 'CLOSE') {
                $kpi['close']++;
                continue;
            }
            if ($status === 'REJECT') {
                $kpi['reject']++;
                continue;
            }
            if ($status === 'BATAL') {
                continue;
            }

            $kpi['proses']++;
            $noAju = (string) $aju->no_aju;
            $latest = $latestStatusMap[$noAju] ?? null;
            $flowName = $latest?->flow_name ?? ($ksroFlowMap[(int) $aju->ksro_id] ?? null);
            $position = $this->resolveAjuWorkflowPosition($aju, $latest, $flowName, $workflowByFlow, $deptMap);

            if ($position === null) {
                continue;
            }

            $stepOrder = (int) $position['step_order'];
            if (! isset($stepBuckets[$stepOrder])) {
                $stepBuckets[$stepOrder] = [
                    'step_order' => $stepOrder,
                    'title' => $position['title'],
                    'subtitle' => $position['subtitle'],
                    'total_aju' => 0,
                    'holders' => [],
                ];
            }

            $stepBuckets[$stepOrder]['total_aju']++;
            $holderKey = (string) ($position['holder_dept_id'] ?? 0).'|'.$position['holder_label'];
            if (! isset($stepBuckets[$stepOrder]['holders'][$holderKey])) {
                $stepBuckets[$stepOrder]['holders'][$holderKey] = [
                    'departemen_id' => $position['holder_dept_id'],
                    'jabatan' => $position['holder_label'],
                    'count' => 0,
                ];
            }
            $stepBuckets[$stepOrder]['holders'][$holderKey]['count']++;
        }

        $steps = collect($stepBuckets)
            ->sortKeys()
            ->values()
            ->map(function (array $step) {
                $holders = collect($step['holders'])
                    ->sortByDesc('count')
                    ->values()
                    ->map(fn (array $h) => [
                        'departemen_id' => $h['departemen_id'],
                        'jabatan' => $h['jabatan'],
                        'count' => $h['count'],
                    ])
                    ->all();

                return [
                    'step_order' => $step['step_order'],
                    'step_no' => str_pad((string) $step['step_order'], 2, '0', STR_PAD_LEFT),
                    'title' => $step['title'],
                    'subtitle' => $step['subtitle'],
                    'total_aju' => $step['total_aju'],
                    'holders' => $holders,
                ];
            })
            ->all();

        return [
            'tahun' => $tahun,
            'kpi' => $kpi,
            'steps' => $steps,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function show(int $id, string $createdBy): array
    {
        $row = DB::connection(RsudConnections::FINANCE)
            ->table('aju as a')
            ->where('a.id', $id)
            ->whereNull('a.deleted_at')
            ->whereIn('a.created_by', $this->createdByCandidates($createdBy))
            ->first([
                'a.id',
                'a.no_aju',
                'a.tahun',
                'a.tgl',
                'a.tgl_selesai',
                'a.ksro_id',
                'a.nama_aju',
                'a.catatan',
                'a.catatan_batal',
                'a.total',
                'a.status',
                'a.file_kap',
                'a.last_id_departemen',
                'a.created_by',
                'a.created_at',
                'a.updated_by',
                'a.updated_at',
            ]);

        if (! $row) {
            throw \Illuminate\Database\Eloquent\ModelNotFoundException::forClass('aju');
        }

        $tahun = (string) $row->tahun;
        $noAju = (string) $row->no_aju;
        $ajuId = (int) $row->id;
        $ksroId = (int) $row->ksro_id;

        $summary = $this->mapAjuRows(collect([$row]), $tahun)->first() ?? [];

        $ksro = DB::connection(RsudConnections::FINANCE)
            ->table('ksro')
            ->where('id', $ksroId)
            ->whereNull('deleted_at')
            ->first(['kode_ksro', 'nama_ksro']);

        $budgetYear = BudgetYear::query()->where('tahun', $tahun)->first();

        $detailRows = DB::connection(RsudConnections::FINANCE)
            ->table('aju_detail as d')
            ->leftJoin('satuan as s', 's.id', '=', 'd.satuan_id')
            ->leftJoin('rba as r', 'r.id', '=', 'd.rba_id')
            ->where('d.aju_id', $ajuId)
            ->orderBy('d.id')
            ->get([
                'd.id',
                'd.rba_id',
                'd.nama_komponen',
                'd.jenis',
                'd.spesifikasi',
                'd.volume',
                'd.volume_nego',
                'd.satuan_id',
                's.nama_satuan',
                'd.harga_satuan',
                'd.subtotal',
                'd.ppn',
                'd.total',
                'd.merk',
                'd.tipe',
                'r.nama_komponen as rba_nama_komponen',
            ]);

        $rincian = $detailRows->map(function ($detail) {
            $subtotal = (float) $detail->subtotal;
            $subtotalLainnya = 0.0;

            return [
                'id' => (int) $detail->id,
                'rba_id' => (int) $detail->rba_id,
                'nama_komponen' => (string) $detail->nama_komponen,
                'rba_nama_komponen' => $detail->rba_nama_komponen ? (string) $detail->rba_nama_komponen : null,
                'jenis' => (string) $detail->jenis,
                'spesifikasi' => (string) $detail->spesifikasi,
                'volume' => (int) $detail->volume,
                'volume_nego' => $detail->volume_nego !== null ? (int) $detail->volume_nego : null,
                'satuan' => $detail->nama_satuan ? (string) $detail->nama_satuan : '—',
                'harga_satuan' => (float) $detail->harga_satuan,
                'sub_total' => $subtotal + $subtotalLainnya,
                'pajak' => (float) $detail->ppn,
                'total' => (float) $detail->total,
                'merk' => $detail->merk ? (string) $detail->merk : null,
                'tipe' => $detail->tipe ? (string) $detail->tipe : null,
            ];
        })->values()->all();

        $detailTotals = $this->ajuDetailTotalsMap([$ajuId]);
        $totals = $detailTotals[$ajuId] ?? [
            'sub_total' => (float) $row->total,
            'pajak' => 0.0,
            'total' => (float) $row->total,
        ];

        $approvalRows = DB::connection(RsudConnections::FINANCE)
            ->table('aju_status')
            ->where('no_aju', $noAju)
            ->orderByRaw('CASE WHEN flow_order IS NULL THEN 1 ELSE 0 END')
            ->orderBy('flow_order')
            ->orderBy('id')
            ->get([
                'id',
                'flow_name',
                'flow_type',
                'flow_order',
                'jabatan',
                'status',
                'catatan',
                'no_absen',
                'created_at',
                'created_by',
            ]);

        $actorMap = $this->creatorNameMap(
            $approvalRows
                ->flatMap(fn ($item) => [$item->no_absen, $item->created_by])
                ->filter()
                ->map(fn ($v) => (string) $v)
                ->unique()
                ->values()
                ->all()
        );

        $approvalHistory = $approvalRows->map(function ($item) use ($actorMap) {
            $noAbsen = (string) ($item->no_absen ?? '');
            $createdBy = (string) ($item->created_by ?? '');

            return [
                'id' => (int) $item->id,
                'flow_name' => (string) $item->flow_name,
                'flow_type' => (string) $item->flow_type,
                'flow_order' => $item->flow_order !== null ? (int) $item->flow_order : null,
                'jabatan' => $item->jabatan ? (string) $item->jabatan : null,
                'status' => (string) $item->status,
                'status_label' => $this->approvalStatusLabel((string) $item->status, (string) $item->flow_type),
                'catatan' => $item->catatan ? (string) $item->catatan : null,
                'no_absen' => $noAbsen,
                'actor_name' => (string) ($actorMap[$noAbsen] ?? $actorMap[$createdBy] ?? $noAbsen ?: $createdBy),
                'occurred_at' => $item->created_at ? (string) $item->created_at : null,
            ];
        })->values()->all();

        $creatorMap = $this->creatorNameMap([(string) $row->created_by, (string) ($row->updated_by ?? '')]);

        return [
            ...$summary,
            'budget_year_id' => $budgetYear?->id,
            'tahun' => $tahun,
            'tgl_selesai' => $row->tgl_selesai ? (string) $row->tgl_selesai : null,
            'catatan' => (string) ($row->catatan ?? ''),
            'catatan_batal' => $row->catatan_batal ? (string) $row->catatan_batal : null,
            'file_kap' => $row->file_kap ? (string) $row->file_kap : null,
            'ksro_kode' => $ksro ? (string) $ksro->kode_ksro : null,
            'ksro_nama' => $ksro ? (string) $ksro->nama_ksro : null,
            'created_at' => $row->created_at ? (string) $row->created_at : null,
            'updated_at' => $row->updated_at ? (string) $row->updated_at : null,
            'updated_by' => (string) ($row->updated_by ?? ''),
            'updated_by_name' => (string) ($creatorMap[(string) ($row->updated_by ?? '')] ?? $row->updated_by ?? ''),
            'sub_total' => $totals['sub_total'],
            'pajak' => $totals['pajak'],
            'total' => $totals['total'],
            'rincian' => $rincian,
            'approval_history' => $approvalHistory,
        ];
    }

    private function approvalStatusLabel(string $status, string $flowType): string
    {
        $key = strtoupper($status !== '' ? $status : $flowType);

        return match ($key) {
            'DRAFT' => 'Draft',
            'SUBMIT', 'SUBMITTED' => 'Diajukan',
            'APPROVED', 'VALIDATED' => 'Disetujui',
            'REJECT', 'REJECTED' => 'Ditolak',
            'BATAL', 'CANCELED', 'CANCELLED' => 'Dibatalkan',
            'CLOSE', 'CLOSED' => 'Selesai',
            default => $key,
        };
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function mapAjuRows(Collection $rows, string $tahun): Collection
    {
        if ($rows->isEmpty()) {
            return collect();
        }

        $noAjuList = $rows->pluck('no_aju')->map(fn ($v) => (string) $v)->unique()->values()->all();
        $creatorMap = $this->creatorNameMap(
            $rows->pluck('created_by')->filter()->map(fn ($v) => (string) $v)->unique()->values()->all()
        );
        $ajuIds = $rows->pluck('id')->map(fn ($id) => (int) $id)->unique()->values()->all();
        $ksroIds = $rows->pluck('ksro_id')->map(fn ($id) => (int) $id)->unique()->values()->all();
        $departemenIds = $rows->pluck('last_id_departemen')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();

        $departemenMap = $this->departemenMap($departemenIds);
        $jenisMap = $this->jenisBelanjaMap($tahun, $ksroIds);
        $detailTotalsMap = $this->ajuDetailTotalsMap($ajuIds);
        $negoMap = $this->negoMap($noAjuList);
        $sppdMap = $this->sppdMap($noAjuList);
        $sppuMap = $this->sppuMap($noAjuList);
        $ajuFlowMap = $this->latestAjuFlowMap($noAjuList);

        return $rows->map(function ($row) use (
            $departemenMap,
            $jenisMap,
            $detailTotalsMap,
            $creatorMap,
            $negoMap,
            $sppdMap,
            $sppuMap,
            $ajuFlowMap
        ) {
            $ajuId = (int) $row->id;
            $ksroId = (int) $row->ksro_id;
            $noAju = (string) $row->no_aju;
            $headerTotal = (float) $row->total;
            $detailTotals = $detailTotalsMap[$ajuId] ?? null;
            $subTotal = (float) ($detailTotals['sub_total'] ?? ($headerTotal > 0 ? $headerTotal : 0));
            $pajak = (float) ($detailTotals['pajak'] ?? 0);
            $total = (float) ($detailTotals['total'] ?? $headerTotal);
            $departemenId = $row->last_id_departemen ? (int) $row->last_id_departemen : null;
            $departemen = $departemenId ? ($departemenMap[$departemenId] ?? null) : null;
            $jenis = $jenisMap[$ksroId] ?? null;
            $createdBy = (string) ($row->created_by ?? '');
            $nego = $negoMap[$noAju] ?? null;
            $sppd = $sppdMap[$noAju] ?? null;
            $sppu = $sppuMap[$noAju] ?? null;

            $workflow = $this->workflowResolver->resolve([
                'aju_status' => (string) $row->status,
                'latest_aju_flow_status' => $ajuFlowMap[$noAju] ?? null,
                'nego_status' => $nego['status'] ?? null,
                'sppd_status' => $sppd['status'] ?? null,
                'sppu_status' => $sppu['status'] ?? null,
                'sppu_status_bayar' => $sppu['status_bayar'] ?? null,
                'sppu_tgl_bayar' => $sppu['tgl_bayar'] ?? null,
            ]);

            return [
                'id' => (int) $row->id,
                'no_pengajuan' => $noAju,
                'tanggal' => $row->tgl ? (string) $row->tgl : null,
                'unit' => (string) ($departemen['nama'] ?? $jenis['nama_satuan_ptk'] ?? '—'),
                'ptk_id' => $departemen['ptk_id'] ?? $jenis['ptk_id'] ?? null,
                'jenis_belanja' => (string) ($jenis['kode_jenis_belanja'] ?? '—'),
                'jenis_belanja_id' => $jenis['jenis_belanja_id'] ?? null,
                'uraian' => trim((string) ($row->nama_aju ?: $row->catatan ?: '')),
                'sub_total' => $subTotal,
                'pajak' => $pajak,
                'total' => $total,
                'status' => $workflow['tahap_proses'],
                'status_label' => $workflow['tahap_label'],
                'status_db' => (string) $row->status,
                'tahap_proses' => $workflow['tahap_proses'],
                'tahap_label' => $workflow['tahap_label'],
                'tracking' => $workflow['tracking'],
                'no_nego' => $nego['no_nego'] ?? null,
                'no_sppd' => $sppd['no_sppd'] ?? null,
                'no_sppu' => $sppu['no_sppu'] ?? null,
                'ksro_id' => $ksroId,
                'created_by' => $createdBy,
                'created_by_name' => (string) ($creatorMap[$createdBy] ?? $createdBy),
            ];
        })->values();
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @return array<string, mixed>
     */
    private function buildSummaryFromRows(Collection $rows): array
    {
        $menungguPersetujuan = $rows->whereIn('tahap_proses', ['draft', 'diajukan', 'menunggu-persetujuan'])->count();
        $menungguPembayaran = $rows->whereIn('tahap_proses', ['rencana-bayar', 'verifikasi-berkas'])->count();

        return [
            'total_pengajuan' => $rows->count(),
            'menunggu_persetujuan' => $menungguPersetujuan,
            'menunggu_pembayaran' => $menungguPembayaran,
            'total_nilai' => (float) $rows->sum('total'),
        ];
    }

    /**
     * @param  list<int>  $ajuIds
     * @return array<int, array{sub_total: float, pajak: float, total: float}>
     */
    private function ajuDetailTotalsMap(array $ajuIds): array
    {
        if ($ajuIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('aju_detail')
            ->whereIn('aju_id', $ajuIds)
            ->selectRaw('
                aju_id,
                SUM(CAST(subtotal AS FLOAT) + COALESCE(CAST(subtotal_lainnya AS FLOAT), 0)) as sub_total,
                SUM(CAST(ppn AS FLOAT)) as pajak,
                SUM(CAST(total AS FLOAT)) as total
            ')
            ->groupBy('aju_id')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->aju_id] = [
                'sub_total' => (float) $row->sub_total,
                'pajak' => (float) $row->pajak,
                'total' => (float) $row->total,
            ];
        }

        return $map;
    }

    /**
     * @param  list<int>  $departemenIds
     * @return array<int, array{nama: string, ptk_id: int|null}>
     */
    private function departemenMap(array $departemenIds): array
    {
        if ($departemenIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('departemen')
            ->whereIn('id', $departemenIds)
            ->whereNull('deleted_at')
            ->get(['id', 'nama', 'ptk_id']);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->id] = [
                'nama' => (string) $row->nama,
                'ptk_id' => $row->ptk_id !== null ? (int) $row->ptk_id : null,
            ];
        }

        return $map;
    }

    /**
     * @param  list<int>  $ksroIds
     * @return array<int, array{kode_jenis_belanja: string, jenis_belanja_id: int, nama_satuan_ptk: string, ptk_id: int}>
     */
    private function jenisBelanjaMap(string $tahun, array $ksroIds): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('pagu_jenis_belanja as pjb', function ($join) {
                $join->on('pjb.id', '=', 'pk.pagu_jenis_belanja_id')->whereNull('pjb.deleted_at');
            })
            ->join('jenis_belanja as jb', 'jb.id', '=', 'pjb.jenis_belanja_id')
            ->join('pagu_kelompok_belanja as pkb', function ($join) {
                $join->on('pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')->whereNull('pkb.deleted_at');
            })
            ->join('pagu as p', function ($join) use ($tahun) {
                $join->on('p.id', '=', 'pkb.pagu_id')
                    ->where('p.tahun', $tahun)
                    ->whereNull('p.deleted_at');
            })
            ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
            ->whereNull('pk.deleted_at')
            ->whereIn('pk.ksro_id', $ksroIds)
            ->select([
                'pk.ksro_id',
                'jb.id as jenis_belanja_id',
                'jb.kode_jenis_belanja',
                'pt.nama_satuan_ptk',
                'p.ptk_id',
            ])
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $ksroId = (int) $row->ksro_id;
            if (isset($map[$ksroId])) {
                continue;
            }
            $map[$ksroId] = [
                'jenis_belanja_id' => (int) $row->jenis_belanja_id,
                'kode_jenis_belanja' => (string) $row->kode_jenis_belanja,
                'nama_satuan_ptk' => (string) $row->nama_satuan_ptk,
                'ptk_id' => (int) $row->ptk_id,
            ];
        }

        return $map;
    }

    /**
     * @param  list<int>  $ksroIds
     * @return array<int, float>
     */
    private function sisaPaguMap(string $tahun, array $ksroIds): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $paguRows = DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('pagu_jenis_belanja as pjb', function ($join) {
                $join->on('pjb.id', '=', 'pk.pagu_jenis_belanja_id')->whereNull('pjb.deleted_at');
            })
            ->join('pagu_kelompok_belanja as pkb', function ($join) {
                $join->on('pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')->whereNull('pkb.deleted_at');
            })
            ->join('pagu as p', function ($join) use ($tahun) {
                $join->on('p.id', '=', 'pkb.pagu_id')
                    ->where('p.tahun', $tahun)
                    ->whereNull('p.deleted_at');
            })
            ->whereNull('pk.deleted_at')
            ->whereIn('pk.ksro_id', $ksroIds)
            ->selectRaw('pk.ksro_id, SUM(CAST(pk.total_pagu AS FLOAT)) as pagu_total')
            ->groupBy('pk.ksro_id')
            ->get();

        $paguMap = [];
        foreach ($paguRows as $row) {
            $paguMap[(int) $row->ksro_id] = (float) $row->pagu_total;
        }

        $realisasiMap = $this->ajuAmountMap($tahun, $ksroIds, ['CLOSE']);
        $komitmenMap = $this->ajuAmountMap($tahun, $ksroIds, ['DRAFT']);
        $menungguMap = $this->ajuAmountMap($tahun, $ksroIds, ['APPROVED']);
        $terblokirMap = $this->terblokirMap($tahun, $ksroIds);

        $map = [];
        foreach ($ksroIds as $ksroId) {
            $pagu = (float) ($paguMap[$ksroId] ?? 0);
            $realisasi = (float) ($realisasiMap[$ksroId] ?? 0);
            $komitmen = (float) ($komitmenMap[$ksroId] ?? 0);
            $menunggu = (float) ($menungguMap[$ksroId] ?? 0);
            $terblokir = (float) ($terblokirMap[$ksroId] ?? 0);
            $map[$ksroId] = max(0, $pagu - $realisasi - $komitmen - $menunggu - $terblokir);
        }

        return $map;
    }

    /**
     * @param  list<int>  $ksroIds
     * @param  list<string>  $statuses
     * @return array<int, float>
     */
    private function ajuAmountMap(string $tahun, array $ksroIds, array $statuses): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('aju')
            ->whereNull('deleted_at')
            ->where('tahun', $tahun)
            ->whereIn('ksro_id', $ksroIds)
            ->whereIn('status', $statuses)
            ->selectRaw('ksro_id, SUM(CAST(total AS FLOAT)) as jumlah')
            ->groupBy('ksro_id')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id] = (float) $row->jumlah;
        }

        return $map;
    }

    /**
     * @param  list<int>  $ksroIds
     * @return array<int, float>
     */
    private function terblokirMap(string $tahun, array $ksroIds): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('rba as r')
            ->leftJoinSub(
                DB::connection(RsudConnections::FINANCE)
                    ->table('rba_block_histori as rbh')
                    ->joinSub(
                        DB::connection(RsudConnections::FINANCE)
                            ->table('rba_block_histori')
                            ->selectRaw('rba_id, MAX(id) as max_id')
                            ->groupBy('rba_id'),
                        'latest_ids',
                        'latest_ids.max_id',
                        '=',
                        'rbh.id'
                    )
                    ->select(['rbh.rba_id', 'rbh.block_type', 'rbh.block_volume']),
                'blk',
                'blk.rba_id',
                '=',
                'r.id'
            )
            ->where('r.tahun', $tahun)
            ->whereNull('r.deleted_at')
            ->whereIn('r.ksro_id', $ksroIds)
            ->selectRaw("
                r.ksro_id,
                SUM(CASE
                    WHEN blk.block_type = 'T' THEN COALESCE(r.total, 0)
                    WHEN blk.block_type = 'P' THEN COALESCE(blk.block_volume, 0) * COALESCE(r.harga_satuan, 0)
                    ELSE 0
                END) as terblokir
            ")
            ->groupBy('r.ksro_id')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id] = (float) $row->terblokir;
        }

        return $map;
    }

    /**
     * @param  list<string>  $noAjuList
     * @return array<string, array{no_nego: string, status: string}>
     */
    private function negoMap(array $noAjuList): array
    {
        if ($noAjuList === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('nego_harga')
            ->whereNull('deleted_at')
            ->whereIn('no_aju', $noAjuList)
            ->orderByDesc('id')
            ->get(['no_aju', 'no_nego', 'status']);

        $map = [];
        foreach ($rows as $row) {
            $key = (string) $row->no_aju;
            if (! isset($map[$key])) {
                $map[$key] = [
                    'no_nego' => (string) $row->no_nego,
                    'status' => (string) $row->status,
                ];
            }
        }

        return $map;
    }

    /**
     * @param  list<string>  $noAjuList
     * @return array<string, array{no_sppd: string, status: string}>
     */
    private function sppdMap(array $noAjuList): array
    {
        if ($noAjuList === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('sppd')
            ->whereNull('deleted_at')
            ->whereIn('no_aju', $noAjuList)
            ->orderByDesc('id')
            ->get(['no_aju', 'no_sppd', 'status']);

        $map = [];
        foreach ($rows as $row) {
            $key = (string) $row->no_aju;
            if (! isset($map[$key])) {
                $map[$key] = [
                    'no_sppd' => (string) $row->no_sppd,
                    'status' => (string) $row->status,
                ];
            }
        }

        return $map;
    }

    /**
     * @param  list<string>  $noAjuList
     * @return array<string, array{no_sppu: string, status: string, status_bayar: string|null, tgl_bayar: string|null}>
     */
    private function sppuMap(array $noAjuList): array
    {
        if ($noAjuList === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('sppu')
            ->whereNull('deleted_at')
            ->whereIn('no_aju', $noAjuList)
            ->orderByDesc('id')
            ->get(['no_aju', 'no_sppu', 'status', 'status_bayar', 'tgl_bayar']);

        $map = [];
        foreach ($rows as $row) {
            $key = (string) $row->no_aju;
            if (! isset($map[$key])) {
                $map[$key] = [
                    'no_sppu' => (string) $row->no_sppu,
                    'status' => (string) $row->status,
                    'status_bayar' => $row->status_bayar !== null ? (string) $row->status_bayar : null,
                    'tgl_bayar' => $row->tgl_bayar !== null ? (string) $row->tgl_bayar : null,
                ];
            }
        }

        return $map;
    }

    /**
     * @param  list<string>  $noAjuList
     * @return array<string, string>
     */
    private function latestAjuFlowMap(array $noAjuList): array
    {
        if ($noAjuList === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('aju_status')
            ->whereIn('no_aju', $noAjuList)
            ->orderByDesc('flow_order')
            ->orderByDesc('id')
            ->get(['no_aju', 'status', 'flow_order']);

        $map = [];
        foreach ($rows as $row) {
            $key = (string) $row->no_aju;
            if (! isset($map[$key])) {
                $map[$key] = (string) $row->status;
            }
        }

        return $map;
    }

    /**
     * @param  array{departemen_id?: int|null, ptk_id?: int|null}  $scope
     * @return list<array{ksro_id: int, kode_ksro: string, nama_ksro: string, label: string}>
     */
    private function ksroOptionsForScope(string $tahun, array $scope): array
    {
        $ptkId = (int) ($scope['ptk_id'] ?? 0);
        if ($ptkId <= 0) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('ksro as k', 'k.id', '=', 'pk.ksro_id')
            ->join('pagu_jenis_belanja as pjb', function ($join) {
                $join->on('pjb.id', '=', 'pk.pagu_jenis_belanja_id')->whereNull('pjb.deleted_at');
            })
            ->join('pagu_kelompok_belanja as pkb', function ($join) {
                $join->on('pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')->whereNull('pkb.deleted_at');
            })
            ->join('pagu as p', function ($join) use ($tahun, $ptkId) {
                $join->on('p.id', '=', 'pkb.pagu_id')
                    ->where('p.tahun', $tahun)
                    ->whereNull('p.deleted_at')
                    ->where('p.ptk_id', $ptkId);
            })
            ->whereNull('pk.deleted_at')
            ->whereNull('k.deleted_at')
            ->select(['k.id as ksro_id', 'k.kode_ksro', 'k.nama_ksro'])
            ->distinct()
            ->orderBy('k.kode_ksro')
            ->limit(200)
            ->get();

        return $rows->map(fn ($row) => [
            'ksro_id' => (int) $row->ksro_id,
            'kode_ksro' => (string) $row->kode_ksro,
            'nama_ksro' => (string) $row->nama_ksro,
            'label' => (string) $row->kode_ksro.' — '.(string) $row->nama_ksro,
        ])->values()->all();
    }

    private function ksroNoAjuPrefix(string $kodeKsro): ?string
    {
        if (preg_match('/-OPE-(?:BJS|PEG|MOD)-([A-Z0-9]+-\d+)$/i', $kodeKsro, $matches)) {
            return strtoupper($matches[1]);
        }

        $parts = explode('-', $kodeKsro);
        if (count($parts) >= 2) {
            return strtoupper($parts[count($parts) - 2].'-'.$parts[count($parts) - 1]);
        }

        return null;
    }

    private function buildNoAju(string $prefix, string $tahun): string
    {
        $like = 'AJU-'.$prefix.'-'.$tahun.'-%';
        $last = DB::connection(RsudConnections::FINANCE)
            ->table('aju')
            ->where('no_aju', 'like', $like)
            ->orderByDesc('no_aju')
            ->value('no_aju');

        $seq = 1;
        if ($last && preg_match('/-(\d+)$/', (string) $last, $matches)) {
            $seq = ((int) $matches[1]) + 1;
        }

        return sprintf('AJU-%s-%s-%05d', $prefix, $tahun, $seq);
    }

    /**
     * @param  list<string>  $noAjuList
     * @return array<string, object>
     */
    private function latestFullStatusMap(array $noAjuList): array
    {
        if ($noAjuList === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('aju_status')
            ->whereIn('no_aju', $noAjuList)
            ->orderByDesc('flow_order')
            ->orderByDesc('id')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $key = (string) $row->no_aju;
            if (! isset($map[$key])) {
                $map[$key] = $row;
            }
        }

        return $map;
    }

    /**
     * @return array<string, list<object>>
     */
    private function workflowStepsByFlow(): array
    {
        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('workflow_aju')
            ->where('flow_type', '!=', 'reject')
            ->orderBy('flow_name')
            ->orderBy('flow_order')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(string) $row->flow_name][] = $row;
        }

        return $map;
    }

    /**
     * @return array<int, array{nama: string}>
     */
    private function allDepartemenMap(): array
    {
        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('departemen')
            ->whereNull('deleted_at')
            ->get(['id', 'nama']);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->id] = ['nama' => (string) $row->nama];
        }

        return $map;
    }

    /**
     * @param  list<int>  $ksroIds
     * @return array<int, string>
     */
    private function ksroFlowNameMap(array $ksroIds): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('ksro as k')
            ->join('workflow_aju_ksro as wk', 'wk.kode_ksro', '=', 'k.kode_ksro')
            ->whereIn('k.id', $ksroIds)
            ->whereNull('k.deleted_at')
            ->get(['k.id as ksro_id', 'wk.flow_name']);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id] = (string) $row->flow_name;
        }

        return $map;
    }

    /**
     * @param  list<string>  $flowNames
     * @param  array<string, list<object>>  $workflowByFlow
     * @param  array<int, array{nama: string}>  $deptMap
     * @return array<int, array<string, mixed>>
     */
    private function buildWorkflowStepTemplate(array $flowNames, array $workflowByFlow, array $deptMap): array
    {
        $steps = [
            0 => [
                'step_order' => 0,
                'title' => 'DRAFT',
                'subtitle' => 'Submit kebutuhan oleh PTK / Pelaksana',
                'total_aju' => 0,
                'holders' => [],
            ],
        ];

        $flowsToUse = $flowNames !== [] ? $flowNames : array_keys($workflowByFlow);

        foreach ($flowsToUse as $flowName) {
            foreach ($workflowByFlow[$flowName] ?? [] as $step) {
                $order = (int) $step->flow_order;
                if ($order <= 0 || isset($steps[$order])) {
                    continue;
                }

                $label = $this->workflowStepDisplayLabel($step, $deptMap);
                $steps[$order] = [
                    'step_order' => $order,
                    'title' => $label['title'],
                    'subtitle' => $label['subtitle'],
                    'total_aju' => 0,
                    'holders' => [],
                ];
            }
        }

        if (! isset($steps[90])) {
            $steps[90] = [
                'step_order' => 90,
                'title' => 'DISSETUJUI',
                'subtitle' => 'Menunggu proses berikutnya (nego / pesanan / pembayaran)',
                'total_aju' => 0,
                'holders' => [],
            ];
        }

        ksort($steps);

        return $steps;
    }

    /**
     * @param  array<int, array{nama: string}>  $deptMap
     * @return array{title: string, subtitle: string, holder_dept_id: ?int, holder_label: string}
     */
    private function workflowStepDisplayLabel(object $step, array $deptMap): array
    {
        $holderDeptId = (int) $step->from_dept_id;
        $holderLabel = $deptMap[$holderDeptId]['nama'] ?? '—';
        $flowType = strtolower((string) $step->flow_type);
        $statusName = strtoupper((string) $step->status_name);

        if ($flowType === 'submit') {
            return [
                'title' => 'SUBMIT PENGAJUAN BARANG / JASA',
                'subtitle' => 'Submit kebutuhan oleh PTK',
                'holder_dept_id' => $holderDeptId ?: null,
                'holder_label' => $holderLabel,
            ];
        }

        if ($flowType === 'approve') {
            return [
                'title' => 'PERSETUJUAN '.$holderLabel,
                'subtitle' => $holderLabel,
                'holder_dept_id' => $holderDeptId ?: null,
                'holder_label' => $holderLabel,
            ];
        }

        return [
            'title' => $statusName,
            'subtitle' => $holderLabel,
            'holder_dept_id' => $holderDeptId ?: null,
            'holder_label' => $holderLabel,
        ];
    }

    /**
     * @param  array<string, list<object>>  $workflowByFlow
     * @param  array<int, array{nama: string}>  $deptMap
     * @return array<string, mixed>|null
     */
    private function resolveAjuWorkflowPosition(
        object $aju,
        ?object $latestStatus,
        ?string $flowName,
        array $workflowByFlow,
        array $deptMap
    ): ?array {
        $ajuStatus = strtoupper((string) $aju->status);
        if (in_array($ajuStatus, ['CLOSE', 'REJECT', 'BATAL'], true)) {
            return null;
        }

        $flowSteps = $flowName ? ($workflowByFlow[$flowName] ?? []) : [];
        $latestStatusName = strtoupper((string) ($latestStatus->status ?? ''));

        if (! $latestStatus || $latestStatusName === 'DRAFT' || $ajuStatus === 'DRAFT') {
            $deptId = (int) ($aju->last_id_departemen ?? 0);
            $deptName = $deptMap[$deptId]['nama'] ?? 'Unit Pengaju';

            return [
                'step_order' => 0,
                'title' => 'DRAFT',
                'subtitle' => 'Submit kebutuhan oleh PTK / Pelaksana',
                'holder_dept_id' => $deptId ?: null,
                'holder_label' => $deptName,
            ];
        }

        $lastOrder = (int) ($latestStatus->flow_order ?? 0);
        $nextStep = null;
        foreach ($flowSteps as $step) {
            if ((int) $step->flow_order > $lastOrder) {
                $nextStep = $step;
                break;
            }
        }

        if ($nextStep === null) {
            $holderDeptId = (int) ($latestStatus->last_id_departemen ?? 0);
            $holderLabel = trim((string) ($latestStatus->jabatan ?? ''));
            if ($holderLabel === '') {
                $holderLabel = $deptMap[$holderDeptId]['nama'] ?? '—';
            }

            return [
                'step_order' => 90,
                'title' => 'DISSETUJUI',
                'subtitle' => 'Menunggu proses berikutnya (nego / pesanan / pembayaran)',
                'holder_dept_id' => $holderDeptId ?: null,
                'holder_label' => $holderLabel,
            ];
        }

        $label = $this->workflowStepDisplayLabel($nextStep, $deptMap);

        return [
            'step_order' => (int) $nextStep->flow_order,
            'title' => $label['title'],
            'subtitle' => $label['subtitle'],
            'holder_dept_id' => $label['holder_dept_id'],
            'holder_label' => $label['holder_label'],
        ];
    }

    /**
     * @return list<string>
     */
    private function createdByCandidates(string $noAbsen): array
    {
        $normalized = trim($noAbsen);
        if ($normalized === '') {
            return [];
        }

        $candidates = [$normalized];
        $trimmed = ltrim($normalized, '0');
        if ($trimmed !== '' && $trimmed !== $normalized) {
            $candidates[] = $trimmed;
        }
        if ($trimmed !== '') {
            $candidates[] = str_pad($trimmed, 4, '0', STR_PAD_LEFT);
        }

        return array_values(array_unique($candidates));
    }

    /**
     * @return array{no_absen: string, name: string}|null
     */
    private function resolveUserScope(string $noAbsen): ?array
    {
        $candidates = $this->createdByCandidates($noAbsen);
        if ($candidates === []) {
            return null;
        }

        $user = DB::connection(RsudConnections::USER_MANAJEMEN)
            ->table('users')
            ->whereIn('no_absen', $candidates)
            ->orderBy('id')
            ->first(['no_absen', 'name', 'active_dept_id']);

        if (! $user) {
            return [
                'no_absen' => $noAbsen,
                'name' => $noAbsen,
                'departemen_id' => null,
                'departemen_nama' => null,
                'ptk_id' => null,
            ];
        }

        $departemenId = $user->active_dept_id ? (int) $user->active_dept_id : null;
        $departemen = null;
        if ($departemenId) {
            $departemen = DB::connection(RsudConnections::FINANCE)
                ->table('departemen')
                ->where('id', $departemenId)
                ->whereNull('deleted_at')
                ->first(['id', 'nama', 'ptk_id']);
        }

        return [
            'no_absen' => (string) $user->no_absen,
            'name' => (string) $user->name,
            'departemen_id' => $departemenId,
            'departemen_nama' => $departemen ? (string) $departemen->nama : null,
            'ptk_id' => $departemen && $departemen->ptk_id ? (int) $departemen->ptk_id : null,
        ];
    }

    /**
     * @param  list<string>  $createdByValues
     * @return array<string, string>
     */
    private function creatorNameMap(array $createdByValues): array
    {
        if ($createdByValues === []) {
            return [];
        }

        $candidateByCreatedBy = [];
        $allCandidates = [];
        foreach ($createdByValues as $createdBy) {
            $candidates = $this->createdByCandidates($createdBy);
            $candidateByCreatedBy[$createdBy] = $candidates;
            array_push($allCandidates, ...$candidates);
        }
        $allCandidates = array_values(array_unique($allCandidates));

        $users = DB::connection(RsudConnections::USER_MANAJEMEN)
            ->table('users')
            ->whereIn('no_absen', $allCandidates)
            ->get(['no_absen', 'name']);

        $nameByNoAbsen = [];
        foreach ($users as $user) {
            $nameByNoAbsen[(string) $user->no_absen] = (string) $user->name;
        }

        $map = [];
        foreach ($candidateByCreatedBy as $createdBy => $candidates) {
            $name = $createdBy;
            foreach ($candidates as $candidate) {
                if (isset($nameByNoAbsen[$candidate])) {
                    $name = $nameByNoAbsen[$candidate];
                    break;
                }
            }
            $map[$createdBy] = $name;
        }

        return $map;
    }
}

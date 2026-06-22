<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Services\BudgetMonitoringPaguService;
use App\Modules\Finance\Services\CashBankDashboardService;
use App\Modules\Finance\Services\RevenueAnalysisService;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\Workflow\Models\ApprovalInstance;
use Illuminate\Support\Carbon;

class AiReadOnlyDataService
{
    /** @var array<string, array{permission: ?string, label: string, description: string, filters: array<string, string>}> */
    private const SOURCES = [
        'finance.cash_bank' => [
            'permission' => 'finance.reports.view',
            'label' => 'Kas & Bank',
            'description' => 'KPI kas/bank dari SIMARTDB: masuk, keluar, saldo netto, transaksi terbaru',
            'filters' => ['tahun' => 'int (wajib jika tidak pakai budget_year_id)', 'bulan' => 'int 1-12 opsional'],
        ],
        'finance.revenue' => [
            'permission' => 'finance.reports.view',
            'label' => 'Pendapatan',
            'description' => 'Target, rencana, dan realisasi pendapatan per kategori',
            'filters' => ['budget_year_id' => 'int opsional', 'bulan' => 'int 1-12 opsional', 'category_id' => 'string opsional'],
        ],
        'finance.budget_monitoring' => [
            'permission' => 'finance.reports.view',
            'label' => 'Monitoring Pagu',
            'description' => 'Pagu, realisasi, sisa pagu, dan serapan anggaran per KSRO/unit',
            'filters' => ['budget_year_id' => 'int opsional', 'bulan_from' => 'int opsional', 'bulan_to' => 'int opsional', 'view' => 'monitoring|per_akun|per_unit opsional'],
        ],
        'finance.budget_years' => [
            'permission' => 'finance.reports.view',
            'label' => 'Tahun Anggaran',
            'description' => 'Daftar tahun anggaran yang tersedia',
            'filters' => [],
        ],
        'hr.employees' => [
            'permission' => 'hr.employees.view',
            'label' => 'Data Karyawan',
            'description' => 'Ringkasan headcount dan daftar karyawan (read-only)',
            'filters' => ['employment_status' => 'string opsional', 'search' => 'string opsional'],
        ],
        'hr.leave_pending' => [
            'permission' => 'hr.employees.view',
            'label' => 'Cuti Pending',
            'description' => 'Pengajuan cuti yang masih menunggu',
            'filters' => [],
        ],
        'workflow.approvals' => [
            'permission' => 'workflow.approve',
            'label' => 'Approval',
            'description' => 'Dokumen approval yang masih submitted/in_review',
            'filters' => ['status' => 'submitted|in_review opsional'],
        ],
    ];

    public function __construct(
        private readonly CashBankDashboardService $cashBankDashboard,
        private readonly RevenueAnalysisService $revenueAnalysis,
        private readonly BudgetMonitoringPaguService $budgetMonitoring,
    ) {}

    /** @return list<array{key: string, label: string, description: string, filters: array<string, string>}> */
    public function listSources(User $user): array
    {
        $sources = [];
        foreach (self::SOURCES as $key => $config) {
            if ($config['permission'] && ! $user->hasPermission($config['permission'])) {
                continue;
            }
            $sources[] = [
                'key' => $key,
                'label' => $config['label'],
                'description' => $config['description'],
                'filters' => $config['filters'],
                'access' => 'read_only',
            ];
        }

        return $sources;
    }

    /** @return array{key: string, label: string, description: string, filters: array<string, string>, access: string}|array{error: string, message: string} */
    public function describeSource(User $user, string $source): array
    {
        if (! isset(self::SOURCES[$source])) {
            return ['error' => 'unknown_source', 'message' => "Sumber data `{$source}` tidak dikenali."];
        }

        $config = self::SOURCES[$source];
        if ($config['permission'] && ! $user->hasPermission($config['permission'])) {
            return ['error' => 'forbidden', 'message' => 'Anda tidak memiliki akses ke sumber data ini.'];
        }

        return [
            'key' => $source,
            'label' => $config['label'],
            'description' => $config['description'],
            'filters' => $config['filters'],
            'access' => 'read_only',
            'note' => 'Hanya operasi GET/view. Tidak ada INSERT, UPDATE, DELETE, atau perintah mutasi.',
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getData(User $user, string $source, array $filters = [], ?int $limit = null): array
    {
        if (! isset(self::SOURCES[$source])) {
            return ['error' => 'unknown_source', 'message' => "Sumber data `{$source}` tidak dikenali."];
        }

        $config = self::SOURCES[$source];
        if ($config['permission'] && ! $user->hasPermission($config['permission'])) {
            return ['error' => 'forbidden', 'message' => 'Anda tidak memiliki akses ke sumber data ini.'];
        }

        if ($this->containsMutationIntent($filters)) {
            return [
                'error' => 'forbidden',
                'message' => 'Filter mengandung perintah mutasi. Hanya GET/view data yang diizinkan.',
            ];
        }

        $limit = max(1, min((int) config('services.ai.read_only_max_rows', 100), $limit ?? 50));

        try {
            $payload = match ($source) {
                'finance.cash_bank' => $this->fetchCashBank($filters),
                'finance.revenue' => $this->fetchRevenue($filters),
                'finance.budget_monitoring' => $this->fetchBudgetMonitoring($filters, $limit),
                'finance.budget_years' => $this->fetchBudgetYears($limit),
                'hr.employees' => $this->fetchEmployees($filters, $limit),
                'hr.leave_pending' => $this->fetchLeavePending($limit),
                'workflow.approvals' => $this->fetchApprovals($user, $filters, $limit),
                default => ['error' => 'unknown_source', 'message' => 'Sumber data tidak tersedia.'],
            };
        } catch (\Throwable $e) {
            return [
                'error' => 'query_failed',
                'message' => 'Gagal mengambil data: '.$e->getMessage(),
            ];
        }

        if (isset($payload['error'])) {
            return $payload;
        }

        $payload['meta'] = [
            'source' => $source,
            'access' => 'read_only',
            'fetched_at' => now()->toIso8601String(),
        ];

        return $payload;
    }

    public function financeDashboardSummary(): array
    {
        $tahun = (int) now()->year;
        $data = $this->cashBankDashboard->index(['tahun' => $tahun, 'bulan' => (int) now()->month]);
        $kpis = $data['kpis'];

        return [
            'summary' => 'Posisi kas & bank '.$this->monthLabel((int) now()->month).' '.$tahun,
            'metrics' => [
                ['label' => 'Total Masuk', 'value' => $this->formatRupiah((float) $kpis['total_masuk']), 'change' => null],
                ['label' => 'Total Keluar', 'value' => $this->formatRupiah((float) $kpis['total_keluar']), 'change' => null],
                ['label' => 'Saldo Netto', 'value' => $this->formatRupiah((float) $kpis['saldo_netto']), 'change' => null],
                ['label' => 'Rekon ACC', 'value' => ($kpis['rekon_acc_pct'] ?? 0).'%', 'change' => ($kpis['posted_ke_acc'] ?? 0).' posted'],
            ],
            'items' => array_map(fn ($row) => [
                'akun' => trim(($row['account_no'] ?? '').' '.($row['account_name'] ?? '-')),
                'masuk' => $this->formatRupiah((float) ($row['masuk'] ?? 0)),
                'keluar' => $this->formatRupiah((float) ($row['keluar'] ?? 0)),
            ], array_slice($data['accounts'] ?? [], 0, 5)),
        ];
    }

    public function financeRevenueSummary(?int $budgetYearId = null, ?int $bulan = null): array
    {
        $yearId = $budgetYearId ?? $this->resolveBudgetYearId([]);
        $analysis = $this->revenueAnalysis->perKategori([
            'budget_year_id' => $yearId,
            'bulan' => $bulan,
        ]);
        $summary = $analysis['summary'];
        $year = BudgetYear::query()->find($yearId);

        return [
            'summary' => 'Pendapatan '.($bulan ? $this->monthLabel($bulan).' ' : '').($year->tahun ?? now()->year),
            'metrics' => [
                ['label' => 'Total Realisasi', 'value' => $this->formatRupiah((float) $summary['total_realisasi']), 'change' => null],
                ['label' => 'Total Rencana', 'value' => $this->formatRupiah((float) $summary['total_rencana']), 'change' => null],
                ['label' => 'Capaian Rencana', 'value' => ($summary['capaian_rencana_pct'] ?? 0).'%', 'change' => null],
                ['label' => 'Capaian Target', 'value' => ($summary['capaian_target_pct'] ?? 0).'%', 'change' => null],
            ],
            'items' => array_map(fn ($row) => [
                'unit' => $row['label'],
                'amount' => $this->formatRupiah((float) $row['realisasi_amount']),
                'share' => ($summary['total_realisasi'] ?? 0) > 0
                    ? round(($row['realisasi_amount'] / $summary['total_realisasi']) * 100).'%'
                    : '0%',
            ], $analysis['rows']),
        ];
    }

    public function financeExpenseRealization(?int $budgetYearId = null): array
    {
        $yearId = $budgetYearId ?? $this->resolveBudgetYearId([]);
        $dashboard = $this->budgetMonitoring->dashboard([
            'budget_year_id' => $yearId,
            'view' => 'per_akun',
        ]);
        $kpi = $dashboard['kpi'] ?? [];
        $rows = array_slice($dashboard['rows'] ?? [], 0, 8);

        return [
            'summary' => 'Realisasi belanja vs pagu '.($dashboard['filters']['tahun'] ?? now()->year),
            'metrics' => [
                ['label' => 'Total Pagu', 'value' => $this->formatRupiah((float) ($kpi['total_pagu'] ?? 0)), 'change' => null],
                ['label' => 'Realisasi', 'value' => $this->formatRupiah((float) ($kpi['total_realisasi'] ?? 0)), 'change' => ($kpi['pct_realisasi'] ?? 0).'%'],
                ['label' => 'Sisa Pagu', 'value' => $this->formatRupiah((float) ($kpi['sisa_pagu'] ?? 0)), 'change' => null],
                ['label' => 'Sisa Efektif', 'value' => $this->formatRupiah((float) ($kpi['sisa_efektif'] ?? 0)), 'change' => null],
            ],
            'items' => array_map(fn ($row) => [
                'coa' => ($row['kode'] ?? '').' - '.($row['nama'] ?? ''),
                'pagu' => $this->formatRupiah((float) ($row['pagu'] ?? 0)),
                'realisasi' => $this->formatRupiah((float) ($row['realisasi'] ?? 0)),
                'pct' => ($row['serap_pct'] ?? 0).'%',
            ], $rows),
        ];
    }

    public function financeCashflowSummary(?int $tahun = null): array
    {
        $tahun = $tahun ?? (int) now()->year;
        $data = $this->cashBankDashboard->index(['tahun' => $tahun]);
        $trend = $data['trend'] ?? [];
        $lastMonths = array_slice($trend, -3);

        $inflow = array_sum(array_column($lastMonths, 'masuk'));
        $outflow = array_sum(array_column($lastMonths, 'keluar'));

        return [
            'summary' => 'Arus kas 3 bulan terakhir tahun '.$tahun,
            'metrics' => [
                ['label' => 'Inflow', 'value' => $this->formatRupiah((float) $inflow), 'change' => null],
                ['label' => 'Outflow', 'value' => $this->formatRupiah((float) $outflow), 'change' => null],
                ['label' => 'Net Cashflow', 'value' => $this->formatRupiah((float) ($inflow - $outflow)), 'change' => null],
            ],
            'items' => array_map(fn ($row) => [
                'bulan' => $row['month'] ?? $row['bulan'] ?? '-',
                'masuk' => $this->formatRupiah((float) ($row['masuk'] ?? 0)),
                'keluar' => $this->formatRupiah((float) ($row['keluar'] ?? 0)),
            ], $lastMonths),
        ];
    }

    public function hrEmployeeSummary(): array
    {
        $total = Employee::query()->count();
        $byStatus = Employee::query()
            ->selectRaw('employment_status, COUNT(*) as total')
            ->groupBy('employment_status')
            ->pluck('total', 'employment_status');

        $pendingLeave = LeaveRequest::query()->where('status', 'pending')->count();

        return [
            'summary' => 'Ringkasan SDM per '.now()->format('d M Y'),
            'metrics' => [
                ['label' => 'Total Karyawan', 'value' => (string) $total, 'change' => null],
                ['label' => 'Cuti Pending', 'value' => (string) $pendingLeave, 'change' => null],
            ],
            'items' => $byStatus->map(fn ($count, $status) => [
                'status' => $status,
                'count' => (int) $count,
            ])->values()->all(),
        ];
    }

    public function approvalMyPending(User $user): array
    {
        $instances = ApprovalInstance::query()
            ->with('submitter:id,name')
            ->whereIn('status', ['submitted', 'in_review'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return [
            'summary' => "Approval aktif di sistem ({$instances->count()} dokumen)",
            'metrics' => [
                ['label' => 'Total Pending', 'value' => (string) $instances->count(), 'change' => null],
            ],
            'items' => $instances->map(fn ($row) => [
                'doc' => strtoupper($row->document_type).' #'.$row->document_id,
                'type' => $row->document_type,
                'amount' => $row->context['amount'] ?? ($row->context['label'] ?? $row->status),
                'dept' => $row->context['department'] ?? ($row->submitter?->name ?? '-'),
            ])->all(),
        ];
    }

    public function reportExecutiveSummary(): array
    {
        $revenue = $this->financeRevenueSummary();
        $expense = $this->financeExpenseRealization();
        $cash = $this->financeCashflowSummary();
        $hr = $this->hrEmployeeSummary();

        return [
            'summary' => 'Ringkasan eksekutif SQ+ — '.now()->format('M Y'),
            'metrics' => [
                ['label' => 'Realisasi Pendapatan', 'value' => $revenue['metrics'][0]['value'] ?? '-', 'change' => $revenue['metrics'][2]['value'] ?? null],
                ['label' => 'Serapan Anggaran', 'value' => $expense['metrics'][1]['change'] ?? '-', 'change' => 'realisasi vs pagu'],
                ['label' => 'Net Cashflow (3 bln)', 'value' => $cash['metrics'][2]['value'] ?? '-', 'change' => null],
                ['label' => 'Total Karyawan', 'value' => $hr['metrics'][0]['value'] ?? '-', 'change' => null],
            ],
            'items' => [
                ['area' => 'Keuangan', 'status' => 'Stabil', 'note' => 'Data dari kas, pendapatan, dan pagu live'],
                ['area' => 'SDM', 'status' => ((int) ($hr['metrics'][1]['value'] ?? 0)) > 0 ? 'Perhatian' : 'Stabil', 'note' => ($hr['metrics'][1]['value'] ?? 0).' cuti pending'],
            ],
        ];
    }

    /** @param  array<string, mixed>  $filters */
    private function fetchCashBank(array $filters): array
    {
        $tahun = (int) ($filters['tahun'] ?? $this->resolveBudgetYear()?->tahun ?? now()->year);
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $data = $this->cashBankDashboard->index(['tahun' => $tahun, 'bulan' => $bulan]);
        $kpis = $data['kpis'];

        return [
            'summary' => 'Data kas & bank tahun '.$tahun.($bulan ? ' bulan '.$bulan : ''),
            'metrics' => [
                ['label' => 'Total Masuk', 'value' => $this->formatRupiah((float) $kpis['total_masuk'])],
                ['label' => 'Total Keluar', 'value' => $this->formatRupiah((float) $kpis['total_keluar'])],
                ['label' => 'Saldo Netto', 'value' => $this->formatRupiah((float) $kpis['saldo_netto'])],
            ],
            'items' => array_slice($data['recent_transactions'] ?? [], 0, 10),
        ];
    }

    /** @param  array<string, mixed>  $filters */
    private function fetchRevenue(array $filters): array
    {
        return $this->financeRevenueSummary(
            isset($filters['budget_year_id']) ? (int) $filters['budget_year_id'] : null,
            isset($filters['bulan']) ? (int) $filters['bulan'] : null,
        );
    }

    /** @param  array<string, mixed>  $filters */
    private function fetchBudgetMonitoring(array $filters, int $limit): array
    {
        $yearId = $this->resolveBudgetYearId($filters);
        $dashboard = $this->budgetMonitoring->dashboard([
            'budget_year_id' => $yearId,
            'bulan_from' => isset($filters['bulan_from']) ? (int) $filters['bulan_from'] : 1,
            'bulan_to' => isset($filters['bulan_to']) ? (int) $filters['bulan_to'] : 12,
            'view' => $filters['view'] ?? 'monitoring',
        ]);

        $rows = array_slice($dashboard['rows'] ?? [], 0, $limit);
        $kpi = $dashboard['kpi'] ?? [];

        return [
            'summary' => 'Monitoring pagu tahun '.($dashboard['filters']['tahun'] ?? '-'),
            'metrics' => [
                ['label' => 'Total Pagu', 'value' => $this->formatRupiah((float) ($kpi['total_pagu'] ?? 0))],
                ['label' => 'Realisasi', 'value' => $this->formatRupiah((float) ($kpi['total_realisasi'] ?? 0))],
                ['label' => 'Serapan', 'value' => ($kpi['pct_realisasi'] ?? 0).'%'],
            ],
            'items' => array_map(fn ($row) => [
                'kode' => $row['kode'] ?? '-',
                'nama' => $row['nama'] ?? '-',
                'pagu' => $this->formatRupiah((float) ($row['pagu'] ?? 0)),
                'realisasi' => $this->formatRupiah((float) ($row['realisasi'] ?? 0)),
                'serap_pct' => ($row['serap_pct'] ?? 0).'%',
                'status' => $row['status_label'] ?? '-',
            ], $rows),
        ];
    }

    private function fetchBudgetYears(int $limit): array
    {
        $years = BudgetYear::query()->orderByDesc('tahun')->limit($limit)->get();

        return [
            'summary' => 'Daftar tahun anggaran',
            'metrics' => [
                ['label' => 'Jumlah Tahun', 'value' => (string) $years->count()],
            ],
            'items' => $years->map(fn ($y) => [
                'id' => $y->id,
                'tahun' => $y->tahun,
                'nama' => $y->nama,
                'status' => $y->status,
            ])->all(),
        ];
    }

    /** @param  array<string, mixed>  $filters */
    private function fetchEmployees(array $filters, int $limit): array
    {
        $query = Employee::query()->with(['organizationalUnit:id,name', 'position:id,name']);

        if (! empty($filters['employment_status'])) {
            $query->where('employment_status', (string) $filters['employment_status']);
        }
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        $total = (clone $query)->count();
        $rows = $query->orderBy('name')->limit($limit)->get();

        return [
            'summary' => 'Data karyawan (read-only)',
            'metrics' => [
                ['label' => 'Total Cocok Filter', 'value' => (string) $total],
                ['label' => 'Ditampilkan', 'value' => (string) $rows->count()],
            ],
            'items' => $rows->map(fn ($e) => [
                'kode' => $e->employee_code,
                'nama' => $e->name,
                'unit' => $e->organizationalUnit?->name ?? '-',
                'jabatan' => $e->position?->name ?? '-',
                'status' => $e->employment_status,
            ])->all(),
        ];
    }

    private function fetchLeavePending(int $limit): array
    {
        $rows = LeaveRequest::query()
            ->with(['employee:id,name,employee_code'])
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return [
            'summary' => 'Pengajuan cuti pending',
            'metrics' => [
                ['label' => 'Total Pending', 'value' => (string) $rows->count()],
            ],
            'items' => $rows->map(fn ($r) => [
                'pegawai' => $r->employee?->name ?? '-',
                'kode' => $r->employee?->employee_code ?? '-',
                'mulai' => $r->start_date ? Carbon::parse($r->start_date)->format('d M Y') : '-',
                'selesai' => $r->end_date ? Carbon::parse($r->end_date)->format('d M Y') : '-',
                'status' => $r->status,
            ])->all(),
        ];
    }

    /** @param  array<string, mixed>  $filters */
    private function fetchApprovals(User $user, array $filters, int $limit): array
    {
        $statuses = ! empty($filters['status'])
            ? [(string) $filters['status']]
            : ['submitted', 'in_review'];

        $rows = ApprovalInstance::query()
            ->with('submitter:id,name')
            ->whereIn('status', $statuses)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return [
            'summary' => 'Approval '.implode('/', $statuses),
            'metrics' => [
                ['label' => 'Jumlah Dokumen', 'value' => (string) $rows->count()],
            ],
            'items' => $rows->map(fn ($r) => [
                'doc' => strtoupper($r->document_type).' #'.$r->document_id,
                'type' => $r->document_type,
                'status' => $r->status,
                'pengaju' => $r->submitter?->name ?? '-',
                'tanggal' => $r->created_at?->format('d M Y H:i') ?? '-',
            ])->all(),
        ];
    }

    /** @param  array<string, mixed>  $filters */
    private function resolveBudgetYearId(array $filters): int
    {
        if (! empty($filters['budget_year_id'])) {
            return (int) $filters['budget_year_id'];
        }

        $year = $this->resolveBudgetYear();
        if (! $year) {
            throw new \RuntimeException('Tahun anggaran belum tersedia.');
        }

        return $year->id;
    }

    private function resolveBudgetYear(): ?BudgetYear
    {
        return BudgetYear::query()
            ->where('status', BudgetYear::STATUS_ACTIVE)
            ->orderByDesc('tahun')
            ->first()
            ?? BudgetYear::query()->orderByDesc('tahun')->first();
    }

    /** @param  array<string, mixed>  $filters */
    private function containsMutationIntent(array $filters): bool
    {
        $blocked = '/\b(insert|update|delete|drop|truncate|alter|create|grant|exec|execute|merge|upsert)\b/i';

        foreach ($filters as $value) {
            if (is_string($value) && preg_match($blocked, $value)) {
                return true;
            }
        }

        return false;
    }

    private function formatRupiah(float $amount): string
    {
        $abs = abs($amount);
        $sign = $amount < 0 ? '-' : '';

        if ($abs >= 1_000_000_000) {
            return $sign.'Rp '.number_format($abs / 1_000_000_000, 1, ',', '.').' M';
        }
        if ($abs >= 1_000_000) {
            return $sign.'Rp '.number_format($abs / 1_000_000, 1, ',', '.').' jt';
        }

        return $sign.'Rp '.number_format($abs, 0, ',', '.');
    }

    private function monthLabel(int $month): string
    {
        return [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ][$month] ?? (string) $month;
    }
}

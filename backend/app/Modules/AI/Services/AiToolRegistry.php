<?php

namespace App\Modules\AI\Services;

use App\Models\User;

class AiToolRegistry
{
    /** @var array<string, array{permission: ?string, description: string, parameters?: array<string, mixed>}> */
    private const TOOLS = [
        'data.list_sources' => [
            'permission' => 'ai.assistant.use',
            'description' => 'Lihat daftar sumber data read-only (GET/view) yang tersedia di database SQ+',
        ],
        'data.describe_source' => [
            'permission' => 'ai.assistant.use',
            'description' => 'Lihat deskripsi kolom/filter untuk satu sumber data read-only',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'source' => [
                        'type' => 'string',
                        'description' => 'Kunci sumber data, mis. finance.revenue atau hr.employees',
                    ],
                ],
                'required' => ['source'],
            ],
        ],
        'data.get_data' => [
            'permission' => 'ai.assistant.use',
            'description' => 'Ambil data read-only dari database SQ+ (hanya GET/view, tanpa ubah/hapus data). Gunakan setelah data.list_sources atau data.describe_source.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'source' => [
                        'type' => 'string',
                        'description' => 'Kunci sumber data, mis. finance.cash_bank',
                    ],
                    'filters' => [
                        'type' => 'object',
                        'description' => 'Filter opsional sesuai sumber data (tahun, bulan, budget_year_id, dll)',
                    ],
                    'limit' => [
                        'type' => 'integer',
                        'description' => 'Maks baris yang diambil (default 50, max 100)',
                    ],
                ],
                'required' => ['source'],
            ],
        ],
        'finance.dashboard_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Ringkasan dashboard keuangan live: kas, arus masuk/keluar, rekon ACC',
        ],
        'finance.revenue_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Ringkasan pendapatan live: target, rencana, realisasi per kategori',
        ],
        'finance.expense_realization' => [
            'permission' => 'finance.reports.view',
            'description' => 'Realisasi belanja vs pagu anggaran live per akun/unit',
        ],
        'finance.cashflow_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Arus kas masuk/keluar beberapa bulan terakhir (data live)',
        ],
        'hr.employee_summary' => [
            'permission' => 'hr.employees.view',
            'description' => 'Ringkasan SDM live: headcount, status kepegawaian, cuti pending',
        ],
        'procurement.request_summary' => [
            'permission' => 'procurement.pr.manage',
            'description' => 'Ringkasan purchase request per departemen',
        ],
        'supply_chain.stock_critical' => [
            'permission' => 'supply_chain.items.manage',
            'description' => 'Daftar item stok di bawah minimum',
        ],
        'approval.my_pending_approvals' => [
            'permission' => 'workflow.approve',
            'description' => 'Daftar approval yang masih aktif di workflow',
        ],
        'report.executive_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Ringkasan eksekutif KPI lintas modul dari data live',
        ],
    ];

    public function __construct(
        private readonly AiReadOnlyDataService $data,
    ) {}

    /** @return list<array{type: string, function: array<string, mixed>}> */
    public function openAiToolDefinitions(User $user): array
    {
        $tools = [];
        foreach (self::TOOLS as $name => $config) {
            if ($config['permission'] && ! $user->hasPermission($config['permission'])) {
                continue;
            }

            $parameters = $config['parameters'] ?? [
                'type' => 'object',
                'properties' => (object) [],
                'additionalProperties' => false,
            ];

            $tools[] = [
                'type' => 'function',
                'function' => [
                    'name' => $name,
                    'description' => $config['description'],
                    'parameters' => $parameters,
                ],
            ];
        }

        return $tools;
    }

    public function execute(User $user, string $toolName, array $params = []): array
    {
        if (! isset(self::TOOLS[$toolName])) {
            return ['error' => 'unknown_tool', 'message' => "Tool {$toolName} tidak dikenali."];
        }

        $config = self::TOOLS[$toolName];
        if ($config['permission'] && ! $user->hasPermission($config['permission'])) {
            return [
                'error' => 'forbidden',
                'message' => 'Anda tidak memiliki akses ke data modul ini.',
            ];
        }

        return match ($toolName) {
            'data.list_sources' => $this->wrapListSources($user),
            'data.describe_source' => $this->data->describeSource($user, (string) ($params['source'] ?? '')),
            'data.get_data' => $this->data->getData(
                $user,
                (string) ($params['source'] ?? ''),
                (array) ($params['filters'] ?? []),
                isset($params['limit']) ? (int) $params['limit'] : null,
            ),
            'finance.dashboard_summary' => $this->data->financeDashboardSummary(),
            'finance.revenue_summary' => $this->data->financeRevenueSummary(),
            'finance.expense_realization' => $this->data->financeExpenseRealization(),
            'finance.cashflow_summary' => $this->data->financeCashflowSummary(),
            'hr.employee_summary' => $this->data->hrEmployeeSummary(),
            'procurement.request_summary' => $this->procurementRequestSummary(),
            'supply_chain.stock_critical' => $this->supplyChainStockCritical(),
            'approval.my_pending_approvals' => $this->data->approvalMyPending($user),
            'report.executive_summary' => $this->data->reportExecutiveSummary(),
            default => ['error' => 'unknown_tool', 'message' => 'Tool tidak tersedia.'],
        };
    }

    /** @return array<string, mixed> */
    private function wrapListSources(User $user): array
    {
        $sources = $this->data->listSources($user);

        return [
            'summary' => count($sources).' sumber data read-only tersedia',
            'metrics' => [
                ['label' => 'Mode Akses', 'value' => 'GET / View Only', 'change' => 'tanpa mutasi'],
            ],
            'items' => array_map(fn ($s) => [
                'key' => $s['key'],
                'label' => $s['label'],
                'description' => $s['description'],
            ], $sources),
        ];
    }

    private function procurementRequestSummary(): array
    {
        return [
            'summary' => 'Purchase Request — data modul pengadaan belum terhubung ke katalog DB',
            'metrics' => [
                ['label' => 'Status', 'value' => 'Segera hadir', 'change' => null],
            ],
            'items' => [],
            'message' => 'Gunakan data.get_data untuk sumber yang sudah tersedia, atau modul Pengadaan di SQ+.',
        ];
    }

    private function supplyChainStockCritical(): array
    {
        return [
            'summary' => 'Stok kritis — data inventori belum terhubung ke katalog DB',
            'metrics' => [
                ['label' => 'Status', 'value' => 'Segera hadir', 'change' => null],
            ],
            'items' => [],
            'message' => 'Gunakan modul Supply Chain di SQ+ untuk detail stok.',
        ];
    }
}

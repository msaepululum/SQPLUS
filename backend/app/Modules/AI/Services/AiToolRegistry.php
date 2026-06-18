<?php

namespace App\Modules\AI\Services;

use App\Models\User;

class AiToolRegistry
{
    /** @var array<string, array{permission: ?string, description: string}> */
    private const TOOLS = [
        'finance.dashboard_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Ringkasan dashboard keuangan: saldo kas, piutang, hutang, rasio likuiditas',
        ],
        'finance.revenue_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Ringkasan pendapatan bulan berjalan dan YTD per unit layanan',
        ],
        'finance.expense_realization' => [
            'permission' => 'finance.reports.view',
            'description' => 'Realisasi belanja vs pagu anggaran per COA',
        ],
        'finance.cashflow_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Arus kas masuk/keluar 30 hari terakhir',
        ],
        'hr.employee_summary' => [
            'permission' => 'hr.employees.view',
            'description' => 'Ringkasan SDM: headcount, status kepegawaian, cuti pending',
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
            'description' => 'Daftar approval yang menunggu tindakan pengguna',
        ],
        'report.executive_summary' => [
            'permission' => 'finance.reports.view',
            'description' => 'Ringkasan eksekutif KPI lintas modul',
        ],
    ];

    /** @return list<array{type: string, function: array<string, mixed>}> */
    public function openAiToolDefinitions(User $user): array
    {
        $tools = [];
        foreach (self::TOOLS as $name => $config) {
            if ($config['permission'] && ! $user->hasPermission($config['permission'])) {
                continue;
            }
            $tools[] = [
                'type' => 'function',
                'function' => [
                    'name' => $name,
                    'description' => $config['description'],
                    'parameters' => [
                        'type' => 'object',
                        'properties' => (object) [],
                        'additionalProperties' => false,
                    ],
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
            'finance.dashboard_summary' => $this->financeDashboardSummary(),
            'finance.revenue_summary' => $this->financeRevenueSummary(),
            'finance.expense_realization' => $this->financeExpenseRealization(),
            'finance.cashflow_summary' => $this->financeCashflowSummary(),
            'hr.employee_summary' => $this->hrEmployeeSummary(),
            'procurement.request_summary' => $this->procurementRequestSummary(),
            'supply_chain.stock_critical' => $this->supplyChainStockCritical(),
            'approval.my_pending_approvals' => $this->approvalMyPending($user),
            'report.executive_summary' => $this->reportExecutiveSummary(),
            default => ['error' => 'unknown_tool', 'message' => 'Tool tidak tersedia.'],
        };
    }

    private function financeDashboardSummary(): array
    {
        return [
            'summary' => 'Posisi keuangan per 17 Jun 2026',
            'metrics' => [
                ['label' => 'Saldo Kas', 'value' => 'Rp 12,4 M', 'change' => '+3,2%'],
                ['label' => 'Piutang', 'value' => 'Rp 8,7 M', 'change' => '-1,1%'],
                ['label' => 'Hutang', 'value' => 'Rp 5,2 M', 'change' => '+0,5%'],
                ['label' => 'Rasio Likuiditas', 'value' => '2,38', 'change' => 'stabil'],
            ],
            'items' => [],
        ];
    }

    private function financeRevenueSummary(): array
    {
        return [
            'summary' => 'Pendapatan Juni 2026 (mock)',
            'metrics' => [
                ['label' => 'Bulan Berjalan', 'value' => 'Rp 18,2 M', 'change' => '+7,4%'],
                ['label' => 'YTD', 'value' => 'Rp 98,6 M', 'change' => '+5,1%'],
            ],
            'items' => [
                ['unit' => 'Rawat Jalan', 'amount' => 'Rp 6,1 M', 'share' => '33%'],
                ['unit' => 'Rawat Inap', 'amount' => 'Rp 8,4 M', 'share' => '46%'],
                ['unit' => 'Penunjang', 'amount' => 'Rp 3,7 M', 'share' => '21%'],
            ],
        ];
    }

    private function financeExpenseRealization(): array
    {
        return [
            'summary' => 'Realisasi belanja vs pagu Q2 2026',
            'metrics' => [
                ['label' => 'Total Pagu', 'value' => 'Rp 45 M', 'change' => null],
                ['label' => 'Realisasi', 'value' => 'Rp 31,2 M', 'change' => '69,3%'],
            ],
            'items' => [
                ['coa' => '5101 - BHP', 'pagu' => 'Rp 12 M', 'realisasi' => 'Rp 9,1 M', 'pct' => '75,8%'],
                ['coa' => '5201 - Jasa Medis', 'pagu' => 'Rp 18 M', 'realisasi' => 'Rp 14,2 M', 'pct' => '78,9%'],
                ['coa' => '5301 - Operasional', 'pagu' => 'Rp 15 M', 'realisasi' => 'Rp 7,9 M', 'pct' => '52,7%'],
            ],
        ];
    }

    private function financeCashflowSummary(): array
    {
        return [
            'summary' => 'Arus kas 30 hari terakhir',
            'metrics' => [
                ['label' => 'Inflow', 'value' => 'Rp 22,8 M', 'change' => '+4,2%'],
                ['label' => 'Outflow', 'value' => 'Rp 19,5 M', 'change' => '+2,1%'],
                ['label' => 'Net Cashflow', 'value' => 'Rp 3,3 M', 'change' => '+12%'],
            ],
            'items' => [],
        ];
    }

    private function hrEmployeeSummary(): array
    {
        return [
            'summary' => 'Ringkasan SDM per 17 Jun 2026',
            'metrics' => [
                ['label' => 'Total Karyawan', 'value' => '342', 'change' => '+4'],
                ['label' => 'Cuti Pending', 'value' => '12', 'change' => null],
                ['label' => 'Kontrak Berakhir (30 hari)', 'value' => '8', 'change' => null],
            ],
            'items' => [
                ['status' => 'Tetap', 'count' => 218],
                ['status' => 'Kontrak', 'count' => 98],
                ['status' => 'Magang', 'count' => 26],
            ],
        ];
    }

    private function procurementRequestSummary(): array
    {
        return [
            'summary' => 'Purchase Request aktif',
            'metrics' => [
                ['label' => 'Draft', 'value' => '7', 'change' => null],
                ['label' => 'Menunggu Approval', 'value' => '14', 'change' => null],
                ['label' => 'Disetujui (bulan ini)', 'value' => '23', 'change' => '+5'],
            ],
            'items' => [
                ['dept' => 'Farmasi', 'open' => 5, 'approved' => 8],
                ['dept' => 'Gizi', 'open' => 3, 'approved' => 4],
                ['dept' => 'IPSRS', 'open' => 6, 'approved' => 11],
            ],
        ];
    }

    private function supplyChainStockCritical(): array
    {
        return [
            'summary' => 'Item stok kritis (di bawah minimum)',
            'metrics' => [
                ['label' => 'Total Item Kritis', 'value' => '9', 'change' => '+2'],
            ],
            'items' => [
                ['code' => 'MED-001', 'name' => 'Paracetamol 500mg', 'stock' => 120, 'min' => 500],
                ['code' => 'MED-042', 'name' => 'Infus Set', 'stock' => 45, 'min' => 200],
                ['code' => 'BHP-018', 'name' => 'Sarung Tangan L', 'stock' => 800, 'min' => 2000],
            ],
        ];
    }

    private function approvalMyPending(User $user): array
    {
        return [
            'summary' => "Approval pending untuk {$user->name}",
            'metrics' => [
                ['label' => 'Total Pending', 'value' => '5', 'change' => null],
            ],
            'items' => [
                ['doc' => 'PR-2026-0142', 'type' => 'Purchase Request', 'amount' => 'Rp 12,5 jt', 'dept' => 'Farmasi'],
                ['doc' => 'LV-2026-0088', 'type' => 'Cuti', 'amount' => '3 hari', 'dept' => 'Keperawatan'],
                ['doc' => 'PO-2026-0067', 'type' => 'Purchase Order', 'amount' => 'Rp 45 jt', 'dept' => 'IPSRS'],
            ],
        ];
    }

    private function reportExecutiveSummary(): array
    {
        return [
            'summary' => 'Ringkasan eksekutif SQ+ — Juni 2026',
            'metrics' => [
                ['label' => 'Pendapatan YTD', 'value' => 'Rp 98,6 M', 'change' => '+5,1%'],
                ['label' => 'Realisasi Anggaran', 'value' => '69,3%', 'change' => 'on track'],
                ['label' => 'Occupancy Rate', 'value' => '78%', 'change' => '+2%'],
                ['label' => 'PR Pending', 'value' => '14', 'change' => null],
            ],
            'items' => [
                ['area' => 'Keuangan', 'status' => 'Stabil', 'note' => 'Likuiditas baik'],
                ['area' => 'SDM', 'status' => 'Perhatian', 'note' => '8 kontrak berakhir'],
                ['area' => 'Supply Chain', 'status' => 'Perhatian', 'note' => '9 item stok kritis'],
            ],
        ];
    }
}

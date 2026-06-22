<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;

class FinanceReportDashboardService
{
    public function __construct(
        private readonly BudgetMonitoringPaguService $monitoringService,
        private readonly RevenueDashboardService $revenueService,
        private readonly HutangPiutangService $hutangPiutangService,
        private readonly CashSaldoRekapService $cashSaldoService,
    ) {}

    /**
     * @param  array{budget_year_id: int, bulan?: int|null}  $filters
     * @return array<string, mixed>
     */
    public function dashboard(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (int) $year->tahun;
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;

        $monitoring = $this->monitoringService->dashboard([
            'budget_year_id' => $year->id,
            'view' => 'monitoring',
            'bulan_from' => 1,
            'bulan_to' => $bulan ?? 12,
        ]);

        $revenue = $this->revenueService->dashboard([
            'budget_year_id' => $year->id,
            'bulan' => $bulan,
        ]);

        $hp = $this->hutangPiutangService->dashboard([
            'tahun' => $tahun,
            'bulan' => $bulan,
        ]);

        $cash = $this->cashSaldoService->rekapBulanan(['tahun' => $tahun]);

        $reportCategories = [
            [
                'slug' => 'anggaran',
                'label' => 'Laporan Anggaran',
                'href' => '/finance/reports/anggaran',
                'count' => 3,
                'highlight' => round((float) ($monitoring['kpi']['pct_realisasi'] ?? 0), 1),
                'highlight_label' => 'Daya serap',
                'highlight_unit' => '%',
            ],
            [
                'slug' => 'operasional',
                'label' => 'Laporan Operasional',
                'href' => '/finance/reports/operasional',
                'count' => 3,
                'highlight' => round((float) ($revenue['summary']['capaian_rencana_pct'] ?? 0), 1),
                'highlight_label' => 'Capaian pendapatan',
                'highlight_unit' => '%',
            ],
            [
                'slug' => 'pos-keuangan',
                'label' => 'Laporan Posisi Keuangan',
                'href' => '/finance/reports/pos-keuangan',
                'count' => 4,
                'highlight' => round((float) ($cash['summary']['saldo_akhir_tahun'] ?? 0), 0),
                'highlight_label' => 'Saldo kas & bank',
                'highlight_unit' => 'Rp',
            ],
            [
                'slug' => 'transaksi',
                'label' => 'Laporan Transaksi',
                'href' => '/finance/reports/transaksi',
                'count' => 2,
                'highlight' => (int) ($hp['kpis']['total_hutang'] ?? 0) + (int) ($hp['kpis']['total_piutang'] ?? 0),
                'highlight_label' => 'Volume hutang + piutang',
                'highlight_unit' => 'Rp',
            ],
        ];

        return [
            'filters' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'budget_year_id' => $year->id,
            ],
            'kpis' => [
                'total_pagu' => (float) ($monitoring['kpi']['total_pagu'] ?? 0),
                'total_realisasi' => (float) ($monitoring['kpi']['total_realisasi'] ?? 0),
                'pct_serap' => (float) ($monitoring['kpi']['pct_realisasi'] ?? 0),
                'total_pendapatan' => (float) ($revenue['summary']['total_realisasi'] ?? 0),
                'target_pendapatan' => (float) ($revenue['summary']['total_rencana'] ?? 0),
                'capaian_pendapatan_pct' => (float) ($revenue['summary']['capaian_rencana_pct'] ?? 0),
                'saldo_kas_bank' => (float) ($cash['summary']['saldo_akhir_tahun'] ?? 0),
                'total_hutang' => (float) ($hp['kpis']['total_hutang'] ?? 0),
                'total_piutang' => (float) ($hp['kpis']['total_piutang'] ?? 0),
            ],
            'categories' => $reportCategories,
            'updated_at' => now()->toIso8601String(),
        ];
    }
}

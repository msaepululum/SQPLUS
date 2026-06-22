<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueCategoryMonthlyPlan;
use App\Modules\Finance\Models\RevenueRealization;
use Illuminate\Support\Facades\DB;

class RevenueDashboardService
{
    private const BULAN_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    public function __construct(
        private readonly RevenueAnalysisService $analysisService
    ) {}

    /**
     * @param  array{budget_year_id: int, bulan?: int, category_id?: string}  $filters
     */
    public function dashboard(array $filters): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $analysis = $this->analysisService->perKategori($filters);

        $lastUpdate = RevenueRealization::query()
            ->where('budget_year_id', $budgetYear->id)
            ->max('updated_at');

        return [
            'summary' => $analysis['summary'],
            'categories' => $analysis['rows'],
            'monthly_trend' => $this->monthlyTrend(
                $budgetYear->id,
                (int) $budgetYear->tahun,
                $filters['category_id'] ?? null,
                isset($filters['bulan']) ? (int) $filters['bulan'] : null
            ),
            'updated_at' => $lastUpdate ? (string) $lastUpdate : null,
        ];
    }

    /**
     * @return list<array{bulan: int, nama_bulan: string, rencana: float, realisasi: float}>
     */
    private function monthlyTrend(
        int $budgetYearId,
        int $tahun,
        ?string $categoryId,
        ?int $bulanLimit
    ): array {
        $rencanaQuery = RevenueCategoryMonthlyPlan::query()
            ->where('budget_year_id', $budgetYearId);

        if ($categoryId) {
            $rencanaQuery->where('category_id', $categoryId);
        }

        $rencanaByMonth = $rencanaQuery
            ->select('bulan', DB::raw('SUM(plan_amount) as total'))
            ->groupBy('bulan')
            ->pluck('total', 'bulan');

        $realisasiQuery = RevenueRealization::query()
            ->where('budget_year_id', $budgetYearId)
            ->whereYear('tanggal', $tahun);

        if ($categoryId) {
            $realisasiQuery->where('category_id', $categoryId);
        }

        $realisasiByMonth = $realisasiQuery
            ->select(DB::raw('MONTH(tanggal) as bulan'), DB::raw('SUM(amount) as total'))
            ->groupBy(DB::raw('MONTH(tanggal)'))
            ->pluck('total', 'bulan');

        $months = $bulanLimit ? range(1, $bulanLimit) : range(1, 12);
        $trend = [];

        foreach ($months as $bulan) {
            $trend[] = [
                'bulan' => $bulan,
                'nama_bulan' => self::BULAN_LABELS[$bulan],
                'rencana' => (float) ($rencanaByMonth[$bulan] ?? 0),
                'realisasi' => (float) ($realisasiByMonth[$bulan] ?? 0),
            ];
        }

        return $trend;
    }
}

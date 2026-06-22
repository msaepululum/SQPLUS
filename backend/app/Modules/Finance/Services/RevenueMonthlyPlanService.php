<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueCategoryMonthlyPlan;
use App\Modules\Finance\Models\RevenueCategoryTarget;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RevenueMonthlyPlanService
{
    private const BULAN_LABELS = [
        1 => 'Jan',
        2 => 'Feb',
        3 => 'Mar',
        4 => 'Apr',
        5 => 'Mei',
        6 => 'Jun',
        7 => 'Jul',
        8 => 'Agu',
        9 => 'Sep',
        10 => 'Okt',
        11 => 'Nov',
        12 => 'Des',
    ];

    /**
     * @param  array{budget_year_id: int, category_id?: string}  $filters
     * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, bulan_labels: array<int, string>, ready: bool}
     */
    public function list(array $filters): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $categoryFilter = $filters['category_id'] ?? null;

        $targets = RevenueCategoryTarget::query()
            ->where('budget_year_id', $budgetYear->id)
            ->get()
            ->keyBy('category_id');

        $monthlyRows = RevenueCategoryMonthlyPlan::query()
            ->where('budget_year_id', $budgetYear->id)
            ->get();

        $monthlyMap = [];
        foreach ($monthlyRows as $row) {
            $monthlyMap[$row->category_id][$row->bulan] = (float) $row->plan_amount;
        }

        $rows = [];
        $summaryMonths = array_fill(1, 12, 0.0);
        $totalRencanaTahunan = 0.0;
        $totalDistribusi = 0.0;
        $hasRencana = false;

        foreach (RevenueCategories::all() as $category) {
            if ($categoryFilter && $category['id'] !== $categoryFilter) {
                continue;
            }

            $targetRecord = $targets->get($category['id']);
            $rencanaTahunan = $targetRecord ? (float) $targetRecord->plan_amount : 0.0;

            if ($rencanaTahunan > 0) {
                $hasRencana = true;
            }

            $months = [];
            $totalBulan = 0.0;

            for ($bulan = 1; $bulan <= 12; $bulan++) {
                $amount = (float) ($monthlyMap[$category['id']][$bulan] ?? 0);
                $months[] = [
                    'bulan' => $bulan,
                    'nama_bulan' => self::BULAN_LABELS[$bulan],
                    'rencana' => $amount,
                ];
                $totalBulan += $amount;
                $summaryMonths[$bulan] += $amount;
            }

            $totalRencanaTahunan += $rencanaTahunan;
            $totalDistribusi += $totalBulan;

            $rows[] = [
                'category_id' => $category['id'],
                'kode' => $category['kode'],
                'label' => $category['label'],
                'rencana_tahunan' => $rencanaTahunan,
                'months' => $months,
                'total_bulan' => $totalBulan,
                'selisih' => $totalBulan - $rencanaTahunan,
            ];
        }

        $summaryMonthList = [];
        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $summaryMonthList[] = [
                'bulan' => $bulan,
                'nama_bulan' => self::BULAN_LABELS[$bulan],
                'rencana' => $summaryMonths[$bulan],
            ];
        }

        return [
            'ready' => $hasRencana,
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'jumlah_kategori' => count($rows),
                'total_rencana_tahunan' => $totalRencanaTahunan,
                'total_distribusi' => $totalDistribusi,
                'total_selisih' => $totalDistribusi - $totalRencanaTahunan,
                'months' => $summaryMonthList,
            ],
            'bulan_labels' => self::BULAN_LABELS,
        ];
    }

    /**
     * @param  list<array{category_id: string, bulan: int, plan_amount: float|int|string}>  $items
     */
    public function bulkUpsert(int $budgetYearId, array $items): array
    {
        BudgetYear::query()->findOrFail($budgetYearId);
        $validIds = RevenueCategories::ids();

        DB::transaction(function () use ($budgetYearId, $items, $validIds): void {
            foreach ($items as $item) {
                $categoryId = (string) $item['category_id'];
                if (! in_array($categoryId, $validIds, true)) {
                    throw ValidationException::withMessages([
                        'items' => ["Kategori pendapatan tidak valid: {$categoryId}."],
                    ]);
                }

                $bulan = (int) $item['bulan'];
                if ($bulan < 1 || $bulan > 12) {
                    throw ValidationException::withMessages([
                        'bulan' => 'Bulan harus antara 1 dan 12.',
                    ]);
                }

                $amount = (float) $item['plan_amount'];
                if ($amount < 0) {
                    throw ValidationException::withMessages([
                        'plan_amount' => 'Rencana bulanan tidak boleh negatif.',
                    ]);
                }

                RevenueCategoryMonthlyPlan::query()->updateOrCreate(
                    [
                        'budget_year_id' => $budgetYearId,
                        'category_id' => $categoryId,
                        'bulan' => $bulan,
                    ],
                    ['plan_amount' => $amount]
                );
            }
        });

        return $this->list(['budget_year_id' => $budgetYearId]);
    }
}

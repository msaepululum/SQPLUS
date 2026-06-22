<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueCategoryTarget;
use App\Modules\Finance\Models\RevenueRealization;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Support\Facades\DB;

class RevenueAnalysisService
{
    /**
     * @param  array{budget_year_id: int, bulan?: int, category_id?: string}  $filters
     */
    public function perKategori(array $filters): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $categoryFilter = $filters['category_id'] ?? null;

        $targets = RevenueCategoryTarget::query()
            ->where('budget_year_id', $budgetYear->id)
            ->when($categoryFilter, fn ($q) => $q->where('category_id', $categoryFilter))
            ->get()
            ->keyBy('category_id');

        $realisasiQuery = RevenueRealization::query()
            ->where('budget_year_id', $budgetYear->id)
            ->whereYear('tanggal', $budgetYear->tahun);

        if ($bulan) {
            $realisasiQuery->whereMonth('tanggal', $bulan);
        }
        if ($categoryFilter) {
            $realisasiQuery->where('category_id', $categoryFilter);
        }

        $realisasiMap = $realisasiQuery
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $rows = [];
        $totals = ['target' => 0.0, 'rencana' => 0.0, 'realisasi' => 0.0];

        foreach (RevenueCategories::all() as $category) {
            if ($categoryFilter && $category['id'] !== $categoryFilter) {
                continue;
            }

            $record = $targets->get($category['id']);
            $target = $record
                ? (float) $record->target_amount + (float) $record->pergeseran_amount + (float) $record->perubahan_amount
                : 0.0;
            $rencana = $record ? (float) $record->plan_amount : 0.0;
            $realisasi = (float) ($realisasiMap[$category['id']] ?? 0);
            $selisihRencana = $realisasi - $rencana;
            $capaianRencana = $rencana > 0 ? round(($realisasi / $rencana) * 100, 2) : null;
            $capaianTarget = $target > 0 ? round(($realisasi / $target) * 100, 2) : null;

            $totals['target'] += $target;
            $totals['rencana'] += $rencana;
            $totals['realisasi'] += $realisasi;

            $rows[] = [
                'category_id' => $category['id'],
                'kode' => $category['kode'],
                'label' => $category['label'],
                'target_amount' => $target,
                'rencana_amount' => $rencana,
                'realisasi_amount' => $realisasi,
                'selisih_rencana' => $selisihRencana,
                'capaian_rencana_pct' => $capaianRencana,
                'capaian_target_pct' => $capaianTarget,
            ];
        }

        $totalCapaianRencana = $totals['rencana'] > 0
            ? round(($totals['realisasi'] / $totals['rencana']) * 100, 2)
            : null;
        $totalCapaianTarget = $totals['target'] > 0
            ? round(($totals['realisasi'] / $totals['target']) * 100, 2)
            : null;

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'bulan' => $bulan,
                'total_target' => $totals['target'],
                'total_rencana' => $totals['rencana'],
                'total_realisasi' => $totals['realisasi'],
                'total_selisih_rencana' => $totals['realisasi'] - $totals['rencana'],
                'capaian_rencana_pct' => $totalCapaianRencana,
                'capaian_target_pct' => $totalCapaianTarget,
            ],
        ];
    }
}

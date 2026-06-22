<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueCategoryTarget;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RevenuePlanService
{
    /**
     * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, ready: bool}
     */
    public function list(int $budgetYearId): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($budgetYearId);
        $stored = RevenueCategoryTarget::query()
            ->where('budget_year_id', $budgetYearId)
            ->get()
            ->keyBy('category_id');

        $rows = [];
        $totalTarget = 0.0;
        $totalRencana = 0.0;
        $hasTarget = false;

        foreach (RevenueCategories::all() as $category) {
            $record = $stored->get($category['id']);
            $target = $this->menjadiAmount($record);
            $rencana = $record ? (float) $record->plan_amount : 0.0;

            if ($target > 0) {
                $hasTarget = true;
            }

            $totalTarget += $target;
            $totalRencana += $rencana;

            $rows[] = [
                'category_id' => $category['id'],
                'kode' => $category['kode'],
                'label' => $category['label'],
                'target_amount' => $target,
                'rencana_amount' => $rencana,
                'selisih_amount' => $rencana - $target,
            ];
        }

        return [
            'ready' => $hasTarget,
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'total_target' => $totalTarget,
                'total_rencana' => $totalRencana,
                'total_selisih' => $totalRencana - $totalTarget,
                'jumlah_kategori' => count($rows),
            ],
        ];
    }

    /**
     * @param  list<array{category_id: string, rencana_amount: float|int|string}>  $items
     * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, ready: bool}
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

                $amount = (float) $item['rencana_amount'];
                if ($amount < 0) {
                    throw ValidationException::withMessages([
                        'rencana_amount' => 'Rencana pendapatan tidak boleh negatif.',
                    ]);
                }

                $record = RevenueCategoryTarget::query()->firstOrNew([
                    'budget_year_id' => $budgetYearId,
                    'category_id' => $categoryId,
                ]);
                $record->plan_amount = $amount;
                $record->save();
            }
        });

        return $this->list($budgetYearId);
    }

    private function menjadiAmount(?RevenueCategoryTarget $record): float
    {
        if (! $record) {
            return 0.0;
        }

        return (float) $record->target_amount
            + (float) $record->pergeseran_amount
            + (float) $record->perubahan_amount;
    }
}

<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueCategoryTarget;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Validation\ValidationException;

class RevenueTargetService
{
    /**
     * @return array{rows: array<int, array<string, mixed>>, summary: array<string, mixed>}
     */
    public function list(int $budgetYearId): array
    {
        $year = BudgetYear::query()->findOrFail($budgetYearId);

        $saved = RevenueCategoryTarget::query()
            ->where('budget_year_id', $budgetYearId)
            ->get()
            ->keyBy('category_id');

        $rows = [];
        $total = 0.0;

        foreach (RevenueCategories::all() as $cat) {
            $amount = (float) ($saved[$cat['id']]->target_amount ?? 0);
            $total += $amount;
            $rows[] = [
                'category_id' => $cat['id'],
                'kode' => $cat['kode'],
                'label' => $cat['label'],
                'target_amount' => $amount,
            ];
        }

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $year->id,
                'tahun' => (int) $year->tahun,
                'total_target' => $total,
                'jumlah_kategori' => count($rows),
            ],
        ];
    }

    /**
     * @param  array<int, array{category_id: string, target_amount: float|string|int}>  $items
     */
    public function bulkUpsert(int $budgetYearId, array $items): array
    {
        BudgetYear::query()->findOrFail($budgetYearId);

        foreach ($items as $item) {
            $categoryId = (string) $item['category_id'];
            if (! RevenueCategories::isValid($categoryId)) {
                throw ValidationException::withMessages([
                    'category_id' => "Kategori pendapatan tidak valid: {$categoryId}",
                ]);
            }

            $amount = (float) $item['target_amount'];
            if ($amount < 0) {
                throw ValidationException::withMessages([
                    'target_amount' => 'Target pendapatan tidak boleh negatif.',
                ]);
            }

            RevenueCategoryTarget::query()->updateOrCreate(
                [
                    'budget_year_id' => $budgetYearId,
                    'category_id' => $categoryId,
                ],
                ['target_amount' => $amount]
            );
        }

        return $this->list($budgetYearId);
    }
}

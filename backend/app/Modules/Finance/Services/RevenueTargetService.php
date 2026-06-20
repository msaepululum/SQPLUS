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
            $row = $saved[$cat['id']] ?? null;
            $semula = (float) ($row?->target_amount ?? 0);
            $menjadi = $row?->corrected_amount !== null ? (float) $row->corrected_amount : $semula;
            $pergeseran = $menjadi - $semula;
            $perubahanPct = $semula > 0 ? ($pergeseran / $semula) * 100 : null;

            $total += $menjadi;
            $rows[] = [
                'category_id' => $cat['id'],
                'kode' => $cat['kode'],
                'label' => $cat['label'],
                'semula_amount' => $semula,
                'menjadi_amount' => $menjadi,
                'pergeseran_amount' => $pergeseran,
                'perubahan_pct' => $perubahanPct,
                'corrected_at' => $row?->corrected_at?->toIso8601String(),
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
     * @param  array<int, array{category_id: string, menjadi_amount: float|string|int}>  $items
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

            $menjadi = (float) $item['menjadi_amount'];
            if ($menjadi < 0) {
                throw ValidationException::withMessages([
                    'menjadi_amount' => 'Target pendapatan tidak boleh negatif.',
                ]);
            }

            /** @var RevenueCategoryTarget $target */
            $target = RevenueCategoryTarget::query()->firstOrCreate(
                [
                    'budget_year_id' => $budgetYearId,
                    'category_id' => $categoryId,
                ],
                ['target_amount' => 0]
            );

            // Semula selalu mengikuti nilai awal. Koreksi hanya boleh 1x per tahun.
            if ($target->corrected_amount === null) {
                if ((float) $target->target_amount === 0.0) {
                    // Belum pernah diisi → ini menjadi nilai semula.
                    $target->update(['target_amount' => $menjadi]);
                } elseif (abs((float) $target->target_amount - $menjadi) > 0.0001) {
                    // Sudah ada semula, dan berbeda → ini koreksi pertama.
                    $target->update([
                        'corrected_amount' => $menjadi,
                        'corrected_at' => now(),
                    ]);
                }
            } else {
                // Sudah pernah dikoreksi → tidak boleh diubah lagi.
                if (abs((float) $target->corrected_amount - $menjadi) > 0.0001) {
                    throw ValidationException::withMessages([
                        'menjadi_amount' => 'Koreksi target pendapatan hanya boleh dilakukan 1x dalam tahun berjalan.',
                    ]);
                }
            }
        }

        return $this->list($budgetYearId);
    }
}

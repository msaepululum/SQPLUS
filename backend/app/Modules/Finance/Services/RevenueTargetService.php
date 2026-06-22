<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueCategoryTarget;
use App\Modules\Finance\Models\RevenueYearSetup;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RevenueTargetService
{
    /**
     * @return array{setup: array<string, mixed>, rows: list<array<string, mixed>>, summary: array<string, mixed>}
     */
    public function list(int $budgetYearId): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($budgetYearId);
        $setup = $this->resolveSetup($budgetYearId);
        $stored = RevenueCategoryTarget::query()
            ->where('budget_year_id', $budgetYearId)
            ->get()
            ->keyBy('category_id');

        $rows = [];
        $totalMenjadi = 0.0;

        foreach (RevenueCategories::all() as $category) {
            $record = $stored->get($category['id']);
            $semula = $record ? (float) $record->target_amount : 0.0;
            $pergeseran = $record ? (float) $record->pergeseran_amount : 0.0;
            $perubahan = $record ? (float) $record->perubahan_amount : 0.0;
            $menjadi = $semula + $pergeseran + $perubahan;
            $totalMenjadi += $menjadi;

            $rows[] = [
                'category_id' => $category['id'],
                'kode' => $category['kode'],
                'label' => $category['label'],
                'semula_amount' => $semula,
                'pergeseran_amount' => $pergeseran,
                'perubahan_amount' => $perubahan,
                'menjadi_amount' => $menjadi,
                'perubahan_pct' => $this->computePerubahanPct($semula, $pergeseran, $perubahan),
            ];
        }

        return [
            'setup' => $this->formatSetup($setup),
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'total_target' => $totalMenjadi,
                'total_semula' => array_sum(array_column($rows, 'semula_amount')),
                'total_pergeseran' => array_sum(array_column($rows, 'pergeseran_amount')),
                'total_perubahan' => array_sum(array_column($rows, 'perubahan_amount')),
                'jumlah_kategori' => count($rows),
            ],
        ];
    }

    /**
     * @param  list<array{category_id: string, amount: float|int|string}>  $items
     * @return array{setup: array<string, mixed>, rows: list<array<string, mixed>>, summary: array<string, mixed>}
     */
    public function bulkUpsert(int $budgetYearId, string $phase, array $items): array
    {
        $setup = $this->resolveSetup($budgetYearId);
        $this->assertPhaseWritable($setup, $phase);

        $validIds = RevenueCategories::ids();

        DB::transaction(function () use ($budgetYearId, $phase, $items, $validIds): void {
            foreach ($items as $item) {
                $categoryId = (string) $item['category_id'];
                if (! in_array($categoryId, $validIds, true)) {
                    throw ValidationException::withMessages([
                        'items' => ["Kategori pendapatan tidak valid: {$categoryId}."],
                    ]);
                }

                $amount = (float) $item['amount'];
                $record = RevenueCategoryTarget::query()->firstOrNew([
                    'budget_year_id' => $budgetYearId,
                    'category_id' => $categoryId,
                ]);

                if ($phase === RevenueYearSetup::STATUS_SEMULA) {
                    $record->target_amount = $amount;
                } elseif ($phase === RevenueYearSetup::STATUS_PERGESERAN) {
                    $record->pergeseran_amount = $amount;
                } else {
                    $record->perubahan_amount = $amount;
                }

                $record->save();
            }
        });

        return $this->list($budgetYearId);
    }

    /**
     * @return array{setup: array<string, mixed>, rows: list<array<string, mixed>>, summary: array<string, mixed>}
     */
    public function advanceStatus(int $budgetYearId): array
    {
        $setup = $this->resolveSetup($budgetYearId);

        DB::transaction(function () use ($setup, $budgetYearId): void {
            if ($setup->setup_status === RevenueYearSetup::STATUS_SEMULA) {
                $this->assertAllSemulaFilled($budgetYearId);
                $setup->setup_status = RevenueYearSetup::STATUS_PERGESERAN;
                $setup->semula_locked_at = now();
                $setup->pergeseran_opened_at = now();
            } elseif ($setup->setup_status === RevenueYearSetup::STATUS_PERGESERAN) {
                $setup->setup_status = RevenueYearSetup::STATUS_PERUBAHAN;
                $setup->perubahan_opened_at = now();
            } else {
                throw ValidationException::withMessages([
                    'setup_status' => ['Tahap setup sudah selesai.'],
                ]);
            }

            $setup->save();
        });

        return $this->list($budgetYearId);
    }

    private function resolveSetup(int $budgetYearId): RevenueYearSetup
    {
        return RevenueYearSetup::query()->firstOrCreate(
            ['budget_year_id' => $budgetYearId],
            ['setup_status' => RevenueYearSetup::STATUS_SEMULA]
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function formatSetup(RevenueYearSetup $setup): array
    {
        return [
            'setup_status' => $setup->setup_status,
            'semula_locked_at' => $setup->semula_locked_at?->toIso8601String(),
            'pergeseran_opened_at' => $setup->pergeseran_opened_at?->toIso8601String(),
            'perubahan_opened_at' => $setup->perubahan_opened_at?->toIso8601String(),
            'can_edit_semula' => $setup->setup_status === RevenueYearSetup::STATUS_SEMULA,
            'can_edit_pergeseran' => $setup->setup_status === RevenueYearSetup::STATUS_PERGESERAN,
            'can_edit_perubahan' => $setup->setup_status === RevenueYearSetup::STATUS_PERUBAHAN,
            'can_advance' => in_array($setup->setup_status, [
                RevenueYearSetup::STATUS_SEMULA,
                RevenueYearSetup::STATUS_PERGESERAN,
            ], true),
            'next_status_label' => match ($setup->setup_status) {
                RevenueYearSetup::STATUS_SEMULA => 'Pergeseran',
                RevenueYearSetup::STATUS_PERGESERAN => 'Perubahan',
                default => null,
            },
        ];
    }

    private function assertPhaseWritable(RevenueYearSetup $setup, string $phase): void
    {
        $allowed = match ($phase) {
            RevenueYearSetup::STATUS_SEMULA => RevenueYearSetup::STATUS_SEMULA,
            RevenueYearSetup::STATUS_PERGESERAN => RevenueYearSetup::STATUS_PERGESERAN,
            RevenueYearSetup::STATUS_PERUBAHAN => RevenueYearSetup::STATUS_PERUBAHAN,
            default => null,
        };

        if ($allowed === null || $setup->setup_status !== $allowed) {
            throw ValidationException::withMessages([
                'phase' => ['Tahap ini belum dibuka atau sudah terkunci.'],
            ]);
        }
    }

    private function assertAllSemulaFilled(int $budgetYearId): void
    {
        $stored = RevenueCategoryTarget::query()
            ->where('budget_year_id', $budgetYearId)
            ->get()
            ->keyBy('category_id');

        foreach (RevenueCategories::all() as $category) {
            $record = $stored->get($category['id']);
            if (! $record || (float) $record->target_amount <= 0) {
                throw ValidationException::withMessages([
                    'items' => ['Semua kategori harus memiliki target semula sebelum membuka tahap pergeseran.'],
                ]);
            }
        }
    }

    private function computePerubahanPct(float $semula, float $pergeseran, float $perubahan): ?float
    {
        if ($semula <= 0) {
            return null;
        }

        return round((($pergeseran + $perubahan) / $semula) * 100, 2);
    }
}

<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueRealization;
use App\Modules\Finance\Models\RevenueReconciliation;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RevenueReconciliationService
{
    private const BULAN_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    /**
     * @param  array{budget_year_id: int, bulan?: int}  $filters
     */
    public function list(array $filters): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : (int) date('n');

        $this->syncOperasional($budgetYear->id, $bulan);

        $stored = RevenueReconciliation::query()
            ->where('budget_year_id', $budgetYear->id)
            ->where('bulan', $bulan)
            ->get()
            ->keyBy('category_id');

        $rows = [];
        $totals = ['operasional' => 0.0, 'akuntansi' => 0.0, 'selisih' => 0.0];
        $belum = 0;
        $sesuai = 0;
        $selisih = 0;

        foreach (RevenueCategories::all() as $category) {
            $record = $stored->get($category['id']);
            $operasional = $record ? (float) $record->operasional_amount : 0.0;
            $akuntansi = $record ? (float) $record->akuntansi_amount : 0.0;
            $diff = $akuntansi - $operasional;
            $status = $record?->status ?? RevenueReconciliation::STATUS_BELUM;

            if ($status === RevenueReconciliation::STATUS_BELUM) {
                $belum++;
            } elseif ($status === RevenueReconciliation::STATUS_SESUAI) {
                $sesuai++;
            } else {
                $selisih++;
            }

            $totals['operasional'] += $operasional;
            $totals['akuntansi'] += $akuntansi;
            $totals['selisih'] += $diff;

            $rows[] = [
                'id' => $record?->id,
                'category_id' => $category['id'],
                'kode' => $category['kode'],
                'label' => $category['label'],
                'bulan' => $bulan,
                'nama_bulan' => self::BULAN_LABELS[$bulan],
                'operasional_amount' => $operasional,
                'akuntansi_amount' => $akuntansi,
                'selisih_amount' => $diff,
                'status' => $status,
                'catatan' => $record?->catatan,
            ];
        }

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'bulan' => $bulan,
                'nama_bulan' => self::BULAN_LABELS[$bulan],
                'total_operasional' => $totals['operasional'],
                'total_akuntansi' => $totals['akuntansi'],
                'total_selisih' => $totals['selisih'],
                'jumlah_belum' => $belum,
                'jumlah_sesuai' => $sesuai,
                'jumlah_selisih' => $selisih,
            ],
        ];
    }

    /**
     * @param  list<array{id?: int|null, category_id: string, akuntansi_amount: float|int|string, status?: string, catatan?: string|null}>  $items
     */
    public function bulkUpdate(int $budgetYearId, int $bulan, array $items): array
    {
        BudgetYear::query()->findOrFail($budgetYearId);

        if ($bulan < 1 || $bulan > 12) {
            throw ValidationException::withMessages([
                'bulan' => ['Bulan tidak valid.'],
            ]);
        }

        DB::transaction(function () use ($budgetYearId, $bulan, $items): void {
            $this->syncOperasional($budgetYearId, $bulan);

            foreach ($items as $item) {
                if (! RevenueCategories::isValid($item['category_id'])) {
                    continue;
                }

                $record = RevenueReconciliation::query()->firstOrNew([
                    'budget_year_id' => $budgetYearId,
                    'category_id' => $item['category_id'],
                    'bulan' => $bulan,
                ]);

                $akuntansi = (float) $item['akuntansi_amount'];
                $operasional = (float) $record->operasional_amount;
                $status = $item['status'] ?? $this->resolveStatus($operasional, $akuntansi);

                $record->akuntansi_amount = $akuntansi;
                $record->status = $status;
                if (array_key_exists('catatan', $item)) {
                    $record->catatan = $item['catatan'];
                }
                $record->save();
            }
        });

        return $this->list(['budget_year_id' => $budgetYearId, 'bulan' => $bulan]);
    }

    private function syncOperasional(int $budgetYearId, int $bulan): void
    {
        $budgetYear = BudgetYear::query()->findOrFail($budgetYearId);

        $operasionalMap = RevenueRealization::query()
            ->where('budget_year_id', $budgetYearId)
            ->whereYear('tanggal', $budgetYear->tahun)
            ->whereMonth('tanggal', $bulan)
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        foreach (RevenueCategories::all() as $category) {
            $amount = (float) ($operasionalMap[$category['id']] ?? 0);

            $record = RevenueReconciliation::query()->firstOrNew([
                'budget_year_id' => $budgetYearId,
                'category_id' => $category['id'],
                'bulan' => $bulan,
            ]);

            $record->operasional_amount = $amount;

            if ($record->exists && $record->akuntansi_amount > 0) {
                $record->status = $this->resolveStatus($amount, (float) $record->akuntansi_amount);
            } elseif (! $record->exists) {
                $record->status = RevenueReconciliation::STATUS_BELUM;
            }

            $record->save();
        }
    }

    private function resolveStatus(float $operasional, float $akuntansi): string
    {
        if ($akuntansi <= 0 && $operasional <= 0) {
            return RevenueReconciliation::STATUS_BELUM;
        }

        if (abs($akuntansi - $operasional) < 0.01) {
            return RevenueReconciliation::STATUS_SESUAI;
        }

        return RevenueReconciliation::STATUS_SELISIH;
    }
}

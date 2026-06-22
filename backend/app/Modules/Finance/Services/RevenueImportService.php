<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueImportBatch;
use App\Modules\Finance\Models\RevenueRealization;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Support\Facades\DB;

class RevenueImportService
{
    public function list(int $budgetYearId): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($budgetYearId);

        $rows = RevenueImportBatch::query()
            ->where('budget_year_id', $budgetYearId)
            ->orderByDesc('imported_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (RevenueImportBatch $batch) => [
                'id' => $batch->id,
                'source_system' => $batch->source_system,
                'periode_from' => $batch->periode_from->format('Y-m-d'),
                'periode_to' => $batch->periode_to->format('Y-m-d'),
                'status' => $batch->status,
                'total_rows' => $batch->total_rows,
                'total_amount' => (float) $batch->total_amount,
                'message' => $batch->message,
                'imported_at' => $batch->imported_at?->toIso8601String(),
            ])
            ->all();

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'jumlah_batch' => count($rows),
                'total_imported' => array_sum(array_column($rows, 'total_amount')),
            ],
        ];
    }

    /**
     * @param  array{budget_year_id: int, source_system?: string, periode_from: string, periode_to: string}  $data
     */
    public function runImport(array $data): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($data['budget_year_id']);

        $batch = RevenueImportBatch::query()->create([
            'budget_year_id' => $budgetYear->id,
            'source_system' => $data['source_system'] ?? 'billing',
            'periode_from' => $data['periode_from'],
            'periode_to' => $data['periode_to'],
            'status' => RevenueImportBatch::STATUS_PROCESSING,
        ]);

        return DB::transaction(function () use ($batch, $data) {
            $imported = $this->pullFromBilling($batch, $data);

            $batch->update([
                'status' => RevenueImportBatch::STATUS_COMPLETED,
                'total_rows' => $imported['rows'],
                'total_amount' => $imported['amount'],
                'message' => $imported['message'],
                'imported_at' => now(),
            ]);

            return [
                'batch' => [
                    'id' => $batch->id,
                    'source_system' => $batch->source_system,
                    'periode_from' => $batch->periode_from->format('Y-m-d'),
                    'periode_to' => $batch->periode_to->format('Y-m-d'),
                    'status' => $batch->status,
                    'total_rows' => $batch->total_rows,
                    'total_amount' => (float) $batch->total_amount,
                    'message' => $batch->message,
                    'imported_at' => $batch->imported_at?->toIso8601String(),
                ],
                'list' => $this->list($batch->budget_year_id),
            ];
        });
    }

    /**
     * @param  array{budget_year_id: int, periode_from: string, periode_to: string}  $data
     * @return array{rows: int, amount: float, message: string}
     */
    private function pullFromBilling(RevenueImportBatch $batch, array $data): array
    {
        // Hook integrasi billing — saat ini belum ada mapping tabel eksternal.
        // Struktur siap menerima data per kategori BLU ketika koneksi billing tersedia.
        $existing = RevenueRealization::query()
            ->where('budget_year_id', $data['budget_year_id'])
            ->where('source', RevenueRealization::SOURCE_IMPORT)
            ->whereDate('tanggal', '>=', $data['periode_from'])
            ->whereDate('tanggal', '<=', $data['periode_to'])
            ->delete();

        unset($existing);

        $message = 'Integrasi billing belum terhubung. Gunakan Input Manual untuk entri realisasi per kategori BLU.';

        return [
            'rows' => 0,
            'amount' => 0.0,
            'message' => $message,
        ];
    }

    /**
     * @param  list<array{category_id: string, tanggal: string, amount: float|int|string, reference_note?: string|null}>  $items
     */
    public function importItems(int $budgetYearId, string $periodeFrom, string $periodeTo, array $items): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($budgetYearId);

        return DB::transaction(function () use ($budgetYear, $periodeFrom, $periodeTo, $items) {
            $batch = RevenueImportBatch::query()->create([
                'budget_year_id' => $budgetYear->id,
                'source_system' => 'file',
                'periode_from' => $periodeFrom,
                'periode_to' => $periodeTo,
                'status' => RevenueImportBatch::STATUS_PROCESSING,
            ]);

            $totalAmount = 0.0;
            $count = 0;

            foreach ($items as $item) {
                if (! RevenueCategories::isValid($item['category_id'])) {
                    continue;
                }

                RevenueRealization::query()->create([
                    'budget_year_id' => $budgetYear->id,
                    'category_id' => $item['category_id'],
                    'tanggal' => $item['tanggal'],
                    'amount' => $item['amount'],
                    'source' => RevenueRealization::SOURCE_IMPORT,
                    'reference_note' => $item['reference_note'] ?? null,
                    'import_batch_id' => $batch->id,
                ]);

                $totalAmount += (float) $item['amount'];
                $count++;
            }

            $batch->update([
                'status' => RevenueImportBatch::STATUS_COMPLETED,
                'total_rows' => $count,
                'total_amount' => $totalAmount,
                'message' => "{$count} baris berhasil diimpor.",
                'imported_at' => now(),
            ]);

            return [
                'batch' => [
                    'id' => $batch->id,
                    'total_rows' => $count,
                    'total_amount' => $totalAmount,
                    'message' => $batch->message,
                ],
                'list' => $this->list($budgetYear->id),
            ];
        });
    }
}

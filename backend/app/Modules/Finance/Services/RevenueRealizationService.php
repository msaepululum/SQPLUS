<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\RevenueRealization;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RevenueRealizationService
{
    private const BULAN_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    /**
     * @param  array{budget_year_id: int, category_id?: string, tanggal_from?: string, tanggal_to?: string, source?: string}  $filters
     */
    public function list(array $filters): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($filters['budget_year_id']);

        $query = RevenueRealization::query()
            ->where('budget_year_id', $budgetYear->id)
            ->orderByDesc('tanggal')
            ->orderByDesc('id');

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (! empty($filters['tanggal_from'])) {
            $query->whereDate('tanggal', '>=', $filters['tanggal_from']);
        }
        if (! empty($filters['tanggal_to'])) {
            $query->whereDate('tanggal', '<=', $filters['tanggal_to']);
        }
        if (! empty($filters['source'])) {
            $query->where('source', $filters['source']);
        }

        $rows = $query->get()->map(fn (RevenueRealization $row) => $this->formatRow($row))->all();

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'jumlah_baris' => count($rows),
                'total_realisasi' => array_sum(array_column($rows, 'amount')),
            ],
        ];
    }

    /**
     * @param  array{budget_year_id: int, category_id: string, tanggal: string, amount: float|int|string, reference_note?: string|null}  $data
     */
    public function create(array $data): array
    {
        $this->assertValidCategory($data['category_id']);
        BudgetYear::query()->findOrFail($data['budget_year_id']);

        $row = RevenueRealization::query()->create([
            'budget_year_id' => $data['budget_year_id'],
            'category_id' => $data['category_id'],
            'tanggal' => $data['tanggal'],
            'amount' => $data['amount'],
            'source' => RevenueRealization::SOURCE_MANUAL,
            'reference_note' => $data['reference_note'] ?? null,
        ]);

        return $this->formatRow($row);
    }

    /**
     * @param  array{category_id?: string, tanggal?: string, amount?: float|int|string, reference_note?: string|null}  $data
     */
    public function update(int $id, array $data): array
    {
        $row = RevenueRealization::query()->findOrFail($id);

        if ($row->source !== RevenueRealization::SOURCE_MANUAL) {
            throw ValidationException::withMessages([
                'id' => ['Data hasil import tidak dapat diubah.'],
            ]);
        }

        if (isset($data['category_id'])) {
            $this->assertValidCategory($data['category_id']);
            $row->category_id = $data['category_id'];
        }
        if (isset($data['tanggal'])) {
            $row->tanggal = $data['tanggal'];
        }
        if (isset($data['amount'])) {
            $row->amount = $data['amount'];
        }
        if (array_key_exists('reference_note', $data)) {
            $row->reference_note = $data['reference_note'];
        }

        $row->save();

        return $this->formatRow($row);
    }

    public function delete(int $id): void
    {
        $row = RevenueRealization::query()->findOrFail($id);

        if ($row->source !== RevenueRealization::SOURCE_MANUAL) {
            throw ValidationException::withMessages([
                'id' => ['Data hasil import tidak dapat dihapus.'],
            ]);
        }

        $row->delete();
    }

    /**
     * @param  array{budget_year_id: int, tanggal_from?: string, tanggal_to?: string, category_id?: string}  $filters
     */
    public function recapHarian(array $filters): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $from = $filters['tanggal_from'] ?? "{$budgetYear->tahun}-01-01";
        $to = $filters['tanggal_to'] ?? "{$budgetYear->tahun}-12-31";

        $query = RevenueRealization::query()
            ->where('budget_year_id', $budgetYear->id)
            ->whereDate('tanggal', '>=', $from)
            ->whereDate('tanggal', '<=', $to);

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        $aggregated = $query
            ->select('tanggal', 'category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('tanggal', 'category_id')
            ->orderBy('tanggal')
            ->get();

        $byDate = [];
        foreach ($aggregated as $item) {
            $date = $item->tanggal->format('Y-m-d');
            $byDate[$date][$item->category_id] = (float) $item->total;
        }

        $rows = [];
        $categoryTotals = array_fill_keys(RevenueCategories::ids(), 0.0);
        $grandTotal = 0.0;

        foreach ($byDate as $tanggal => $categories) {
            $row = [
                'tanggal' => $tanggal,
                'categories' => [],
                'total' => 0.0,
            ];

            foreach (RevenueCategories::all() as $category) {
                if (! empty($filters['category_id']) && $category['id'] !== $filters['category_id']) {
                    continue;
                }
                $amount = (float) ($categories[$category['id']] ?? 0);
                $row['categories'][] = [
                    'category_id' => $category['id'],
                    'kode' => $category['kode'],
                    'label' => $category['label'],
                    'amount' => $amount,
                ];
                $row['total'] += $amount;
                $categoryTotals[$category['id']] += $amount;
            }

            $grandTotal += $row['total'];
            $rows[] = $row;
        }

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'tanggal_from' => $from,
                'tanggal_to' => $to,
                'jumlah_hari' => count($rows),
                'total_realisasi' => $grandTotal,
                'per_kategori' => array_map(
                    fn (array $category) => [
                        'category_id' => $category['id'],
                        'kode' => $category['kode'],
                        'label' => $category['label'],
                        'amount' => $categoryTotals[$category['id']],
                    ],
                    RevenueCategories::all()
                ),
            ],
        ];
    }

    /**
     * @param  array{budget_year_id: int, bulan?: int, category_id?: string}  $filters
     */
    public function recapBulanan(array $filters): array
    {
        $budgetYear = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $bulanFilter = isset($filters['bulan']) ? (int) $filters['bulan'] : null;

        $query = RevenueRealization::query()
            ->where('budget_year_id', $budgetYear->id)
            ->whereYear('tanggal', $budgetYear->tahun);

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        $aggregated = $query
            ->select(
                DB::raw('MONTH(tanggal) as bulan'),
                'category_id',
                DB::raw('SUM(amount) as total')
            )
            ->groupBy(DB::raw('MONTH(tanggal)'), 'category_id')
            ->orderBy('bulan')
            ->get();

        $byMonth = [];
        foreach ($aggregated as $item) {
            $byMonth[(int) $item->bulan][$item->category_id] = (float) $item->total;
        }

        $months = $bulanFilter ? [$bulanFilter] : range(1, 12);
        $rows = [];
        $categoryTotals = array_fill_keys(RevenueCategories::ids(), 0.0);
        $grandTotal = 0.0;

        foreach ($months as $bulan) {
            $categories = $byMonth[$bulan] ?? [];
            $row = [
                'bulan' => $bulan,
                'nama_bulan' => self::BULAN_LABELS[$bulan],
                'categories' => [],
                'total' => 0.0,
            ];

            foreach (RevenueCategories::all() as $category) {
                if (! empty($filters['category_id']) && $category['id'] !== $filters['category_id']) {
                    continue;
                }
                $amount = (float) ($categories[$category['id']] ?? 0);
                $row['categories'][] = [
                    'category_id' => $category['id'],
                    'kode' => $category['kode'],
                    'label' => $category['label'],
                    'amount' => $amount,
                ];
                $row['total'] += $amount;
                $categoryTotals[$category['id']] += $amount;
            }

            $grandTotal += $row['total'];
            $rows[] = $row;
        }

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $budgetYear->id,
                'tahun' => (int) $budgetYear->tahun,
                'total_realisasi' => $grandTotal,
                'per_kategori' => array_map(
                    fn (array $category) => [
                        'category_id' => $category['id'],
                        'kode' => $category['kode'],
                        'label' => $category['label'],
                        'amount' => $categoryTotals[$category['id']],
                    ],
                    RevenueCategories::all()
                ),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatRow(RevenueRealization $row): array
    {
        $category = collect(RevenueCategories::all())->firstWhere('id', $row->category_id);

        return [
            'id' => $row->id,
            'budget_year_id' => $row->budget_year_id,
            'category_id' => $row->category_id,
            'kode' => $category['kode'] ?? '',
            'label' => $category['label'] ?? $row->category_id,
            'tanggal' => $row->tanggal->format('Y-m-d'),
            'amount' => (float) $row->amount,
            'source' => $row->source,
            'reference_note' => $row->reference_note,
            'import_batch_id' => $row->import_batch_id,
        ];
    }

    private function assertValidCategory(string $categoryId): void
    {
        if (! RevenueCategories::isValid($categoryId)) {
            throw ValidationException::withMessages([
                'category_id' => ['Kategori pendapatan tidak valid.'],
            ]);
        }
    }
}

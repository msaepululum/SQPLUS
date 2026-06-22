<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Services\AccountingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountingController extends Controller
{
    public function __construct(
        private readonly AccountingService $service
    ) {}

    public function meta(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'budget_year_id' => ['nullable', 'integer', 'exists:budget_years,id'],
        ]);

        return response()->json([
            'data' => $this->service->meta($validated['budget_year_id'] ?? null),
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->dashboard($this->yearFilters($request))]);
    }

    public function coa(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'budget_year_id' => ['nullable', 'integer', 'exists:budget_years,id'],
            'search' => ['nullable', 'string', 'max:120'],
            'kelompok' => ['nullable', 'string', 'max:5'],
            'detail_only' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);

        return response()->json([
            'data' => $this->service->coa([
                'tahun' => $this->resolveTahun($validated['budget_year_id'] ?? null),
                'search' => $validated['search'] ?? null,
                'kelompok' => $validated['kelompok'] ?? null,
                'detail_only' => (bool) ($validated['detail_only'] ?? false),
                'page' => $validated['page'] ?? 1,
                'per_page' => $validated['per_page'] ?? 25,
            ]),
        ]);
    }

    public function mappingAkun(): JsonResponse
    {
        return response()->json(['data' => $this->service->mappingAkun()]);
    }

    public function jurnalUmum(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->jurnalUmum($this->listFilters($request))]);
    }

    public function jurnalOtomatis(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->jurnalOtomatis($this->listFilters($request, true))]);
    }

    public function postingJurnal(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->postingJurnal($this->listFilters($request))]);
    }

    public function bukuBesar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'account_no' => ['nullable', 'string', 'max:40'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);

        $year = BudgetYear::query()->findOrFail($validated['budget_year_id']);

        return response()->json([
            'data' => $this->service->bukuBesar([
                'tahun' => (int) $year->tahun,
                'bulan' => $validated['bulan'] ?? null,
                'account_no' => $validated['account_no'] ?? null,
                'search' => $validated['search'] ?? null,
                'page' => $validated['page'] ?? 1,
                'per_page' => $validated['per_page'] ?? 25,
            ]),
        ]);
    }

    public function neraca(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->neraca($this->yearFilters($request))]);
    }

    public function laporanOperasional(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->laporanOperasional($this->yearFilters($request))]);
    }

    public function arusKas(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->arusKas($this->yearFilters($request))]);
    }

    public function perubahanEkuitas(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->perubahanEkuitas($this->yearFilters($request))]);
    }

    public function tutupBuku(): JsonResponse
    {
        return response()->json(['data' => $this->service->tutupBuku()]);
    }

    /**
     * @return array{tahun: int, bulan?: int|null}
     */
    private function yearFilters(Request $request): array
    {
        $validated = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $year = BudgetYear::query()->findOrFail($validated['budget_year_id']);

        return [
            'tahun' => (int) $year->tahun,
            'bulan' => $validated['bulan'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function listFilters(Request $request, bool $withJournalType = false): array
    {
        $rules = [
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ];

        if ($withJournalType) {
            $rules['journal_type'] = ['nullable', 'string', 'max:10'];
        }

        $validated = $request->validate($rules, [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $year = BudgetYear::query()->findOrFail($validated['budget_year_id']);

        return [
            'tahun' => (int) $year->tahun,
            'bulan' => $validated['bulan'] ?? null,
            'search' => $validated['search'] ?? null,
            'journal_type' => $validated['journal_type'] ?? null,
            'page' => $validated['page'] ?? 1,
            'per_page' => $validated['per_page'] ?? 20,
        ];
    }

    private function resolveTahun(?int $budgetYearId): int
    {
        if (! $budgetYearId) {
            return (int) date('Y');
        }

        $year = BudgetYear::query()->find($budgetYearId);

        return $year ? (int) $year->tahun : (int) date('Y');
    }
}

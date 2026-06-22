<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\CashSaldoRekapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashSaldoRekapController extends Controller
{
    public function __construct(
        private readonly CashSaldoRekapService $service
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

    public function posisiSaldo(Request $request): JsonResponse
    {
        $filters = $this->validatedFilters($request);

        return response()->json(['data' => $this->service->posisiSaldo($filters)]);
    }

    public function rekapBulanan(Request $request): JsonResponse
    {
        $filters = $this->validatedFilters($request);

        return response()->json(['data' => $this->service->rekapBulanan($filters)]);
    }

    public function bukuKasBesar(Request $request): JsonResponse
    {
        $filters = $this->validatedFilters($request, true);

        return response()->json(['data' => $this->service->bukuKasBesar($filters)]);
    }

    public function proyeksiCashflow(Request $request): JsonResponse
    {
        $filters = $this->validatedFilters($request);

        return response()->json(['data' => $this->service->proyeksiCashflow($filters)]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedFilters(Request $request, bool $withPagination = false): array
    {
        $rules = [
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'kas_account_no' => ['nullable', 'string', 'max:50'],
            'search' => ['nullable', 'string', 'max:120'],
        ];

        if ($withPagination) {
            $rules['page'] = ['nullable', 'integer', 'min:1'];
            $rules['per_page'] = ['nullable', 'integer', 'min:10', 'max:100'];
        }

        $validated = $request->validate($rules, [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $year = \App\Modules\Finance\Models\BudgetYear::query()->findOrFail($validated['budget_year_id']);

        return [
            'tahun' => (int) $year->tahun,
            'bulan' => $validated['bulan'] ?? null,
            'kas_account_no' => $validated['kas_account_no'] ?? null,
            'search' => $validated['search'] ?? null,
            'page' => $validated['page'] ?? 1,
            'per_page' => $validated['per_page'] ?? 20,
        ];
    }
}

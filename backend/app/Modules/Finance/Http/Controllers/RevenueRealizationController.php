<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\RevenueRealizationService;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RevenueRealizationController extends Controller
{
    public function __construct(
        private readonly RevenueRealizationService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'category_id' => ['nullable', 'string', Rule::in(RevenueCategories::ids())],
            'tanggal_from' => ['nullable', 'date'],
            'tanggal_to' => ['nullable', 'date'],
            'source' => ['nullable', 'string', Rule::in(['manual', 'import'])],
        ]);

        $result = $this->service->list($filters);

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'category_id' => ['required', 'string', Rule::in(RevenueCategories::ids())],
            'tanggal' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0'],
            'reference_note' => ['nullable', 'string', 'max:255'],
        ]);

        $row = $this->service->create($data);

        return response()->json([
            'message' => 'Realisasi pendapatan berhasil disimpan.',
            'data' => $row,
        ], 201);
    }

    public function update(Request $request, int $revenueRealization): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['sometimes', 'string', Rule::in(RevenueCategories::ids())],
            'tanggal' => ['sometimes', 'date'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'reference_note' => ['nullable', 'string', 'max:255'],
        ]);

        $row = $this->service->update($revenueRealization, $data);

        return response()->json([
            'message' => 'Realisasi pendapatan berhasil diperbarui.',
            'data' => $row,
        ]);
    }

    public function destroy(int $revenueRealization): JsonResponse
    {
        $this->service->delete($revenueRealization);

        return response()->json(['message' => 'Realisasi pendapatan berhasil dihapus.']);
    }

    public function recapHarian(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'tanggal_from' => ['nullable', 'date'],
            'tanggal_to' => ['nullable', 'date'],
            'category_id' => ['nullable', 'string', Rule::in(RevenueCategories::ids())],
        ]);

        $result = $this->service->recapHarian($filters);

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function recapBulanan(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'category_id' => ['nullable', 'string', Rule::in(RevenueCategories::ids())],
        ]);

        $result = $this->service->recapBulanan($filters);

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }
}

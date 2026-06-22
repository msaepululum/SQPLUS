<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\RevenueMonthlyPlanService;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RevenueMonthlyPlanController extends Controller
{
    public function __construct(
        private readonly RevenueMonthlyPlanService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'category_id' => ['nullable', 'string', Rule::in(RevenueCategories::ids())],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->list([
            'budget_year_id' => (int) $filters['budget_year_id'],
            'category_id' => $filters['category_id'] ?? null,
        ]);

        return response()->json([
            'ready' => $result['ready'],
            'data' => $result['rows'],
            'summary' => $result['summary'],
            'bulan_labels' => $result['bulan_labels'],
        ]);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.category_id' => ['required', 'string', 'max:32'],
            'items.*.bulan' => ['required', 'integer', 'min:1', 'max:12'],
            'items.*.plan_amount' => ['required', 'numeric', 'min:0'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'items.required' => 'Tidak ada data distribusi untuk disimpan.',
        ]);

        $result = $this->service->bulkUpsert((int) $data['budget_year_id'], $data['items']);

        return response()->json([
            'message' => 'Distribusi bulanan berhasil disimpan.',
            'ready' => $result['ready'],
            'data' => $result['rows'],
            'summary' => $result['summary'],
            'bulan_labels' => $result['bulan_labels'],
        ]);
    }
}

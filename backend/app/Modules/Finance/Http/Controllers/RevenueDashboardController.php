<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\RevenueDashboardService;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RevenueDashboardController extends Controller
{
    public function __construct(
        private readonly RevenueDashboardService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'category_id' => ['nullable', 'string', Rule::in(RevenueCategories::ids())],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->dashboard($filters);

        return response()->json($result);
    }
}

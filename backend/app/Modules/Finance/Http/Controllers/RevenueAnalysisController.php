<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\RevenueAnalysisService;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RevenueAnalysisController extends Controller
{
    public function __construct(
        private readonly RevenueAnalysisService $service
    ) {}

    public function perKategori(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'category_id' => ['nullable', 'string', Rule::in(RevenueCategories::ids())],
        ]);

        $result = $this->service->perKategori($filters);

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }
}

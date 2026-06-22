<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\FinanceTaxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceTaxController extends Controller
{
    public function __construct(
        private readonly FinanceTaxService $service
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
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        return response()->json([
            'data' => $this->service->dashboard($filters),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'stage' => ['required', 'string', 'max:40'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        return response()->json($this->service->list(array_filter(
            $filters,
            fn ($v) => $v !== null && $v !== ''
        )));
    }
}

<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Services\KlaimJknService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KlaimJknController extends Controller
{
    public function __construct(
        private readonly KlaimJknService $service
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

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'status' => ['nullable', 'string', 'max:80'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $year = BudgetYear::query()->findOrFail($validated['budget_year_id']);

        return response()->json([
            'data' => $this->service->index([
                'tahun' => (int) $year->tahun,
                'status' => $validated['status'] ?? null,
                'search' => $validated['search'] ?? null,
                'page' => $validated['page'] ?? 1,
                'per_page' => $validated['per_page'] ?? 20,
            ]),
        ]);
    }
}

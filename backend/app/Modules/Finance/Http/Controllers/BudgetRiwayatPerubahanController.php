<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\BudgetRiwayatPerubahanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetRiwayatPerubahanController extends Controller
{
    public function __construct(
        private readonly BudgetRiwayatPerubahanService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'jenis' => ['nullable', 'string', 'in:revisi,pergeseran,blokir'],
            'status' => ['nullable', 'string', 'max:30'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->list(array_filter(
            $filters,
            fn ($v) => $v !== null && $v !== ''
        ));

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
            'meta' => $result['meta'],
        ]);
    }

    public function events(Request $request): JsonResponse
    {
        $data = $request->validate([
            'jenis' => ['required', 'string', 'in:revisi,pergeseran,blokir'],
            'ref_id' => ['required', 'integer'],
        ]);

        return response()->json([
            'data' => $this->service->events($data['jenis'], (int) $data['ref_id']),
        ]);
    }
}

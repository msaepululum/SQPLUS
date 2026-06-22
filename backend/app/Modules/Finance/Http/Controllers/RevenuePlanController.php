<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\RevenuePlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevenuePlanController extends Controller
{
    public function __construct(
        private readonly RevenuePlanService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->list((int) $filters['budget_year_id']);

        return response()->json([
            'ready' => $result['ready'],
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.category_id' => ['required', 'string', 'max:32'],
            'items.*.rencana_amount' => ['required', 'numeric', 'min:0'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'items.required' => 'Tidak ada data rencana untuk disimpan.',
        ]);

        $result = $this->service->bulkUpsert((int) $data['budget_year_id'], $data['items']);

        return response()->json([
            'message' => 'Rencana pendapatan berhasil disimpan.',
            'ready' => $result['ready'],
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }
}

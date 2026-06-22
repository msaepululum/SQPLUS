<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\RevenueYearSetup;
use App\Modules\Finance\Services\RevenueTargetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RevenueTargetController extends Controller
{
    public function __construct(
        private readonly RevenueTargetService $service
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
            'setup' => $result['setup'],
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'phase' => ['required', 'string', Rule::in([
                RevenueYearSetup::STATUS_SEMULA,
                RevenueYearSetup::STATUS_PERGESERAN,
                RevenueYearSetup::STATUS_PERUBAHAN,
            ])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.category_id' => ['required', 'string', 'max:32'],
            'items.*.amount' => ['required', 'numeric', 'min:0'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'items.required' => 'Tidak ada data target untuk disimpan.',
        ]);

        $result = $this->service->bulkUpsert(
            (int) $data['budget_year_id'],
            $data['phase'],
            $data['items']
        );

        return response()->json([
            'message' => 'Target pendapatan berhasil disimpan.',
            'setup' => $result['setup'],
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function advanceStatus(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->advanceStatus((int) $data['budget_year_id']);

        return response()->json([
            'message' => 'Tahap setup berhasil dibuka.',
            'setup' => $result['setup'],
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }
}

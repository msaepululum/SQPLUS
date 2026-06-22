<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\RevenueReconciliation;
use App\Modules\Finance\Services\RevenueReconciliationService;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RevenueReconciliationController extends Controller
{
    public function __construct(
        private readonly RevenueReconciliationService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $result = $this->service->list($filters);

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['required', 'integer', 'min:1', 'max:12'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.category_id' => ['required', 'string', Rule::in(RevenueCategories::ids())],
            'items.*.akuntansi_amount' => ['required', 'numeric', 'min:0'],
            'items.*.status' => ['nullable', 'string', Rule::in([
                RevenueReconciliation::STATUS_BELUM,
                RevenueReconciliation::STATUS_SESUAI,
                RevenueReconciliation::STATUS_SELISIH,
            ])],
            'items.*.catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $result = $this->service->bulkUpdate(
            (int) $data['budget_year_id'],
            (int) $data['bulan'],
            $data['items']
        );

        return response()->json([
            'message' => 'Rekonsiliasi berhasil disimpan.',
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }
}

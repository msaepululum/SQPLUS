<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\RevenueImportService;
use App\Modules\Finance\Support\RevenueCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RevenueImportController extends Controller
{
    public function __construct(
        private readonly RevenueImportService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
        ]);

        $result = $this->service->list((int) $filters['budget_year_id']);

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'source_system' => ['nullable', 'string', 'max:64'],
            'periode_from' => ['required', 'date'],
            'periode_to' => ['required', 'date', 'after_or_equal:periode_from'],
            'items' => ['nullable', 'array'],
            'items.*.category_id' => ['required_with:items', 'string', Rule::in(RevenueCategories::ids())],
            'items.*.tanggal' => ['required_with:items', 'date'],
            'items.*.amount' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.reference_note' => ['nullable', 'string', 'max:255'],
        ]);

        if (! empty($data['items'])) {
            $result = $this->service->importItems(
                (int) $data['budget_year_id'],
                $data['periode_from'],
                $data['periode_to'],
                $data['items']
            );
        } else {
            $result = $this->service->runImport($data);
        }

        return response()->json([
            'message' => $result['batch']['message'] ?? 'Import berhasil dijalankan.',
            'batch' => $result['batch'],
            'data' => $result['list']['rows'],
            'summary' => $result['list']['summary'],
        ]);
    }
}

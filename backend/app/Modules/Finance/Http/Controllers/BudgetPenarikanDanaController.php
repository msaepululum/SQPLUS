<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\BudgetPaguSetupService;
use App\Modules\Finance\Services\BudgetPenarikanDanaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetPenarikanDanaController extends Controller
{
    public function __construct(
        private readonly BudgetPenarikanDanaService $service,
        private readonly BudgetPaguSetupService $paguSetupService
    ) {}

    public function meta(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'tahun' => ['nullable', 'string', 'size:4'],
        ]);

        return response()->json([
            'data' => $this->paguSetupService->meta(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'ptk_id' => ['nullable', 'integer'],
            'kelompok_belanja_id' => ['nullable', 'integer'],
            'jenis_belanja_id' => ['nullable', 'integer'],
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
            'bulan_labels' => $result['bulan_labels'],
        ]);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.pagu_ksro_id' => ['required', 'integer'],
            'items.*.bulan' => ['required', 'integer', 'min:1', 'max:12'],
            'items.*.rencana_penarikan' => ['required', 'numeric', 'min:0'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'items.required' => 'Tidak ada data rencana untuk disimpan.',
        ]);

        $this->service->bulkUpsert((int) $data['budget_year_id'], $data['items']);

        return response()->json(['message' => 'Rencana penarikan dana berhasil disimpan.']);
    }
}

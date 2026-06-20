<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\BudgetMonitoringPaguService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetMonitoringPaguController extends Controller
{
    public function __construct(
        private readonly BudgetMonitoringPaguService $service
    ) {}

    public function meta(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->meta(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'ptk_id' => ['nullable', 'integer'],
            'kelompok_belanja_id' => ['nullable', 'integer'],
            'jenis_belanja_id' => ['nullable', 'integer'],
            'bulan_from' => ['nullable', 'integer', 'min:1', 'max:12'],
            'bulan_to' => ['nullable', 'integer', 'min:1', 'max:12'],
            'search' => ['nullable', 'string', 'max:120'],
            'view' => ['nullable', 'string', 'in:monitoring,sisa_pagu,per_unit,per_akun,komitmen'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->dashboard(array_filter(
            $filters,
            fn ($v) => $v !== null && $v !== ''
        ));

        return response()->json($result);
    }
}

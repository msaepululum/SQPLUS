<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Services\HutangPiutangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HutangPiutangController extends Controller
{
    public function __construct(
        private readonly HutangPiutangService $service
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
        return response()->json(['data' => $this->service->dashboard($this->filters($request))]);
    }

    public function hutangDaftar(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->hutangDaftar($this->filters($request, true))]);
    }

    public function hutangPerAkun(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->hutangPerAkun($this->filters($request))]);
    }

    public function piutangDaftar(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->piutangDaftar($this->filters($request, true))]);
    }

    public function piutangUmur(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->piutangUmur($this->filters($request))]);
    }

    public function rekonsiliasiHutang(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->rekonsiliasiHutang($this->filters($request, true))]);
    }

    public function rekonsiliasiPiutang(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->rekonsiliasiPiutang($this->filters($request, true))]);
    }

    public function riwayat(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->riwayat($this->filters($request, true))]);
    }

    /**
     * @return array<string, mixed>
     */
    private function filters(Request $request, bool $withPagination = false): array
    {
        $rules = [
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'jenis' => ['nullable', 'string', 'max:30'],
            'periode' => ['nullable', 'string', 'in:berjalan,sebelumnya'],
            'tipe' => ['nullable', 'string', 'in:hutang,piutang'],
            'search' => ['nullable', 'string', 'max:120'],
        ];

        if ($withPagination) {
            $rules['page'] = ['nullable', 'integer', 'min:1'];
            $rules['per_page'] = ['nullable', 'integer', 'min:10', 'max:100'];
        }

        $validated = $request->validate($rules, [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $year = BudgetYear::query()->findOrFail($validated['budget_year_id']);

        return [
            'tahun' => (int) $year->tahun,
            'bulan' => $validated['bulan'] ?? null,
            'jenis' => $validated['jenis'] ?? null,
            'periode' => $validated['periode'] ?? null,
            'tipe' => $validated['tipe'] ?? null,
            'search' => $validated['search'] ?? null,
            'page' => $validated['page'] ?? 1,
            'per_page' => $validated['per_page'] ?? 20,
        ];
    }
}

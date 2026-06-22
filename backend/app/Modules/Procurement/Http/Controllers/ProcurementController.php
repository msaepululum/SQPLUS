<?php

namespace App\Modules\Procurement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Procurement\Services\ProcurementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcurementController extends Controller
{
  public function __construct(
    private readonly ProcurementService $service
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
    ], [
      'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
    ]);

    return response()->json([
      'data' => $this->service->dashboard($filters),
    ]);
  }

  public function permintaan(Request $request): JsonResponse
  {
    $filters = $this->listFilters($request);
    $filters['queue'] = $request->validate([
      'queue' => ['nullable', 'string', 'in:antrian,close,all'],
    ])['queue'] ?? 'antrian';

    return response()->json($this->service->listPermintaan($filters));
  }

  public function negosiasi(Request $request): JsonResponse
  {
    return response()->json($this->service->listNegosiasi($this->listFilters($request)));
  }

  public function po(Request $request): JsonResponse
  {
    $filters = $this->listFilters($request);
    $filters['jenis'] = $request->validate([
      'jenis' => ['nullable', 'string', 'in:po,spk,kontrak,all'],
    ])['jenis'] ?? 'all';

    return response()->json($this->service->listPo($filters));
  }

  public function poDetail(string $noPo): JsonResponse
  {
    return response()->json([
      'data' => $this->service->poDetail($noPo),
    ]);
  }

  public function penerimaan(Request $request): JsonResponse
  {
    return response()->json($this->service->listPenerimaan($this->listFilters($request)));
  }

  public function penerimaanDetail(string $noBeli): JsonResponse
  {
    return response()->json([
      'data' => $this->service->penerimaanDetail($noBeli),
    ]);
  }

  public function vendor(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'search' => ['nullable', 'string', 'max:120'],
      'aktif' => ['nullable', 'string', 'in:aktif,nonaktif,all'],
      'page' => ['nullable', 'integer', 'min:1'],
      'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
    ]);

    return response()->json($this->service->listVendor(array_filter(
      $validated,
      fn ($v) => $v !== null && $v !== ''
    )));
  }

  public function monitoring(Request $request): JsonResponse
  {
    $filters = $this->listFilters($request);
    $filters['stage'] = $request->validate([
      'stage' => ['nullable', 'string', 'max:40'],
    ])['stage'] ?? null;

    return response()->json($this->service->listMonitoring($filters));
  }

  /**
   * @return array<string, mixed>
   */
  private function listFilters(Request $request): array
  {
    return $request->validate([
      'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
      'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
      'search' => ['nullable', 'string', 'max:120'],
      'page' => ['nullable', 'integer', 'min:1'],
      'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
    ], [
      'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
    ]);
  }
}

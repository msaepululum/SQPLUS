<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Services\BudgetBlokirAnggaranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetBlokirAnggaranController extends Controller
{
    public function __construct(
        private readonly BudgetBlokirAnggaranService $service
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
            'block_status' => ['nullable', 'string', 'in:aktif,sebagian,total'],
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

    public function histori(int $rbaId): JsonResponse
    {
        return response()->json([
            'data' => $this->service->histori($rbaId),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rba_id' => ['required', 'integer'],
            'block_type' => ['required', 'string', 'in:P,T,O'],
            'block_volume' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ], [
            'rba_id.required' => 'Komponen RBA wajib dipilih.',
            'block_type.required' => 'Jenis blokir wajib dipilih.',
        ]);

        $result = $this->service->storeBlock(
            (int) $data['rba_id'],
            $data,
            $this->actor($request)
        );

        return response()->json([
            'data' => $result['histori'],
            'message' => $result['block_status'],
        ], 201);
    }

    private function actor(Request $request): ?string
    {
        /** @var User|null $user */
        $user = $request->user();

        return $user?->no_absen ?? ($user ? (string) $user->id : null);
    }
}

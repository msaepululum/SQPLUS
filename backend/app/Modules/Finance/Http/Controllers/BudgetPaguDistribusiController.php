<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Services\BudgetPaguDistribusiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetPaguDistribusiController extends Controller
{
    public function __construct(
        private readonly BudgetPaguDistribusiService $service
    ) {}

    public function meta(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'tahun' => ['nullable', 'string', 'size:4'],
            'ptk_id' => ['nullable', 'integer'],
            'kelompok_belanja_id' => ['nullable', 'integer'],
            'jenis_belanja_id' => ['nullable', 'integer'],
        ]);

        return response()->json([
            'data' => $this->service->meta(array_filter(
                $filters,
                fn ($v) => $v !== null && $v !== ''
            )),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'tahun' => ['nullable', 'string', 'size:4'],
            'pagu_jenis_belanja_id' => ['nullable', 'integer'],
        ]);

        $result = $this->service->list(array_filter(
            $filters,
            fn ($v) => $v !== null && $v !== ''
        ));

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function show(int $budgetPaguDistribusi): JsonResponse
    {
        $row = $this->service->find($budgetPaguDistribusi);
        if (! $row) {
            return response()->json(['message' => 'Data distribusi pagu tidak ditemukan.'], 404);
        }

        return response()->json(['data' => $row]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pagu_jenis_belanja_id' => ['required', 'integer'],
            'ksro_id' => ['required', 'integer'],
            'total_pagu' => ['required', 'numeric', 'min:0'],
        ], [
            'pagu_jenis_belanja_id.required' => 'Pagu induk wajib dipilih.',
            'ksro_id.required' => 'KSRO wajib dipilih.',
            'total_pagu.required' => 'Pagu distribusi wajib diisi.',
            'total_pagu.min' => 'Pagu distribusi tidak boleh negatif.',
        ]);

        $row = $this->service->create($data, $this->actor($request));

        return response()->json([
            'data' => $this->service->find($row->id),
            'message' => 'Distribusi pagu berhasil ditambahkan.',
        ], 201);
    }

    public function update(Request $request, int $budgetPaguDistribusi): JsonResponse
    {
        $data = $request->validate([
            'total_pagu' => ['required', 'numeric', 'min:0'],
        ], [
            'total_pagu.required' => 'Pagu distribusi wajib diisi.',
            'total_pagu.min' => 'Pagu distribusi tidak boleh negatif.',
        ]);

        $this->service->updateTotalPagu(
            $budgetPaguDistribusi,
            $data['total_pagu'],
            $this->actor($request)
        );

        return response()->json([
            'data' => $this->service->find($budgetPaguDistribusi),
            'message' => 'Distribusi pagu berhasil diperbarui.',
        ]);
    }

    public function destroy(Request $request, int $budgetPaguDistribusi): JsonResponse
    {
        $this->service->softDelete($budgetPaguDistribusi, $this->actor($request));

        return response()->json(['message' => 'Distribusi pagu berhasil dihapus.']);
    }

    private function actor(Request $request): ?string
    {
        /** @var User|null $user */
        $user = $request->user();

        return $user?->no_absen ?? ($user ? (string) $user->id : null);
    }
}

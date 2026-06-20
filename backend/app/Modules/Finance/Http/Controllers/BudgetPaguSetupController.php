<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Services\BudgetPaguSetupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetPaguSetupController extends Controller
{
    public function __construct(
        private readonly BudgetPaguSetupService $service
    ) {}

    public function meta(): JsonResponse
    {
        return response()->json(['data' => $this->service->meta()]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'tahun' => ['nullable', 'string', 'size:4'],
            'ptk_id' => ['nullable', 'integer'],
            'kelompok_belanja_id' => ['nullable', 'integer'],
            'jenis_belanja_id' => ['nullable', 'integer'],
        ]);

        $rows = $this->service->list(array_filter($filters, fn ($v) => $v !== null && $v !== ''));

        return response()->json(['data' => $rows]);
    }

    public function show(int $budgetPaguSetup): JsonResponse
    {
        $row = $this->service->find($budgetPaguSetup);
        if (! $row) {
            return response()->json(['message' => 'Data pagu tidak ditemukan.'], 404);
        }

        return response()->json(['data' => $row]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tahun' => ['required', 'string', 'size:4', 'regex:/^\d{4}$/'],
            'ptk_id' => ['required', 'integer'],
            'kelompok_belanja_id' => ['required', 'integer'],
            'jenis_belanja_id' => ['required', 'integer'],
            'total_pagu' => ['required', 'numeric', 'min:0'],
        ], [
            'tahun.required' => 'Tahun anggaran wajib diisi.',
            'tahun.regex' => 'Format tahun tidak valid.',
            'ptk_id.required' => 'Unit PTK wajib dipilih.',
            'kelompok_belanja_id.required' => 'Kelompok belanja wajib dipilih.',
            'jenis_belanja_id.required' => 'Jenis belanja wajib dipilih.',
            'total_pagu.required' => 'Total pagu wajib diisi.',
            'total_pagu.min' => 'Total pagu tidak boleh negatif.',
        ]);

        $pagu = $this->service->create($data, $this->actor($request));

        return response()->json([
            'data' => $this->service->find($pagu->id),
            'message' => 'Setup pagu berhasil ditambahkan.',
        ], 201);
    }

    public function update(Request $request, int $budgetPaguSetup): JsonResponse
    {
        $data = $request->validate([
            'total_pagu' => ['required', 'numeric', 'min:0'],
        ], [
            'total_pagu.required' => 'Total pagu wajib diisi.',
            'total_pagu.min' => 'Total pagu tidak boleh negatif.',
        ]);

        $this->service->updateTotalPagu(
            $budgetPaguSetup,
            $data['total_pagu'],
            $this->actor($request)
        );

        return response()->json([
            'data' => $this->service->find($budgetPaguSetup),
            'message' => 'Setup pagu berhasil diperbarui.',
        ]);
    }

    public function destroy(Request $request, int $budgetPaguSetup): JsonResponse
    {
        $this->service->softDelete($budgetPaguSetup, $this->actor($request));

        return response()->json(['message' => 'Setup pagu berhasil dihapus.']);
    }

    private function actor(Request $request): ?string
    {
        /** @var User|null $user */
        $user = $request->user();

        return $user?->no_absen ?? ($user ? (string) $user->id : null);
    }
}

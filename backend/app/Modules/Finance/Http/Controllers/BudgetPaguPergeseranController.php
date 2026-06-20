<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Services\BudgetPaguPergeseranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetPaguPergeseranController extends Controller
{
    public function __construct(
        private readonly BudgetPaguPergeseranService $service
    ) {}

    public function meta(): JsonResponse
    {
        return response()->json(['data' => $this->service->meta()]);
    }

    public function targets(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'level' => ['nullable', 'string', 'in:jenis_belanja,ksro'],
            'ptk_id' => ['nullable', 'integer'],
            'kelompok_belanja_id' => ['nullable', 'integer'],
            'jenis_belanja_id' => ['nullable', 'integer'],
            'pagu_jenis_belanja_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:120'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        return response()->json([
            'data' => $this->service->listTargets(array_filter(
                $filters,
                fn ($v) => $v !== null && $v !== ''
            )),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'status' => ['nullable', 'string', 'in:draft,submitted,in_review,approved,applied,rejected'],
            'level' => ['nullable', 'string', 'in:jenis_belanja,ksro'],
            'ptk_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->listShifts(array_filter(
            $filters,
            fn ($v) => $v !== null && $v !== ''
        ));

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
            'meta' => $result['meta'],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'level' => ['required', 'string', 'in:jenis_belanja,ksro'],
            'source_finance_id' => ['required', 'integer'],
            'dest_finance_id' => ['required', 'integer', 'different:source_finance_id'],
            'nominal' => ['required', 'numeric', 'min:1'],
            'alasan' => ['required', 'string', 'min:10', 'max:1000'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'dest_finance_id.different' => 'Pagu asal dan tujuan harus berbeda.',
            'alasan.required' => 'Alasan pergeseran wajib diisi.',
            'alasan.min' => 'Alasan pergeseran minimal 10 karakter.',
        ]);

        $shift = $this->service->create(
            $data,
            $this->actor($request),
            $request->user()?->id
        );

        return response()->json([
            'data' => $shift,
            'message' => 'Draft pergeseran pagu berhasil dibuat.',
        ], 201);
    }

    public function submit(Request $request, int $budgetPaguPergeseran): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $shift = $this->service->submit(
            $budgetPaguPergeseran,
            $user->id,
            $this->actor($request)
        );

        return response()->json([
            'data' => $shift,
            'message' => 'Pergeseran pagu berhasil diajukan untuk persetujuan.',
        ]);
    }

    private function actor(Request $request): ?string
    {
        /** @var User|null $user */
        $user = $request->user();

        return $user?->no_absen ?? ($user ? (string) $user->id : null);
    }
}

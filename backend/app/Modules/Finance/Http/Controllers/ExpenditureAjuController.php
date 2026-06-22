<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Services\ExpenditureAjuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ExpenditureAjuController extends Controller
{
    public function __construct(
        private readonly ExpenditureAjuService $service
    ) {}

    public function meta(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'budget_year_id' => ['nullable', 'integer', 'exists:budget_years,id'],
        ]);

        $data = $this->service->meta(
            $this->actor($request),
            $validated['budget_year_id'] ?? null
        );

        /** @var User|null $user */
        $user = $request->user();
        $data['can_view_progress_all'] = $this->canViewProgressAll($user);

        return response()->json([
            'data' => $data,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'ksro_id' => ['required', 'integer'],
            'nama_aju' => ['required', 'string', 'max:500'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'total' => ['nullable', 'numeric', 'min:0'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'ksro_id.required' => 'Kode rekening belanja wajib dipilih.',
            'nama_aju.required' => 'Uraian pengajuan wajib diisi.',
        ]);

        $actor = $this->actor($request);
        if ($actor === null) {
            throw ValidationException::withMessages([
                'auth' => ['Nomor kepegawaian pengguna tidak ditemukan.'],
            ]);
        }

        $row = $this->service->store([...$data, 'created_by' => $actor]);

        return response()->json([
            'data' => $row,
            'message' => 'Pengajuan belanja draft berhasil dibuat.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'ptk_id' => ['nullable', 'integer'],
            'jenis_belanja_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'string', 'max:40'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $actor = $this->actor($request);
        if ($actor === null) {
            throw ValidationException::withMessages([
                'auth' => ['Nomor kepegawaian pengguna tidak ditemukan.'],
            ]);
        }

        $result = $this->service->list(array_filter(
            [...$filters, 'created_by' => $actor],
            fn ($v) => $v !== null && $v !== ''
        ));

        return response()->json($result);
    }

    public function monitoring(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'scope' => ['nullable', 'string', 'in:own,all'],
        ]);

        $actor = $this->actor($request);
        if ($actor === null) {
            throw ValidationException::withMessages([
                'auth' => ['Nomor kepegawaian pengguna tidak ditemukan.'],
            ]);
        }

        $scope = $filters['scope'] ?? 'own';
        /** @var User|null $user */
        $user = $request->user();

        if ($scope === 'all' && ! $this->canViewProgressAll($user)) {
            throw ValidationException::withMessages([
                'scope' => ['Anda tidak memiliki akses melihat progres seluruh unit.'],
            ]);
        }

        $payload = [
            'budget_year_id' => $filters['budget_year_id'],
        ];

        if ($scope !== 'all') {
            $payload['created_by'] = $actor;
        }

        return response()->json([
            'data' => $this->service->progressDashboard($payload),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $actor = $this->actor($request);
        if ($actor === null) {
            throw ValidationException::withMessages([
                'auth' => ['Nomor kepegawaian pengguna tidak ditemukan.'],
            ]);
        }

        return response()->json([
            'data' => $this->service->show($id, $actor),
        ]);
    }

    private function actor(Request $request): ?string
    {
        /** @var User|null $user */
        $user = $request->user();

        return $user?->no_absen ?? ($user ? (string) $user->id : null);
    }

    private function canViewProgressAll(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        return $user->hasPermission('finance.reports.view')
            || $user->hasPermission('workflow.approve');
    }
}

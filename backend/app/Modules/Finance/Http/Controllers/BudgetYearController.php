<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BudgetYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BudgetYearController extends Controller
{
    public function index(): JsonResponse
    {
        $years = BudgetYear::query()
            ->orderByDesc('tahun')
            ->get();

        return response()->json(['data' => $years]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        if ($data['status'] === BudgetYear::STATUS_ACTIVE) {
            $this->deactivateOtherYears();
        }

        $year = BudgetYear::query()->create([
            ...$data,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json(['data' => $year, 'message' => 'Tahun anggaran berhasil ditambahkan.'], 201);
    }

    public function show(BudgetYear $budgetYear): JsonResponse
    {
        return response()->json(['data' => $budgetYear]);
    }

    public function update(Request $request, BudgetYear $budgetYear): JsonResponse
    {
        $data = $this->validated($request, $budgetYear->id);

        if ($data['status'] === BudgetYear::STATUS_ACTIVE) {
            $this->deactivateOtherYears($budgetYear->id);
        }

        $budgetYear->update($data);

        return response()->json([
            'data' => $budgetYear->fresh(),
            'message' => 'Tahun anggaran berhasil diperbarui.',
        ]);
    }

    public function destroy(BudgetYear $budgetYear): JsonResponse
    {
        if ($budgetYear->status === BudgetYear::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'status' => ['Tahun anggaran aktif tidak dapat dihapus. Ubah status terlebih dahulu.'],
            ]);
        }

        $budgetYear->delete();

        return response()->json(['message' => 'Tahun anggaran berhasil dihapus.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'tahun' => [
                'required',
                'integer',
                'min:2000',
                'max:2100',
                Rule::unique('budget_years', 'tahun')
                    ->ignore($ignoreId)
                    ->whereNull('deleted_at'),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'status' => ['required', Rule::in([
                BudgetYear::STATUS_DRAFT,
                BudgetYear::STATUS_ACTIVE,
                BudgetYear::STATUS_CLOSED,
            ])],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ], [
            'tahun.required' => 'Tahun wajib diisi.',
            'tahun.integer' => 'Tahun harus berupa angka.',
            'tahun.min' => 'Tahun minimal 2000.',
            'tahun.max' => 'Tahun maksimal 2100.',
            'tahun.unique' => 'Tahun anggaran ini sudah terdaftar. Gunakan tahun lain atau ubah data yang ada.',
            'nama.required' => 'Nama tahun anggaran wajib diisi.',
            'tanggal_mulai.required' => 'Tanggal mulai wajib diisi.',
            'tanggal_selesai.required' => 'Tanggal selesai wajib diisi.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ]);
    }

    private function deactivateOtherYears(?int $exceptId = null): void
    {
        BudgetYear::query()
            ->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))
            ->where('status', BudgetYear::STATUS_ACTIVE)
            ->update(['status' => BudgetYear::STATUS_CLOSED]);
    }
}

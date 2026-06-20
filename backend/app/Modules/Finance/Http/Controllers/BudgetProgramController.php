<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BudgetAccountCode;
use App\Modules\Finance\Models\BudgetYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BudgetProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'budget_year_id.exists' => 'Tahun anggaran tidak ditemukan.',
        ]);

        $items = BudgetAccountCode::query()
            ->where('budget_year_id', $request->integer('budget_year_id'))
            ->with('budgetYear:id,tahun,nama,status')
            ->orderBy('kode')
            ->get();

        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $item = BudgetAccountCode::query()->create([
            ...$data,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'data' => $item->load('budgetYear:id,tahun,nama,status'),
            'message' => 'Data berhasil ditambahkan.',
        ], 201);
    }

    public function show(BudgetAccountCode $budgetProgram): JsonResponse
    {
        return response()->json([
            'data' => $budgetProgram->load('budgetYear:id,tahun,nama,status'),
        ]);
    }

    public function update(Request $request, BudgetAccountCode $budgetProgram): JsonResponse
    {
        $data = $this->validated($request, $budgetProgram);

        $budgetProgram->update($data);

        return response()->json([
            'data' => $budgetProgram->fresh()->load('budgetYear:id,tahun,nama,status'),
            'message' => 'Data berhasil diperbarui.',
        ]);
    }

    public function destroy(BudgetAccountCode $budgetProgram): JsonResponse
    {
        if ($budgetProgram->children()->exists()) {
            throw ValidationException::withMessages([
                'kode' => ['Data masih memiliki sub-item. Hapus sub-item terlebih dahulu.'],
            ]);
        }

        $budgetProgram->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }

    public function updatePagu(Request $request, BudgetAccountCode $budgetProgram): JsonResponse
    {
        if ($budgetProgram->jenis !== BudgetAccountCode::JENIS_SUB_KEGIATAN) {
            throw ValidationException::withMessages([
                'jumlah_anggaran' => ['Pagu hanya dapat diatur pada level sub kegiatan.'],
            ]);
        }

        $data = $request->validate([
            'jumlah_anggaran' => ['required', 'numeric', 'min:0'],
        ], [
            'jumlah_anggaran.required' => 'Jumlah pagu wajib diisi.',
            'jumlah_anggaran.min' => 'Jumlah pagu tidak boleh negatif.',
        ]);

        $budgetProgram->update(['jumlah_anggaran' => $data['jumlah_anggaran']]);

        return response()->json([
            'data' => $budgetProgram->fresh()->load('budgetYear:id,tahun,nama,status'),
            'message' => 'Pagu sub kegiatan berhasil diperbarui.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?BudgetAccountCode $existing = null): array
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'parent_id' => ['nullable', 'integer', 'exists:budget_account_codes,id'],
            'kode' => [
                'required',
                'string',
                'max:50',
                'regex:/^[0-9]+(\.[0-9]+)*$/',
            ],
            'uraian' => ['required', 'string', 'max:500'],
            'jenis' => ['required', Rule::in([
                BudgetAccountCode::JENIS_PROGRAM,
                BudgetAccountCode::JENIS_KEGIATAN,
                BudgetAccountCode::JENIS_SUB_KEGIATAN,
            ])],
            'jumlah_anggaran' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'kode.required' => 'Kode wajib diisi.',
            'kode.regex' => 'Format kode tidak valid. Contoh: 1.02.01.1.06.0007.',
            'uraian.required' => 'Uraian wajib diisi.',
            'jenis.required' => 'Jenis wajib dipilih.',
            'jumlah_anggaran.min' => 'Jumlah anggaran tidak boleh negatif.',
        ]);

        $yearId = (int) $data['budget_year_id'];

        $kodeTaken = BudgetAccountCode::query()
            ->where('budget_year_id', $yearId)
            ->where('kode', $data['kode'])
            ->when($existing, fn ($q) => $q->where('id', '!=', $existing->id))
            ->exists();

        if ($kodeTaken) {
            throw ValidationException::withMessages([
                'kode' => ['Kode sudah terdaftar pada tahun anggaran ini.'],
            ]);
        }

        if ($existing && (int) $existing->budget_year_id !== $yearId) {
            throw ValidationException::withMessages([
                'budget_year_id' => ['Tahun anggaran tidak dapat diubah.'],
            ]);
        }

        $parent = isset($data['parent_id'])
            ? BudgetAccountCode::query()->find($data['parent_id'])
            : null;

        if ($parent && (int) $parent->budget_year_id !== $yearId) {
            throw ValidationException::withMessages([
                'parent_id' => ['Induk harus berada pada tahun anggaran yang sama.'],
            ]);
        }

        if ($data['jenis'] === BudgetAccountCode::JENIS_PROGRAM) {
            $data['parent_id'] = null;
            $data['jumlah_anggaran'] = null;
        }

        if ($data['jenis'] === BudgetAccountCode::JENIS_PROGRAM && $request->input('parent_id')) {
            throw ValidationException::withMessages([
                'parent_id' => ['Program tidak boleh memiliki induk.'],
            ]);
        }

        if ($data['jenis'] === BudgetAccountCode::JENIS_KEGIATAN) {
            if (! $parent || $parent->jenis !== BudgetAccountCode::JENIS_PROGRAM) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Kegiatan harus berada di bawah program.'],
                ]);
            }
            $data['jumlah_anggaran'] = null;
        }

        if ($data['jenis'] === BudgetAccountCode::JENIS_SUB_KEGIATAN) {
            if (! $parent || $parent->jenis !== BudgetAccountCode::JENIS_KEGIATAN) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Sub kegiatan harus berada di bawah kegiatan.'],
                ]);
            }
            if (! $existing && ! array_key_exists('jumlah_anggaran', $data)) {
                $data['jumlah_anggaran'] = null;
            }
            if ($existing && ! array_key_exists('jumlah_anggaran', $data)) {
                unset($data['jumlah_anggaran']);
            }
        }

        if ($existing && $existing->id === ($data['parent_id'] ?? null)) {
            throw ValidationException::withMessages([
                'parent_id' => ['Induk tidak valid.'],
            ]);
        }

        if ($parent && ! str_starts_with($data['kode'], $parent->kode.'.')) {
            throw ValidationException::withMessages([
                'kode' => ['Kode harus diawali dengan kode induk ('.$parent->kode.').'],
            ]);
        }

        return $data;
    }
}

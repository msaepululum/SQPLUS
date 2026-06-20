<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\FundingSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FundingSourceController extends Controller
{
    public function index(): JsonResponse
    {
        $sources = FundingSource::query()
            ->orderBy('kode')
            ->get();

        return response()->json(['data' => $sources]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $source = FundingSource::query()->create([
            ...$data,
            'kode' => strtoupper($data['kode']),
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'data' => $source,
            'message' => 'Sumber dana berhasil ditambahkan.',
        ], 201);
    }

    public function show(FundingSource $fundingSource): JsonResponse
    {
        return response()->json(['data' => $fundingSource]);
    }

    public function update(Request $request, FundingSource $fundingSource): JsonResponse
    {
        $data = $this->validated($request, $fundingSource->id);

        $fundingSource->update([
            ...$data,
            'kode' => strtoupper($data['kode']),
        ]);

        return response()->json([
            'data' => $fundingSource->fresh(),
            'message' => 'Sumber dana berhasil diperbarui.',
        ]);
    }

    public function destroy(FundingSource $fundingSource): JsonResponse
    {
        $fundingSource->delete();

        return response()->json(['message' => 'Sumber dana berhasil dihapus.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'kode' => [
                'required',
                'string',
                'max:20',
                'regex:/^[A-Za-z0-9_-]+$/',
                Rule::unique('funding_sources', 'kode')
                    ->ignore($ignoreId)
                    ->whereNull('deleted_at'),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'jenis' => ['required', Rule::in([
                FundingSource::JENIS_OPERASIONAL,
                FundingSource::JENIS_INVESTASI,
                FundingSource::JENIS_BANTUAN,
                FundingSource::JENIS_LAINNYA,
            ])],
            'is_active' => ['required', 'boolean'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ], [
            'kode.required' => 'Kode sumber dana wajib diisi.',
            'kode.unique' => 'Kode sumber dana sudah terdaftar. Gunakan kode lain atau ubah data yang ada.',
            'kode.regex' => 'Kode hanya boleh berisi huruf, angka, strip, dan underscore.',
            'nama.required' => 'Nama sumber dana wajib diisi.',
            'jenis.required' => 'Jenis sumber dana wajib dipilih.',
            'jenis.in' => 'Jenis sumber dana tidak valid.',
            'is_active.required' => 'Status aktif wajib dipilih.',
        ]);
    }
}

<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\CashTransaction;
use App\Modules\Finance\Services\CashTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CashTransactionController extends Controller
{
    public function __construct(
        private readonly CashTransactionService $service
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

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'flow_type' => ['nullable', 'string', Rule::in(['masuk', 'keluar', 'riwayat'])],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'kas_account_no' => ['nullable', 'string', 'max:50'],
            'journal_type' => ['nullable', 'string', 'max:10'],
            'source' => ['nullable', 'string', Rule::in(['all', CashTransaction::SOURCE_ACC2026, CashTransaction::SOURCE_MANUAL])],
            'search' => ['nullable', 'string', 'max:120'],
            'tanggal_from' => ['nullable', 'date'],
            'tanggal_to' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $result = $this->service->list($filters);

        return response()->json([
            'data' => $result['rows'],
            'summary' => $result['summary'],
            'meta' => $result['meta'],
        ]);
    }

    public function show(Request $request, string $cashTransaction): JsonResponse
    {
        $validated = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
        ]);

        $detail = $this->service->show($cashTransaction, $validated['budget_year_id']);

        return response()->json(['data' => $detail]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'budget_year_id' => ['required', 'integer', 'exists:budget_years,id'],
            'flow_type' => ['required', 'string', Rule::in([CashTransaction::FLOW_MASUK, CashTransaction::FLOW_KELUAR])],
            'journal_type' => ['required', 'string', 'max:10'],
            'tanggal' => ['required', 'date'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'no_bukti' => ['nullable', 'string', 'max:50'],
            'kas_account_no' => ['required', 'string', 'max:50'],
            'kas_account_name' => ['nullable', 'string', 'max:200'],
            'lines' => ['required', 'array', 'min:2'],
            'lines.*.account_no' => ['required', 'string', 'max:50'],
            'lines.*.account_name' => ['nullable', 'string', 'max:200'],
            'lines.*.keterangan' => ['nullable', 'string', 'max:500'],
            'lines.*.debet' => ['required', 'numeric', 'min:0'],
            'lines.*.kredit' => ['required', 'numeric', 'min:0'],
        ], [
            'budget_year_id.required' => 'Tahun anggaran wajib dipilih.',
            'lines.required' => 'Baris jurnal wajib diisi (prinsip double-entry).',
            'lines.min' => 'Jurnal wajib minimal 2 baris.',
        ]);

        $row = $this->service->create($data, $request->user()?->name);

        return response()->json([
            'message' => 'Transaksi kas manual berhasil disimpan.',
            'data' => $row,
        ], 201);
    }

    public function update(Request $request, int $cashTransaction): JsonResponse
    {
        $data = $request->validate([
            'tanggal' => ['sometimes', 'date'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'no_bukti' => ['nullable', 'string', 'max:50'],
            'kas_account_no' => ['sometimes', 'string', 'max:50'],
            'kas_account_name' => ['nullable', 'string', 'max:200'],
            'lines' => ['sometimes', 'array', 'min:2'],
            'lines.*.account_no' => ['required_with:lines', 'string', 'max:50'],
            'lines.*.account_name' => ['nullable', 'string', 'max:200'],
            'lines.*.keterangan' => ['nullable', 'string', 'max:500'],
            'lines.*.debet' => ['required_with:lines', 'numeric', 'min:0'],
            'lines.*.kredit' => ['required_with:lines', 'numeric', 'min:0'],
        ]);

        $row = $this->service->update($cashTransaction, $data);

        return response()->json([
            'message' => 'Transaksi kas berhasil diperbarui.',
            'data' => $row,
        ]);
    }

    public function destroy(int $cashTransaction): JsonResponse
    {
        $this->service->delete($cashTransaction);

        return response()->json(['message' => 'Transaksi kas berhasil dihapus.']);
    }

    public function post(int $cashTransaction): JsonResponse
    {
        $row = $this->service->post($cashTransaction);

        return response()->json([
            'message' => 'Transaksi kas berhasil diposting.',
            'data' => $row,
        ]);
    }
}

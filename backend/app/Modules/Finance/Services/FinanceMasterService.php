<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\Rsud\JenisBelanja;
use App\Modules\Finance\Models\Rsud\JenisRekening;
use App\Modules\Finance\Models\Rsud\KelompokBelanja;
use App\Modules\Finance\Models\Rsud\Pptk;
use App\Modules\Finance\Models\Rsud\Ptk;
use App\Modules\Finance\Models\Rsud\Satuan;
use App\Modules\Finance\Models\Rsud\Sro;
use Illuminate\Support\Collection;

class FinanceMasterService
{
    public function kelompokBelanja(): Collection
    {
        return KelompokBelanja::query()
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get(['id', 'kode_kelompok_belanja']);
    }

    public function jenisBelanja(): Collection
    {
        return JenisBelanja::query()
            ->with('kelompokBelanja:id,kode_kelompok_belanja')
            ->whereNull('deleted_at')
            ->orderBy('kelompok_belanja_id')
            ->orderBy('id')
            ->get()
            ->map(fn (JenisBelanja $row) => [
                'id' => $row->id,
                'kode_jenis_belanja' => $row->kode_jenis_belanja,
                'kelompok_belanja_id' => $row->kelompok_belanja_id,
                'kelompok_kode' => $row->kelompokBelanja?->kode_kelompok_belanja,
            ]);
    }

    public function pptk(): Collection
    {
        return Pptk::query()
            ->whereNull('deleted_at')
            ->orderBy('nama_pptk')
            ->get(['id', 'nama_pptk', 'nip_pptk', 'no_absen', 'jabatan_pptk_id']);
    }

    public function ptk(): Collection
    {
        return Ptk::query()
            ->with('pptk:id,nama_pptk')
            ->whereNull('deleted_at')
            ->orderBy('nama_satuan_ptk')
            ->get(['id', 'pptk_id', 'nama_satuan_ptk', 'nama_ptk', 'nip_ptk', 'no_absen'])
            ->map(fn (Ptk $row) => [
                'id' => $row->id,
                'pptk_id' => $row->pptk_id,
                'pptk_nama' => $row->pptk?->nama_pptk,
                'nama_satuan_ptk' => $row->nama_satuan_ptk,
                'nama_ptk' => $row->nama_ptk,
                'nip_ptk' => $row->nip_ptk,
                'no_absen' => $row->no_absen,
            ]);
    }

    public function jenisRekening(): Collection
    {
        return JenisRekening::query()
            ->whereNull('deleted_at')
            ->orderBy('no_rekening')
            ->get(['id', 'no_rekening', 'nama_jenis_rekening']);
    }

    public function sro(): Collection
    {
        return Sro::query()
            ->with('jenisBelanja:id,kode_jenis_belanja')
            ->whereNull('deleted_at')
            ->orderBy('no_rekening')
            ->orderBy('id')
            ->get(['id', 'no_rekening', 'nama_sro', 'jenis_belanja_id'])
            ->map(fn (Sro $row) => [
                'id' => $row->id,
                'no_rekening' => $row->no_rekening,
                'nama_sro' => $row->nama_sro,
                'jenis_belanja_id' => $row->jenis_belanja_id,
                'jenis_belanja_kode' => $row->jenisBelanja?->kode_jenis_belanja,
            ]);
    }

    public function satuan(): Collection
    {
        return Satuan::query()
            ->whereNull('deleted_at')
            ->orderBy('nama_satuan')
            ->get(['id', 'nama_satuan']);
    }
}

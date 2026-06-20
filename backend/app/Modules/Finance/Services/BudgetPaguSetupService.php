<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\Rsud\JenisBelanja;
use App\Modules\Finance\Models\Rsud\KelompokBelanja;
use App\Modules\Finance\Models\Rsud\Pagu;
use App\Modules\Finance\Models\Rsud\PaguJenisBelanja;
use App\Modules\Finance\Models\Rsud\PaguKelompokBelanja;
use App\Modules\Finance\Models\Rsud\Ptk;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BudgetPaguSetupService
{
    public function meta(): array
    {
        $tahun = Pagu::query()
            ->whereNull('deleted_at')
            ->distinct()
            ->orderByDesc('tahun')
            ->pluck('tahun')
            ->values()
            ->all();

        if ($tahun === []) {
            $tahun = [(string) now()->year];
        }

        $ptk = Ptk::query()
            ->whereNull('deleted_at')
            ->orderBy('nama_satuan_ptk')
            ->get(['id', 'nama_satuan_ptk', 'nama_ptk', 'no_absen']);

        $kelompokBelanja = KelompokBelanja::query()
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get(['id', 'kode_kelompok_belanja']);

        $jenisBelanja = JenisBelanja::query()
            ->whereNull('deleted_at')
            ->orderBy('kelompok_belanja_id')
            ->orderBy('id')
            ->get(['id', 'kode_jenis_belanja', 'kelompok_belanja_id']);

        return [
            'tahun_options' => $tahun,
            'ptk' => $ptk,
            'kelompok_belanja' => $kelompokBelanja,
            'jenis_belanja' => $jenisBelanja,
        ];
    }

    /**
     * @param  array{tahun?: string, ptk_id?: int, kelompok_belanja_id?: int, jenis_belanja_id?: int}  $filters
     */
    public function list(array $filters = []): Collection
    {
        $query = DB::connection(RsudConnections::FINANCE)
            ->table('pagu as p')
            ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
            ->join('pagu_kelompok_belanja as pkb', function ($join) {
                $join->on('pkb.pagu_id', '=', 'p.id')->whereNull('pkb.deleted_at');
            })
            ->join('kelompok_belanja as kb', 'kb.id', '=', 'pkb.kelompok_belanja_id')
            ->join('pagu_jenis_belanja as pjb', function ($join) {
                $join->on('pjb.pagu_kelompok_belanja_id', '=', 'pkb.id')->whereNull('pjb.deleted_at');
            })
            ->join('jenis_belanja as jb', 'jb.id', '=', 'pjb.jenis_belanja_id')
            ->whereNull('p.deleted_at')
            ->whereNull('pt.deleted_at')
            ->whereNull('kb.deleted_at')
            ->whereNull('jb.deleted_at')
            ->select([
                'p.id',
                'p.tahun',
                'p.ptk_id',
                'pt.nama_satuan_ptk',
                'pt.nama_ptk',
                'pkb.id as pagu_kelompok_belanja_id',
                'pkb.kelompok_belanja_id',
                'kb.kode_kelompok_belanja',
                'pjb.id as pagu_jenis_belanja_id',
                'pjb.jenis_belanja_id',
                'jb.kode_jenis_belanja',
                'pjb.total_pagu',
                'pjb.sisa_pagu',
                'p.created_at',
            ])
            ->orderByDesc('p.tahun')
            ->orderBy('pt.nama_satuan_ptk')
            ->orderBy('kb.id')
            ->orderBy('jb.id');

        if (! empty($filters['tahun'])) {
            $query->where('p.tahun', $filters['tahun']);
        }
        if (! empty($filters['ptk_id'])) {
            $query->where('p.ptk_id', $filters['ptk_id']);
        }
        if (! empty($filters['kelompok_belanja_id'])) {
            $query->where('pkb.kelompok_belanja_id', $filters['kelompok_belanja_id']);
        }
        if (! empty($filters['jenis_belanja_id'])) {
            $query->where('pjb.jenis_belanja_id', $filters['jenis_belanja_id']);
        }

        return $query->get();
    }

    public function find(int $id): ?object
    {
        return $this->list()->firstWhere('id', $id);
    }

    /**
     * @param  array{tahun: string, ptk_id: int, kelompok_belanja_id: int, jenis_belanja_id: int, total_pagu: float|string}  $data
     */
    public function create(array $data, ?string $actor): Pagu
    {
        $this->assertJenisBelongsToKelompok(
            (int) $data['jenis_belanja_id'],
            (int) $data['kelompok_belanja_id']
        );

        $this->assertUniqueCombo(
            $data['tahun'],
            (int) $data['ptk_id'],
            (int) $data['kelompok_belanja_id'],
            (int) $data['jenis_belanja_id']
        );

        $now = now();

        return DB::connection(RsudConnections::FINANCE)->transaction(function () use ($data, $actor, $now) {
            $pagu = Pagu::query()->create([
                'tahun' => $data['tahun'],
                'ptk_id' => $data['ptk_id'],
                'total_pagu' => null,
                'sisa_pagu' => null,
                'created_at' => $now,
                'created_by' => $actor,
                'updated_at' => $now,
            ]);

            $pkb = PaguKelompokBelanja::query()->create([
                'pagu_id' => $pagu->id,
                'kelompok_belanja_id' => $data['kelompok_belanja_id'],
                'created_at' => $now,
                'created_by' => $actor,
                'updated_at' => $now,
            ]);

            PaguJenisBelanja::query()->create([
                'pagu_kelompok_belanja_id' => $pkb->id,
                'jenis_belanja_id' => $data['jenis_belanja_id'],
                'total_pagu' => $data['total_pagu'],
                'sisa_pagu' => null,
                'created_at' => $now,
                'created_by' => $actor,
                'updated_at' => $now,
            ]);

            return $pagu;
        });
    }

    public function updateTotalPagu(int $paguId, float|string $totalPagu, ?string $actor): void
    {
        $row = $this->find($paguId);
        if (! $row) {
            throw ValidationException::withMessages([
                'id' => 'Data pagu tidak ditemukan.',
            ]);
        }

        PaguJenisBelanja::query()
            ->where('id', $row->pagu_jenis_belanja_id)
            ->update([
                'total_pagu' => $totalPagu,
                'updated_at' => now(),
                'updated_by' => $actor,
            ]);
    }

    public function softDelete(int $paguId, ?string $actor): void
    {
        $row = $this->find($paguId);
        if (! $row) {
            throw ValidationException::withMessages([
                'id' => 'Data pagu tidak ditemukan.',
            ]);
        }

        $now = now();

        DB::connection(RsudConnections::FINANCE)->transaction(function () use ($row, $actor, $now) {
            PaguJenisBelanja::query()
                ->where('id', $row->pagu_jenis_belanja_id)
                ->update([
                    'deleted_at' => $now,
                    'deleted_by' => $actor,
                ]);

            PaguKelompokBelanja::query()
                ->where('id', $row->pagu_kelompok_belanja_id)
                ->update([
                    'deleted_at' => $now,
                    'deleted_by' => $actor,
                ]);

            Pagu::query()
                ->where('id', $row->id)
                ->update([
                    'deleted_at' => $now,
                    'deleted_by' => $actor,
                ]);
        });
    }

    private function assertJenisBelongsToKelompok(int $jenisBelanjaId, int $kelompokBelanjaId): void
    {
        $valid = JenisBelanja::query()
            ->whereNull('deleted_at')
            ->where('id', $jenisBelanjaId)
            ->where('kelompok_belanja_id', $kelompokBelanjaId)
            ->exists();

        if (! $valid) {
            throw ValidationException::withMessages([
                'jenis_belanja_id' => 'Jenis belanja tidak sesuai dengan kelompok belanja yang dipilih.',
            ]);
        }
    }

    private function assertUniqueCombo(
        string $tahun,
        int $ptkId,
        int $kelompokBelanjaId,
        int $jenisBelanjaId,
        ?int $ignorePaguId = null
    ): void {
        $exists = $this->list([
            'tahun' => $tahun,
            'ptk_id' => $ptkId,
            'kelompok_belanja_id' => $kelompokBelanjaId,
            'jenis_belanja_id' => $jenisBelanjaId,
        ])->contains(fn ($row) => $ignorePaguId === null || (int) $row->id !== $ignorePaguId);

        if ($exists) {
            throw ValidationException::withMessages([
                'ptk_id' => 'Pagu untuk kombinasi tahun, unit PTK, kelompok, dan jenis belanja ini sudah ada.',
            ]);
        }
    }
}

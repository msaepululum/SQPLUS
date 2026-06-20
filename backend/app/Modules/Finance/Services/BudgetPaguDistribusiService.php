<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\Rsud\Ksro;
use App\Modules\Finance\Models\Rsud\PaguJenisBelanja;
use App\Modules\Finance\Models\Rsud\PaguKsro;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BudgetPaguDistribusiService
{
    public function __construct(
        private readonly BudgetPaguSetupService $paguSetupService
    ) {}

    /**
     * @param  array{tahun?: string, ptk_id?: int, kelompok_belanja_id?: int, jenis_belanja_id?: int}  $filters
     */
    public function meta(array $filters = []): array
    {
        $base = $this->paguSetupService->meta();

        $tahun = $filters['tahun'] ?? null;
        $jenisBelanjaId = isset($filters['jenis_belanja_id']) ? (int) $filters['jenis_belanja_id'] : null;

        $base['pagu_induk'] = [];
        $base['ksro'] = [];

        if ($tahun) {
            $paguFilters = array_filter([
                'tahun' => $tahun,
                'ptk_id' => $filters['ptk_id'] ?? null,
                'kelompok_belanja_id' => $filters['kelompok_belanja_id'] ?? null,
                'jenis_belanja_id' => $jenisBelanjaId,
            ], fn ($v) => $v !== null && $v !== '');

            if (count($paguFilters) >= 2) {
                $base['pagu_induk'] = $this->paguIndukOptions($paguFilters);
            }

            if ($jenisBelanjaId) {
                $base['ksro'] = $this->ksroOptions($tahun, $jenisBelanjaId, $filters['ptk_id'] ?? null);
            }
        }

        return $base;
    }

    /**
     * @param  array{tahun?: string, ptk_id?: int, kelompok_belanja_id?: int, jenis_belanja_id?: int, pagu_jenis_belanja_id?: int}  $filters
     * @return array{rows: Collection, summary: array<string, mixed>|null}
     */
    public function list(array $filters = []): array
    {
        $paguJenisBelanjaId = isset($filters['pagu_jenis_belanja_id'])
            ? (int) $filters['pagu_jenis_belanja_id']
            : null;

        if (! $paguJenisBelanjaId) {
            return ['rows' => collect(), 'summary' => null];
        }

        $query = DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('ksro as k', 'k.id', '=', 'pk.ksro_id')
            ->join('pagu_jenis_belanja as pjb', 'pjb.id', '=', 'pk.pagu_jenis_belanja_id')
            ->join('pagu_kelompok_belanja as pkb', 'pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')
            ->join('pagu as p', 'p.id', '=', 'pkb.pagu_id')
            ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
            ->join('jenis_belanja as jb', 'jb.id', '=', 'pjb.jenis_belanja_id')
            ->join('kelompok_belanja as kb', 'kb.id', '=', 'pkb.kelompok_belanja_id')
            ->whereNull('pk.deleted_at')
            ->whereNull('k.deleted_at')
            ->whereNull('pjb.deleted_at')
            ->where('pk.pagu_jenis_belanja_id', $paguJenisBelanjaId)
            ->select([
                'pk.id',
                'pk.pagu_jenis_belanja_id',
                'pk.ksro_id',
                'k.kode_ksro',
                'k.nama_ksro',
                'pk.total_pagu',
                'pk.sisa_pagu',
                'p.tahun',
                'p.ptk_id',
                'pt.nama_satuan_ptk',
                'pkb.kelompok_belanja_id',
                'kb.kode_kelompok_belanja',
                'pjb.jenis_belanja_id',
                'jb.kode_jenis_belanja',
                'pjb.total_pagu as pagu_induk_total',
            ])
            ->orderBy('k.kode_ksro');

        if (! empty($filters['tahun'])) {
            $query->where('p.tahun', $filters['tahun']);
        }

        $rows = $query->get();

        return [
            'rows' => $rows,
            'summary' => $this->buildSummary($paguJenisBelanjaId, $rows),
        ];
    }

    public function find(int $id): ?object
    {
        return DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('ksro as k', 'k.id', '=', 'pk.ksro_id')
            ->join('pagu_jenis_belanja as pjb', 'pjb.id', '=', 'pk.pagu_jenis_belanja_id')
            ->join('pagu_kelompok_belanja as pkb', 'pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')
            ->join('pagu as p', 'p.id', '=', 'pkb.pagu_id')
            ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
            ->join('jenis_belanja as jb', 'jb.id', '=', 'pjb.jenis_belanja_id')
            ->join('kelompok_belanja as kb', 'kb.id', '=', 'pkb.kelompok_belanja_id')
            ->whereNull('pk.deleted_at')
            ->where('pk.id', $id)
            ->select([
                'pk.id',
                'pk.pagu_jenis_belanja_id',
                'pk.ksro_id',
                'k.kode_ksro',
                'k.nama_ksro',
                'pk.total_pagu',
                'pk.sisa_pagu',
                'p.tahun',
                'p.ptk_id',
                'pt.nama_satuan_ptk',
                'pkb.kelompok_belanja_id',
                'kb.kode_kelompok_belanja',
                'pjb.jenis_belanja_id',
                'jb.kode_jenis_belanja',
                'pjb.total_pagu as pagu_induk_total',
            ])
            ->first();
    }

    /**
     * @param  array{pagu_jenis_belanja_id: int, ksro_id: int, total_pagu: float|string}  $data
     */
    public function create(array $data, ?string $actor): PaguKsro
    {
        $paguJenisBelanjaId = (int) $data['pagu_jenis_belanja_id'];
        $ksroId = (int) $data['ksro_id'];
        $totalPagu = $data['total_pagu'];

        $this->assertPaguJenisExists($paguJenisBelanjaId);
        $this->assertKsroMatchesJenis($ksroId, $paguJenisBelanjaId);
        $this->assertUniqueKsro($paguJenisBelanjaId, $ksroId);
        $this->assertWithinInduk($paguJenisBelanjaId, $totalPagu);

        $now = now();

        return PaguKsro::query()->create([
            'pagu_jenis_belanja_id' => $paguJenisBelanjaId,
            'ksro_id' => $ksroId,
            'total_pagu' => $totalPagu,
            'sisa_pagu' => null,
            'created_at' => $now,
            'created_by' => $actor,
            'updated_at' => $now,
        ]);
    }

    public function updateTotalPagu(int $id, float|string $totalPagu, ?string $actor): void
    {
        $row = PaguKsro::query()->whereNull('deleted_at')->find($id);
        if (! $row) {
            throw ValidationException::withMessages([
                'id' => 'Data distribusi pagu tidak ditemukan.',
            ]);
        }

        $this->assertWithinInduk((int) $row->pagu_jenis_belanja_id, $totalPagu, $id);

        $row->update([
            'total_pagu' => $totalPagu,
            'updated_at' => now(),
            'updated_by' => $actor,
        ]);
    }

    public function softDelete(int $id, ?string $actor): void
    {
        $row = PaguKsro::query()->whereNull('deleted_at')->find($id);
        if (! $row) {
            throw ValidationException::withMessages([
                'id' => 'Data distribusi pagu tidak ditemukan.',
            ]);
        }

        $now = now();
        $row->update([
            'deleted_at' => $now,
            'deleted_by' => $actor,
        ]);
    }

    /**
     * @param  array{tahun: string, ptk_id?: int, kelompok_belanja_id?: int, jenis_belanja_id?: int}  $filters
     */
    private function paguIndukOptions(array $filters): array
    {
        return $this->paguSetupService->list($filters)
            ->map(fn ($row) => [
                'pagu_jenis_belanja_id' => (int) $row->pagu_jenis_belanja_id,
                'pagu_id' => (int) $row->id,
                'tahun' => $row->tahun,
                'ptk_id' => (int) $row->ptk_id,
                'nama_satuan_ptk' => $row->nama_satuan_ptk,
                'kelompok_belanja_id' => (int) $row->kelompok_belanja_id,
                'kode_kelompok_belanja' => $row->kode_kelompok_belanja,
                'jenis_belanja_id' => (int) $row->jenis_belanja_id,
                'kode_jenis_belanja' => $row->kode_jenis_belanja,
                'total_pagu' => $row->total_pagu,
                'label' => "{$row->nama_satuan_ptk} · {$row->kode_jenis_belanja}",
            ])
            ->values()
            ->all();
    }

    private function ksroOptions(string $tahun, int $jenisBelanjaId, int|string|null $ptkId): array
    {
        $query = Ksro::query()
            ->whereNull('deleted_at')
            ->where('jenis_belanja_id', $jenisBelanjaId)
            ->where(function ($q) use ($tahun) {
                $q->where('tahun', $tahun)
                    ->orWhereExists(function ($sub) use ($tahun) {
                        $sub->select(DB::raw(1))
                            ->from('ksro_tahun as kt')
                            ->whereColumn('kt.ksro_id', 'ksro.id')
                            ->where('kt.tahun', $tahun)
                            ->whereNull('kt.deleted_at');
                    });
            })
            ->orderBy('kode_ksro');

        if ($ptkId) {
            $query->where(function ($q) use ($ptkId) {
                $q->whereNull('ptk_id')->orWhere('ptk_id', $ptkId);
            });
        }

        return $query
            ->get(['id', 'kode_ksro', 'nama_ksro', 'jenis_belanja_id'])
            ->map(fn (Ksro $row) => [
                'id' => $row->id,
                'kode_ksro' => $row->kode_ksro,
                'nama_ksro' => $row->nama_ksro,
                'jenis_belanja_id' => $row->jenis_belanja_id,
            ])
            ->values()
            ->all();
    }

    private function buildSummary(int $paguJenisBelanjaId, Collection $rows): ?array
    {
        $induk = PaguJenisBelanja::query()
            ->whereNull('deleted_at')
            ->find($paguJenisBelanjaId);

        if (! $induk) {
            return null;
        }

        $indukTotal = (float) $induk->total_pagu;
        $terdistribusi = (float) $rows->sum(fn ($r) => (float) $r->total_pagu);

        return [
            'pagu_jenis_belanja_id' => $paguJenisBelanjaId,
            'pagu_induk_total' => $indukTotal,
            'terdistribusi' => $terdistribusi,
            'sisa' => max(0, $indukTotal - $terdistribusi),
            'jumlah_ksro' => $rows->count(),
        ];
    }

    private function assertPaguJenisExists(int $paguJenisBelanjaId): void
    {
        $exists = PaguJenisBelanja::query()
            ->whereNull('deleted_at')
            ->where('id', $paguJenisBelanjaId)
            ->exists();

        if (! $exists) {
            throw ValidationException::withMessages([
                'pagu_jenis_belanja_id' => 'Pagu induk (jenis belanja) tidak ditemukan.',
            ]);
        }
    }

    private function assertKsroMatchesJenis(int $ksroId, int $paguJenisBelanjaId): void
    {
        $paguJenis = PaguJenisBelanja::query()
            ->whereNull('deleted_at')
            ->find($paguJenisBelanjaId);

        $ksro = Ksro::query()
            ->whereNull('deleted_at')
            ->find($ksroId);

        if (! $ksro || ! $paguJenis) {
            throw ValidationException::withMessages([
                'ksro_id' => 'KSRO atau pagu induk tidak valid.',
            ]);
        }

        if ((int) $ksro->jenis_belanja_id !== (int) $paguJenis->jenis_belanja_id) {
            throw ValidationException::withMessages([
                'ksro_id' => 'KSRO harus sesuai jenis belanja pagu induk.',
            ]);
        }
    }

    private function assertUniqueKsro(int $paguJenisBelanjaId, int $ksroId, ?int $ignoreId = null): void
    {
        $exists = PaguKsro::query()
            ->whereNull('deleted_at')
            ->where('pagu_jenis_belanja_id', $paguJenisBelanjaId)
            ->where('ksro_id', $ksroId)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'ksro_id' => 'KSRO ini sudah didistribusikan pada pagu induk yang sama.',
            ]);
        }
    }

    private function assertWithinInduk(
        int $paguJenisBelanjaId,
        float|string $newAmount,
        ?int $ignoreId = null
    ): void {
        $induk = PaguJenisBelanja::query()
            ->whereNull('deleted_at')
            ->find($paguJenisBelanjaId);

        if (! $induk) {
            return;
        }

        $existing = PaguKsro::query()
            ->whereNull('deleted_at')
            ->where('pagu_jenis_belanja_id', $paguJenisBelanjaId)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->sum('total_pagu');

        $indukTotal = (float) $induk->total_pagu;
        $nextTotal = (float) $existing + (float) $newAmount;

        if ($nextTotal > $indukTotal + 0.0001) {
            throw ValidationException::withMessages([
                'total_pagu' => 'Total distribusi melebihi pagu induk jenis belanja.',
            ]);
        }
    }
}

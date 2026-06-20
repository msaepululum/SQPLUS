<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\Rsud\Rba;
use App\Modules\Finance\Models\Rsud\RbaBlockHistori;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BudgetBlokirAnggaranService
{
    public function __construct(
        private readonly BudgetPaguSetupService $paguSetupService
    ) {}

    public function meta(): array
    {
        return $this->paguSetupService->meta();
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   ptk_id?: int,
     *   kelompok_belanja_id?: int,
     *   jenis_belanja_id?: int,
     *   block_status?: string,
     *   search?: string,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     * @return array{rows: Collection, summary: array<string, mixed>, meta: array<string, int>}
     */
    public function list(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 50)));

        $ptkByKsro = DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('pagu_jenis_belanja as pjb', function ($join) {
                $join->on('pjb.id', '=', 'pk.pagu_jenis_belanja_id')->whereNull('pjb.deleted_at');
            })
            ->join('pagu_kelompok_belanja as pkb', function ($join) {
                $join->on('pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')->whereNull('pkb.deleted_at');
            })
            ->join('pagu as p', function ($join) use ($tahun) {
                $join->on('p.id', '=', 'pkb.pagu_id')
                    ->where('p.tahun', '=', $tahun)
                    ->whereNull('p.deleted_at');
            })
            ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
            ->whereNull('pk.deleted_at')
            ->groupBy('pk.ksro_id', 'p.ptk_id', 'pt.nama_satuan_ptk')
            ->select([
                'pk.ksro_id',
                'p.ptk_id',
                'pt.nama_satuan_ptk',
            ]);

        $base = DB::connection(RsudConnections::FINANCE)
            ->table('rba as r')
            ->join('ksro as k', 'k.id', '=', 'r.ksro_id')
            ->leftJoin('jenis_belanja as jb', 'jb.id', '=', 'k.jenis_belanja_id')
            ->leftJoin('kelompok_belanja as kb', 'kb.id', '=', 'k.kelompok_belanja_id')
            ->leftJoinSub($ptkByKsro, 'ptk_map', 'ptk_map.ksro_id', '=', 'k.id')
            ->leftJoin('satuan as s', 's.id', '=', 'r.satuan_id')
            ->leftJoinSub(
                DB::connection(RsudConnections::FINANCE)
                    ->table('rba_block_histori as rbh')
                    ->joinSub(
                        DB::connection(RsudConnections::FINANCE)
                            ->table('rba_block_histori')
                            ->selectRaw('rba_id, MAX(id) as max_id')
                            ->groupBy('rba_id'),
                        'latest_ids',
                        'latest_ids.max_id',
                        '=',
                        'rbh.id'
                    )
                    ->select([
                        'rbh.rba_id',
                        'rbh.block_type',
                        'rbh.block_volume',
                        'rbh.catatan as block_catatan',
                        'rbh.created_at as blocked_at',
                        'rbh.created_by as blocked_by',
                    ]),
                'blk',
                'blk.rba_id',
                '=',
                'r.id'
            )
            ->where('r.tahun', $tahun)
            ->whereNull('r.deleted_at')
            ->whereNull('k.deleted_at');

        if (! empty($filters['ptk_id'])) {
            $base->where('ptk_map.ptk_id', (int) $filters['ptk_id']);
        }
        if (! empty($filters['kelompok_belanja_id'])) {
            $base->where('k.kelompok_belanja_id', (int) $filters['kelompok_belanja_id']);
        }
        if (! empty($filters['jenis_belanja_id'])) {
            $base->where('k.jenis_belanja_id', (int) $filters['jenis_belanja_id']);
        }

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $base->where(function ($q) use ($like) {
                $q->where('k.kode_ksro', 'like', $like)
                    ->orWhere('k.nama_ksro', 'like', $like)
                    ->orWhere('r.nama_komponen', 'like', $like);
            });
        }

        $blockStatus = $filters['block_status'] ?? null;
        if ($blockStatus === 'aktif') {
            $base->where(function ($q) {
                $q->whereNull('blk.block_type')->orWhere('blk.block_type', 'O');
            });
        } elseif ($blockStatus === 'sebagian') {
            $base->where('blk.block_type', 'P');
        } elseif ($blockStatus === 'total') {
            $base->where('blk.block_type', 'T');
        }

        $summaryRow = (clone $base)
            ->selectRaw("
                COUNT(*) as total_rows,
                SUM(CASE WHEN blk.block_type = 'P' THEN 1 ELSE 0 END) as blocked_partial,
                SUM(CASE WHEN blk.block_type = 'T' THEN 1 ELSE 0 END) as blocked_total,
                SUM(CASE WHEN blk.block_type IS NULL OR blk.block_type = 'O' THEN 1 ELSE 0 END) as active_rows,
                SUM(COALESCE(r.total, 0)) as total_nilai,
                SUM(CASE WHEN blk.block_type IN ('P','T') THEN COALESCE(r.total, 0) ELSE 0 END) as blocked_nilai
            ")
            ->first();

        $total = (int) ($summaryRow->total_rows ?? 0);

        $rows = (clone $base)
            ->select([
                'r.id as rba_id',
                'r.tahun',
                'k.ptk_id as ksro_ptk_id',
                'ptk_map.ptk_id',
                'ptk_map.nama_satuan_ptk',
                'k.id as ksro_id',
                'k.kode_ksro',
                'k.nama_ksro',
                'kb.kode_kelompok_belanja',
                'jb.kode_jenis_belanja',
                'r.nama_komponen',
                'r.volume',
                's.nama_satuan',
                'r.harga_satuan',
                'r.total',
                'blk.block_type',
                'blk.block_volume',
                'blk.block_catatan',
                'blk.blocked_at',
                'blk.blocked_by',
            ])
            ->orderBy('ptk_map.nama_satuan_ptk')
            ->orderBy('k.kode_ksro')
            ->orderBy('r.nama_komponen')
            ->forPage($page, $perPage)
            ->get()
            ->map(fn ($row) => $this->mapRow($row));

        return [
            'rows' => $rows,
            'summary' => [
                'total_rows' => $total,
                'blocked_partial' => (int) ($summaryRow->blocked_partial ?? 0),
                'blocked_total' => (int) ($summaryRow->blocked_total ?? 0),
                'active_rows' => (int) ($summaryRow->active_rows ?? 0),
                'total_nilai' => (float) ($summaryRow->total_nilai ?? 0),
                'blocked_nilai' => (float) ($summaryRow->blocked_nilai ?? 0),
            ],
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    /**
     * @return Collection<int, object>
     */
    public function histori(int $rbaId): Collection
    {
        return RbaBlockHistori::query()
            ->where('rba_id', $rbaId)
            ->orderByDesc('id')
            ->get([
                'id',
                'rba_id',
                'block_type',
                'block_volume',
                'catatan',
                'created_at',
                'created_by',
            ]);
    }

    /**
     * @param  array{block_type: string, block_volume?: int, catatan?: string|null}  $data
     */
    public function storeBlock(int $rbaId, array $data, ?string $actor): array
    {
        $rba = Rba::query()
            ->whereNull('deleted_at')
            ->find($rbaId);

        if (! $rba) {
            throw ValidationException::withMessages([
                'rba_id' => ['Komponen RBA tidak ditemukan.'],
            ]);
        }

        $type = strtoupper($data['block_type']);
        if (! in_array($type, ['P', 'T', 'O'], true)) {
            throw ValidationException::withMessages([
                'block_type' => ['Jenis blokir tidak valid.'],
            ]);
        }

        $volume = (int) ($data['block_volume'] ?? 0);
        $rbaVolume = (int) ($rba->volume ?? 0);

        if ($type === 'O') {
            $volume = 0;
        } elseif ($type === 'T') {
            $volume = $rbaVolume > 0 ? $rbaVolume : max(1, $volume);
        } else {
            if ($volume < 1) {
                throw ValidationException::withMessages([
                    'block_volume' => ['Volume blokir wajib diisi minimal 1.'],
                ]);
            }
            if ($rbaVolume > 0 && $volume > $rbaVolume) {
                throw ValidationException::withMessages([
                    'block_volume' => ["Volume blokir tidak boleh melebihi volume RBA ({$rbaVolume})."],
                ]);
            }
        }

        $now = now();

        $histori = RbaBlockHistori::query()->create([
            'rba_id' => $rbaId,
            'block_type' => $type,
            'block_volume' => $volume,
            'catatan' => $data['catatan'] ?? null,
            'created_at' => $now,
            'created_by' => $actor,
            'updated_at' => $now,
            'updated_by' => $actor,
        ]);

        return [
            'histori' => $histori,
            'block_status' => $this->blockStatusLabel($type),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapRow(object $row): array
    {
        $blockType = $row->block_type ?? null;
        $status = $this->resolveStatus($blockType);

        return [
            'rba_id' => (int) $row->rba_id,
            'tahun' => (string) $row->tahun,
            'ptk_id' => (int) ($row->ptk_id ?? 0),
            'nama_satuan_ptk' => $row->nama_satuan_ptk ? (string) $row->nama_satuan_ptk : '—',
            'ksro_id' => (int) $row->ksro_id,
            'kode_ksro' => (string) $row->kode_ksro,
            'nama_ksro' => (string) $row->nama_ksro,
            'kode_kelompok_belanja' => $row->kode_kelompok_belanja ? (string) $row->kode_kelompok_belanja : '—',
            'kode_jenis_belanja' => $row->kode_jenis_belanja ? (string) $row->kode_jenis_belanja : '—',
            'nama_komponen' => (string) $row->nama_komponen,
            'volume' => (int) ($row->volume ?? 0),
            'nama_satuan' => $row->nama_satuan ? (string) $row->nama_satuan : null,
            'harga_satuan' => (float) ($row->harga_satuan ?? 0),
            'total' => (float) ($row->total ?? 0),
            'block_type' => $blockType,
            'block_volume' => $row->block_volume !== null ? (int) $row->block_volume : null,
            'block_catatan' => $row->block_catatan ? (string) $row->block_catatan : null,
            'blocked_at' => $row->blocked_at ? (string) $row->blocked_at : null,
            'blocked_by' => $row->blocked_by ? (string) $row->blocked_by : null,
            'status' => $status['key'],
            'status_label' => $status['label'],
        ];
    }

    /**
     * @return array{key: string, label: string}
     */
    private function resolveStatus(?string $blockType): array
    {
        return match ($blockType) {
            'P' => ['key' => 'sebagian', 'label' => 'Blokir Sebagian'],
            'T' => ['key' => 'total', 'label' => 'Blokir Total'],
            'O', null => ['key' => 'aktif', 'label' => 'Aktif'],
            default => ['key' => 'aktif', 'label' => 'Aktif'],
        };
    }

    private function blockStatusLabel(string $type): string
    {
        return match ($type) {
            'P' => 'Blokir sebagian berhasil dicatat.',
            'T' => 'Blokir total berhasil dicatat.',
            'O' => 'Blokir berhasil dilepas.',
            default => 'Status blokir diperbarui.',
        };
    }
}

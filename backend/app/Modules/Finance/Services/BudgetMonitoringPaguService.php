<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BudgetMonitoringPaguService
{
    private const BULAN_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

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
     *   bulan_from?: int,
     *   bulan_to?: int,
     *   search?: string,
     *   view?: string
     * }  $filters
     * @return array<string, mixed>
     */
    public function dashboard(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;
        $bulanFrom = max(1, min(12, (int) ($filters['bulan_from'] ?? 1)));
        $bulanTo = max($bulanFrom, min(12, (int) ($filters['bulan_to'] ?? 12)));
        $view = $filters['view'] ?? 'monitoring';
        $search = trim((string) ($filters['search'] ?? ''));

        $lines = $this->baseLines($tahun, $filters, $search);
        $ksroIds = $lines->pluck('ksro_id')->map(fn ($id) => (int) $id)->unique()->values()->all();

        $realisasiMap = $this->ajuAmountMap($tahun, $ksroIds, ['CLOSE'], $bulanFrom, $bulanTo);
        $komitmenMap = $this->ajuAmountMap($tahun, $ksroIds, ['DRAFT'], $bulanFrom, $bulanTo);
        $menungguMap = $this->ajuAmountMap($tahun, $ksroIds, ['APPROVED'], $bulanFrom, $bulanTo);
        $realisasiMonthly = $this->ajuMonthlyMap($tahun, $ksroIds, $bulanFrom, $bulanTo);
        $terblokirMap = $this->terblokirMap($tahun, $ksroIds);
        $rbaPaguMap = $this->rbaPaguMap($tahun, $ksroIds);

        $detailRows = [];
        foreach ($lines as $line) {
            $ksroId = (int) $line->ksro_id;
            $pagu = (float) $line->pagu_ksro_total;
            $realisasi = (float) ($realisasiMap[$ksroId] ?? 0);
            $komitmen = (float) ($komitmenMap[$ksroId] ?? 0);
            $menunggu = (float) ($menungguMap[$ksroId] ?? 0);
            $terblokir = (float) ($terblokirMap[$ksroId] ?? 0);
            $sisaPagu = max(0, $pagu - $realisasi);
            $sisaEfektif = max(0, $pagu - $realisasi - $terblokir - $komitmen - $menunggu);
            $serapPct = $pagu > 0 ? round(($realisasi / $pagu) * 100, 2) : 0.0;

            $detailRows[] = [
                'key' => "ksro:{$ksroId}",
                'level' => 'ksro',
                'kode' => $line->kode_ksro,
                'nama' => $line->nama_ksro,
                'ptk_id' => (int) $line->ptk_id,
                'nama_satuan_ptk' => $line->nama_satuan_ptk,
                'jenis_belanja_id' => (int) $line->jenis_belanja_id,
                'kode_jenis_belanja' => $line->kode_jenis_belanja,
                'kelompok_belanja_id' => (int) $line->kelompok_belanja_id,
                'kode_kelompok_belanja' => $line->kode_kelompok_belanja,
                'ksro_id' => $ksroId,
                'pagu' => $pagu,
                'pagu_rba' => (float) ($rbaPaguMap[$ksroId] ?? 0),
                'realisasi' => $realisasi,
                'sisa_pagu' => $sisaPagu,
                'serap_pct' => $serapPct,
                'terblokir' => $terblokir,
                'komitmen' => $komitmen,
                'menunggu_pembayaran' => $menunggu,
                'sisa_efektif' => $sisaEfektif,
                'updated_at' => $line->updated_at ? (string) $line->updated_at : null,
                'status' => $this->statusKey($serapPct, $sisaEfektif, $pagu),
                'status_label' => $this->statusLabel($this->statusKey($serapPct, $sisaEfektif, $pagu)),
            ];
        }

        $rows = match ($view) {
            'per_akun' => $this->aggregateRows($detailRows, 'jenis_belanja'),
            'per_unit' => $this->aggregateRows($detailRows, 'unit'),
            'sisa_pagu' => $this->aggregateRows($detailRows, 'unit'),
            'komitmen' => $detailRows,
            default => $this->aggregateRows($detailRows, 'unit'),
        };

        if ($view === 'sisa_pagu') {
            $rows = collect($rows)->sortBy('sisa_pagu')->values()->all();
        } elseif ($view === 'komitmen') {
            $rows = collect($rows)
                ->filter(fn (array $r) => ($r['komitmen'] + $r['menunggu_pembayaran']) > 0)
                ->sortByDesc(fn (array $r) => $r['komitmen'] + $r['menunggu_pembayaran'])
                ->values()
                ->all();
        } else {
            $rows = collect($rows)->sortByDesc('realisasi')->values()->all();
        }

        $kpi = $this->buildKpi($detailRows);
        $charts = $this->buildCharts($detailRows, $realisasiMonthly, $bulanFrom, $bulanTo);
        $insights = $this->buildInsights($detailRows);

        return [
            'rows' => $rows,
            'kpi' => $kpi,
            'charts' => $charts,
            'insights' => $insights,
            'filters' => [
                'tahun' => (int) $year->tahun,
                'bulan_from' => $bulanFrom,
                'bulan_to' => $bulanTo,
                'view' => $view,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function baseLines(string $tahun, array $filters, string $search): Collection
    {
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
            ->where('p.tahun', $tahun)
            ->select([
                'pk.id as pagu_ksro_id',
                'k.id as ksro_id',
                'k.kode_ksro',
                'k.nama_ksro',
                'p.ptk_id',
                'pt.nama_satuan_ptk',
                'pkb.kelompok_belanja_id',
                'kb.kode_kelompok_belanja',
                'pjb.jenis_belanja_id',
                'jb.kode_jenis_belanja',
                'pk.total_pagu as pagu_ksro_total',
                'pk.updated_at',
            ])
            ->orderBy('pt.nama_satuan_ptk')
            ->orderBy('k.kode_ksro');

        if (! empty($filters['ptk_id'])) {
            $query->where('p.ptk_id', (int) $filters['ptk_id']);
        }
        if (! empty($filters['kelompok_belanja_id'])) {
            $query->where('pkb.kelompok_belanja_id', (int) $filters['kelompok_belanja_id']);
        }
        if (! empty($filters['jenis_belanja_id'])) {
            $query->where('pjb.jenis_belanja_id', (int) $filters['jenis_belanja_id']);
        }
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('k.kode_ksro', 'like', $like)
                    ->orWhere('k.nama_ksro', 'like', $like)
                    ->orWhere('pt.nama_satuan_ptk', 'like', $like)
                    ->orWhere('jb.kode_jenis_belanja', 'like', $like);
            });
        }

        return $query->get();
    }

    /**
     * @param  array<int>  $ksroIds
     * @param  array<int, string>  $statuses
     * @return array<int, float>
     */
    private function ajuAmountMap(
        string $tahun,
        array $ksroIds,
        array $statuses,
        int $bulanFrom,
        int $bulanTo
    ): array {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('aju')
            ->whereNull('deleted_at')
            ->where('tahun', $tahun)
            ->whereIn('ksro_id', $ksroIds)
            ->whereIn('status', $statuses)
            ->whereNotNull('tgl')
            ->whereRaw('MONTH(tgl) BETWEEN ? AND ?', [$bulanFrom, $bulanTo])
            ->selectRaw('ksro_id, SUM(CAST(total AS FLOAT)) as jumlah')
            ->groupBy('ksro_id')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id] = (float) $row->jumlah;
        }

        return $map;
    }

    /**
     * @param  array<int>  $ksroIds
     * @return array<int, array<int, float>>
     */
    private function ajuMonthlyMap(string $tahun, array $ksroIds, int $bulanFrom, int $bulanTo): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('aju')
            ->whereNull('deleted_at')
            ->where('tahun', $tahun)
            ->whereIn('ksro_id', $ksroIds)
            ->where('status', 'CLOSE')
            ->whereNotNull('tgl')
            ->whereRaw('MONTH(tgl) BETWEEN ? AND ?', [$bulanFrom, $bulanTo])
            ->selectRaw('ksro_id, MONTH(tgl) as bulan, SUM(CAST(total AS FLOAT)) as realisasi')
            ->groupByRaw('ksro_id, MONTH(tgl)')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id][(int) $row->bulan] = (float) $row->realisasi;
        }

        return $map;
    }

    /**
     * @param  array<int>  $ksroIds
     * @return array<int, float>
     */
    private function terblokirMap(string $tahun, array $ksroIds): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('rba as r')
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
                    ->select(['rbh.rba_id', 'rbh.block_type', 'rbh.block_volume']),
                'blk',
                'blk.rba_id',
                '=',
                'r.id'
            )
            ->where('r.tahun', $tahun)
            ->whereNull('r.deleted_at')
            ->whereIn('r.ksro_id', $ksroIds)
            ->selectRaw("
                r.ksro_id,
                SUM(CASE
                    WHEN blk.block_type = 'T' THEN COALESCE(r.total, 0)
                    WHEN blk.block_type = 'P' THEN COALESCE(blk.block_volume, 0) * COALESCE(r.harga_satuan, 0)
                    ELSE 0
                END) as terblokir
            ")
            ->groupBy('r.ksro_id')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id] = (float) $row->terblokir;
        }

        return $map;
    }

    /**
     * @param  array<int>  $ksroIds
     * @return array<int, float>
     */
    private function rbaPaguMap(string $tahun, array $ksroIds): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('rba')
            ->where('tahun', $tahun)
            ->whereNull('deleted_at')
            ->whereIn('ksro_id', $ksroIds)
            ->selectRaw('ksro_id, SUM(CAST(total AS FLOAT)) as pagu_rba')
            ->groupBy('ksro_id')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id] = (float) $row->pagu_rba;
        }

        return $map;
    }

    /**
     * @param  array<int, array<string, mixed>>  $detailRows
     * @return array<int, array<string, mixed>>
     */
    private function aggregateRows(array $detailRows, string $group): array
    {
        $groups = [];

        foreach ($detailRows as $row) {
            $key = match ($group) {
                'jenis_belanja' => 'jb:'.$row['jenis_belanja_id'],
                default => 'ptk:'.$row['ptk_id'],
            };

            if (! isset($groups[$key])) {
                $groups[$key] = [
                    'key' => $key,
                    'level' => $group === 'jenis_belanja' ? 'jenis_belanja' : 'unit',
                    'kode' => $group === 'jenis_belanja' ? $row['kode_jenis_belanja'] : 'U'.str_pad((string) $row['ptk_id'], 2, '0', STR_PAD_LEFT),
                    'nama' => $group === 'jenis_belanja'
                        ? 'Belanja '.$row['kode_jenis_belanja']
                        : $row['nama_satuan_ptk'],
                    'ptk_id' => $row['ptk_id'],
                    'nama_satuan_ptk' => $row['nama_satuan_ptk'],
                    'jenis_belanja_id' => $row['jenis_belanja_id'],
                    'kode_jenis_belanja' => $row['kode_jenis_belanja'],
                    'kelompok_belanja_id' => $row['kelompok_belanja_id'],
                    'kode_kelompok_belanja' => $row['kode_kelompok_belanja'],
                    'ksro_id' => null,
                    'pagu' => 0.0,
                    'pagu_rba' => 0.0,
                    'realisasi' => 0.0,
                    'sisa_pagu' => 0.0,
                    'serap_pct' => 0.0,
                    'terblokir' => 0.0,
                    'komitmen' => 0.0,
                    'menunggu_pembayaran' => 0.0,
                    'sisa_efektif' => 0.0,
                    'updated_at' => $row['updated_at'],
                    'status' => 'aman',
                    'status_label' => 'Aman',
                ];
            }

            foreach (['pagu', 'pagu_rba', 'realisasi', 'sisa_pagu', 'terblokir', 'komitmen', 'menunggu_pembayaran', 'sisa_efektif'] as $field) {
                $groups[$key][$field] += $row[$field];
            }

            if ($row['updated_at'] && ($groups[$key]['updated_at'] === null || $row['updated_at'] > $groups[$key]['updated_at'])) {
                $groups[$key]['updated_at'] = $row['updated_at'];
            }
        }

        foreach ($groups as &$group) {
            $group['serap_pct'] = $group['pagu'] > 0
                ? round(($group['realisasi'] / $group['pagu']) * 100, 2)
                : 0.0;
            $group['status'] = $this->statusKey($group['serap_pct'], $group['sisa_efektif'], $group['pagu']);
            $group['status_label'] = $this->statusLabel($group['status']);
        }
        unset($group);

        return array_values($groups);
    }

    /**
     * @param  array<int, array<string, mixed>>  $detailRows
     * @return array<string, float|int>
     */
    private function buildKpi(array $detailRows): array
    {
        $pagu = array_sum(array_column($detailRows, 'pagu'));
        $realisasi = array_sum(array_column($detailRows, 'realisasi'));
        $terblokir = array_sum(array_column($detailRows, 'terblokir'));
        $komitmen = array_sum(array_column($detailRows, 'komitmen'));
        $menunggu = array_sum(array_column($detailRows, 'menunggu_pembayaran'));
        $sisaPagu = max(0, $pagu - $realisasi);
        $sisaEfektif = max(0, $pagu - $realisasi - $terblokir - $komitmen - $menunggu);

        return [
            'total_pagu' => $pagu,
            'total_realisasi' => $realisasi,
            'sisa_pagu' => $sisaPagu,
            'pct_realisasi' => $pagu > 0 ? round(($realisasi / $pagu) * 100, 2) : 0.0,
            'terblokir' => $terblokir,
            'komitmen' => $komitmen,
            'menunggu_pembayaran' => $menunggu,
            'sisa_efektif' => $sisaEfektif,
            'jumlah_baris' => count($detailRows),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $detailRows
     * @param  array<int, array<int, float>>  $realisasiMonthly
     * @return array<string, mixed>
     */
    private function buildCharts(array $detailRows, array $realisasiMonthly, int $bulanFrom, int $bulanTo): array
    {
        $totalPagu = array_sum(array_column($detailRows, 'pagu'));
        $totalRealisasi = array_sum(array_column($detailRows, 'realisasi'));

        $monthly = [];
        $cumulative = 0.0;
        for ($bulan = $bulanFrom; $bulan <= $bulanTo; $bulan++) {
            $realisasiBulan = 0.0;
            foreach ($realisasiMonthly as $byKsro) {
                $realisasiBulan += (float) ($byKsro[$bulan] ?? 0);
            }
            $cumulative += $realisasiBulan;
            $monthly[] = [
                'bulan' => $bulan,
                'nama_bulan' => self::BULAN_LABELS[$bulan],
                'realisasi' => $realisasiBulan,
                'sisa_pagu' => max(0, $totalPagu - $cumulative),
                'serap_pct' => $totalPagu > 0 ? round(($cumulative / $totalPagu) * 100, 2) : 0.0,
            ];
        }

        $perUnit = [];
        $unitGroups = [];
        foreach ($detailRows as $row) {
            $id = (int) $row['ptk_id'];
            if (! isset($unitGroups[$id])) {
                $unitGroups[$id] = [
                    'label' => $row['nama_satuan_ptk'],
                    'realisasi' => 0.0,
                    'pagu' => 0.0,
                ];
            }
            $unitGroups[$id]['realisasi'] += $row['realisasi'];
            $unitGroups[$id]['pagu'] += $row['pagu'];
        }
        foreach ($unitGroups as $group) {
            $perUnit[] = $group;
        }
        usort($perUnit, fn ($a, $b) => $b['realisasi'] <=> $a['realisasi']);
        $perUnit = array_slice($perUnit, 0, 8);

        $perJenis = [];
        $jenisGroups = [];
        foreach ($detailRows as $row) {
            $id = (int) $row['jenis_belanja_id'];
            if (! isset($jenisGroups[$id])) {
                $jenisGroups[$id] = [
                    'label' => $row['kode_jenis_belanja'],
                    'realisasi' => 0.0,
                    'pagu' => 0.0,
                ];
            }
            $jenisGroups[$id]['realisasi'] += $row['realisasi'];
            $jenisGroups[$id]['pagu'] += $row['pagu'];
        }
        foreach ($jenisGroups as $group) {
            $perJenis[] = $group;
        }
        usort($perJenis, fn ($a, $b) => $b['realisasi'] <=> $a['realisasi']);
        $perJenis = array_slice($perJenis, 0, 6);

        return [
            'monthly' => $monthly,
            'absorption' => [
                'realisasi' => $totalRealisasi,
                'sisa_pagu' => max(0, $totalPagu - $totalRealisasi),
                'pct' => $totalPagu > 0 ? round(($totalRealisasi / $totalPagu) * 100, 2) : 0.0,
            ],
            'per_unit' => $perUnit,
            'per_jenis_belanja' => $perJenis,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $detailRows
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function buildInsights(array $detailRows): array
    {
        $topRealisasi = collect($detailRows)
            ->sortByDesc('realisasi')
            ->take(10)
            ->values()
            ->map(fn (array $row, int $idx) => [
                'no' => $idx + 1,
                'kode' => $row['kode'],
                'nama' => $row['nama'],
                'realisasi' => $row['realisasi'],
                'serap_pct' => $row['serap_pct'],
            ])
            ->all();

        $almostEmpty = collect($detailRows)
            ->filter(fn (array $row) => $row['pagu'] > 0 && ($row['serap_pct'] >= 85 || $row['sisa_efektif'] <= $row['pagu'] * 0.1))
            ->sortBy('sisa_efektif')
            ->take(10)
            ->values()
            ->map(fn (array $row, int $idx) => [
                'no' => $idx + 1,
                'kode' => $row['kode'],
                'nama' => $row['nama'],
                'sisa_pagu' => $row['sisa_efektif'],
                'serap_pct' => $row['serap_pct'],
                'status' => $row['status'],
                'status_label' => $row['status_label'],
            ])
            ->all();

        return [
            'top_realisasi' => $topRealisasi,
            'almost_empty' => $almostEmpty,
        ];
    }

    private function statusKey(float $serapPct, float $sisaEfektif, float $pagu): string
    {
        if ($pagu <= 0) {
            return 'aman';
        }
        if ($serapPct >= 90 || $sisaEfektif <= $pagu * 0.05) {
            return 'kritis';
        }
        if ($serapPct >= 75 || $sisaEfektif <= $pagu * 0.15) {
            return 'waspada';
        }

        return 'aman';
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'kritis' => 'Hampir Habis',
            'waspada' => 'Perlu Perhatian',
            default => 'Aman',
        };
    }
}
